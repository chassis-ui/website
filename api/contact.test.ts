import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const send = vi.fn()

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  }
}))

const { default: handler } = await import('./contact')

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines',
  topic: 'figma-components'
}

function post(
  fields: Record<string, string>,
  headers: Record<string, string> = {},
  url = 'https://chassis-ui.com/api/contact'
): Request {
  const body = new FormData()

  for (const [name, value] of Object.entries(fields)) {
    body.append(name, value)
  }

  return new Request(url, {
    method: 'POST',
    headers: { Origin: new URL(url).origin, ...headers },
    body
  })
}

async function json(response: Response) {
  return { status: response.status, body: await response.json() }
}

beforeEach(() => {
  send.mockResolvedValue({ data: { id: 'email-1' }, error: null })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  send.mockReset()
})

describe('POST /api/contact', () => {
  test('sends the inquiry and answers ok', async () => {
    expect(await json(await handler(post(valid)))).toEqual({ status: 200, body: { ok: true } })
    expect(send).toHaveBeenCalledOnce()

    const [message] = send.mock.calls[0]

    expect(message).toMatchObject({
      replyTo: 'ada@example.com',
      subject: 'Support inquiry: Figma Components from Ada Lovelace'
    })
    expect(message.html).toContain('<strong>Company:</strong> Analytical Engines')
    expect(message.html).toContain('<strong>Topic:</strong> Figma Components')
  })

  test('trims the fields', async () => {
    await handler(post({ ...valid, name: '  Ada  ', email: ' ada@example.com ' }))

    expect(send.mock.calls[0][0]).toMatchObject({
      replyTo: 'ada@example.com',
      subject: 'Support inquiry: Figma Components from Ada'
    })
  })

  test('shows a dash for a missing company', async () => {
    await handler(post({ name: valid.name, email: valid.email, topic: valid.topic }))

    expect(send.mock.calls[0][0].html).toContain('<strong>Company:</strong> —')
  })

  test.each(['name', 'email', 'topic'])('rejects a request without %s', async (field) => {
    const response = await handler(post({ ...valid, [field]: '   ' }))

    expect(await json(response)).toEqual({
      status: 400,
      body: { error: 'Name, email and topic are required.' }
    })
    expect(send).not.toHaveBeenCalled()
  })

  test('rejects an invalid email address', async () => {
    const response = await handler(post({ ...valid, email: 'ada@example' }))

    expect(await json(response)).toEqual({
      status: 400,
      body: { error: 'Please provide a valid email address.' }
    })
  })

  test('rejects an unknown topic', async () => {
    const response = await handler(post({ ...valid, topic: 'pricing' }))

    expect(await json(response)).toEqual({
      status: 400,
      body: { error: 'Invalid topic selected.' }
    })
  })

  test('answers ok to a filled honeypot, and sends nothing', async () => {
    const response = await handler(post({ ...valid, website: 'https://spam.test' }))

    expect(await json(response)).toEqual({ status: 200, body: { ok: true } })
    expect(send).not.toHaveBeenCalled()
  })

  test('rejects a body that is not form data', async () => {
    const request = new Request('https://chassis-ui.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://chassis-ui.com' },
      body: '{"name":"Ada"}'
    })

    expect(await json(await handler(request))).toEqual({
      status: 400,
      body: { error: 'Invalid request body' }
    })
  })

  test('escapes the values in the message', async () => {
    await handler(
      post({
        ...valid,
        name: '<img src=x onerror=alert(1)>',
        email: '"><b>@example.com',
        company: 'A & B'
      })
    )

    const { html } = send.mock.calls[0][0]

    expect(html).toContain('<strong>Name:</strong> &lt;img src=x onerror=alert(1)&gt;</p>')
    expect(html).toContain('href="mailto:&quot;&gt;&lt;b&gt;@example.com"')
    expect(html).toContain('<strong>Company:</strong> A &amp; B</p>')
    expect(html).not.toContain('<img')
  })

  test('keeps the subject on one line', async () => {
    await handler(post({ ...valid, name: 'Ada\r\nBcc: victim@example.com' }))

    expect(send.mock.calls[0][0].subject).toBe(
      'Support inquiry: Figma Components from Ada Bcc: victim@example.com'
    )
  })

  test.each([
    ['name', 101],
    ['email', 255],
    ['company', 101]
  ])('rejects a %s longer than %i characters', async (field, length) => {
    const value = field === 'email' ? `${'a'.repeat(length - 12)}@example.com` : 'a'.repeat(length)
    const response = await handler(post({ ...valid, [field]: value }))

    expect(await json(response)).toEqual({
      status: 400,
      body: { error: 'One of the fields is too long.' }
    })
    expect(send).not.toHaveBeenCalled()
  })

  test('accepts fields at their limits', async () => {
    const response = await handler(
      post({
        ...valid,
        name: 'a'.repeat(100),
        email: `${'a'.repeat(242)}@example.com`,
        company: 'a'.repeat(100)
      })
    )

    expect(response.status).toBe(200)
  })

  test('rejects an oversized body', async () => {
    const response = await handler(post({ ...valid, company: 'a'.repeat(9000) }))

    expect(await json(response)).toEqual({ status: 413, body: { error: 'Request too large' } })
    expect(send).not.toHaveBeenCalled()
  })

  test('rejects an oversized body by its Content-Length', async () => {
    const response = await handler(post(valid, { 'Content-Length': '9000' }))

    expect(response.status).toBe(413)
  })

  test.each(['constructor', '__proto__', 'toString'])(
    'rejects the inherited property %s as a topic',
    async (topic) => {
      const response = await handler(post({ ...valid, topic }))

      expect(response.status).toBe(400)
      expect(send).not.toHaveBeenCalled()
    }
  )

  test('answers 500 when Resend reports an error', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'Invalid API key' } })

    expect((await handler(post(valid))).status).toBe(500)
  })

  test('answers 500 when the request to Resend fails', async () => {
    send.mockRejectedValue(new Error('Network down'))

    expect(await json(await handler(post(valid)))).toEqual({
      status: 500,
      body: { error: 'Failed to send message. Please try again.' }
    })
  })
})

describe('origin', () => {
  test('rejects a request from another site', async () => {
    const response = await handler(post(valid, { Origin: 'https://evil.example' }))

    expect(await json(response)).toEqual({ status: 403, body: { error: 'Forbidden' } })
    expect(send).not.toHaveBeenCalled()
  })

  test('rejects a request without an origin', async () => {
    const request = post(valid)
    request.headers.delete('origin')

    expect((await handler(request)).status).toBe(403)
    expect(send).not.toHaveBeenCalled()
  })

  test('rejects an origin that is not a URL', async () => {
    expect((await handler(post(valid, { Origin: 'null' }))).status).toBe(403)
  })

  test('accepts the host the request was sent to', async () => {
    const request = post(valid, {}, 'https://staging.chassis-ui.com/api/contact')

    expect((await handler(request)).status).toBe(200)
  })
})

describe('other methods', () => {
  test.each(['GET', 'PUT', 'DELETE'])('rejects %s', async (method) => {
    const response = await handler(new Request('https://chassis-ui.com/api/contact', { method }))

    expect(response.status).toBe(405)
    expect(send).not.toHaveBeenCalled()
  })
})

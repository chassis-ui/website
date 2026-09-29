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

function post(fields: Record<string, string>): Request {
  const body = new FormData()

  for (const [name, value] of Object.entries(fields)) {
    body.append(name, value)
  }

  return new Request('https://chassis-ui.com/api/contact', { method: 'POST', body })
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
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"Ada"}'
    })

    expect(await json(await handler(request))).toEqual({
      status: 400,
      body: { error: 'Invalid request body' }
    })
  })

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

describe('other methods', () => {
  test.each(['GET', 'PUT', 'DELETE'])('rejects %s', async (method) => {
    const response = await handler(new Request('https://chassis-ui.com/api/contact', { method }))

    expect(response.status).toBe(405)
    expect(send).not.toHaveBeenCalled()
  })
})

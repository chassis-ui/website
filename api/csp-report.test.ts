import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest'

const { default: handler } = await import('./csp-report')

let warn: MockInstance<typeof console.warn>

function post(body: string, type = 'application/csp-report'): Request {
  return new Request('https://chassis-ui.com/api/csp-report', {
    method: 'POST',
    headers: { 'Content-Type': type },
    body
  })
}

function logged() {
  return warn.mock.calls.map(([, line]) => JSON.parse(line))
}

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('POST /api/csp-report', () => {
  test('logs a report-uri report', async () => {
    const response = await handler(
      post(
        JSON.stringify({
          'csp-report': {
            'document-uri': 'https://chassis-ui.com/css/docs/?q=secret',
            'violated-directive': 'script-src-elem',
            'effective-directive': 'script-src-elem',
            'blocked-uri': 'https://evil.example/x.js',
            'source-file': 'https://chassis-ui.com/css/docs/'
          }
        })
      )
    )

    expect(response.status).toBe(204)
    expect(logged()).toEqual([
      {
        directive: 'script-src-elem',
        blocked: 'https://evil.example/x.js',
        page: '/css/docs/',
        source: 'https://chassis-ui.com/css/docs/'
      }
    ])
  })

  test('logs the violations of a Reporting API batch and skips other types', async () => {
    const response = await handler(
      post(
        JSON.stringify([
          {
            type: 'csp-violation',
            body: {
              documentURL: 'https://chassis-ui.com/',
              effectiveDirective: 'img-src',
              blockedURL: 'https://tracker.example/p.gif',
              sourceFile: ''
            }
          },
          { type: 'deprecation', body: { id: 'x' } }
        ]),
        'application/reports+json'
      )
    )

    expect(response.status).toBe(204)
    expect(logged()).toEqual([
      { directive: 'img-src', blocked: 'https://tracker.example/p.gif', page: '/', source: '' }
    ])
  })

  test('logs at most 20 violations of one request', async () => {
    const entry = { type: 'csp-violation', body: { effectiveDirective: 'img-src' } }

    await handler(post(JSON.stringify(Array(50).fill(entry)), 'application/reports+json'))

    expect(warn).toHaveBeenCalledTimes(20)
  })

  test('shortens long values', async () => {
    await handler(post(JSON.stringify({ 'csp-report': { 'blocked-uri': 'a'.repeat(1000) } })))

    expect(logged()[0].blocked).toHaveLength(300)
  })

  test('rejects a body that is not JSON', async () => {
    expect((await handler(post('not json'))).status).toBe(400)
    expect(warn).not.toHaveBeenCalled()
  })

  test('rejects an oversized body', async () => {
    const response = await handler(post(JSON.stringify({ 'csp-report': { x: 'a'.repeat(70000) } })))

    expect(response.status).toBe(413)
    expect(warn).not.toHaveBeenCalled()
  })

  test('answers 204 to JSON that holds no report', async () => {
    expect((await handler(post('{}'))).status).toBe(204)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('other methods', () => {
  test('rejects GET', async () => {
    const response = await handler(new Request('https://chassis-ui.com/api/csp-report'))

    expect(response.status).toBe(405)
  })
})

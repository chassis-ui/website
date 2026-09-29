export const config = { runtime: 'edge' }

// Receives the reports of `Content-Security-Policy-Report-Only`, set in `vercel.json`, and
// writes one line per violation to the function log. The policy covers the proxied sibling
// sites too, so their violations arrive here as well.

// One report is well under 4 KB. A browser that batches sends a few at a time.
const MAX_BODY_BYTES = 64 * 1024
const MAX_LOGGED = 20

type Violation = {
  directive: string
  blocked: string
  page: string
  source: string
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, 300) : ''
}

// Keeps the path of the page and drops the query, which can carry anything.
function pagePath(value: unknown): string {
  try {
    return new URL(text(value)).pathname
  } catch {
    return text(value)
  }
}

// `report-uri` sends `{ "csp-report": { ... } }` with kebab-case keys. The Reporting API
// sends an array of `{ type: "csp-violation", body: { ... } }` with camelCase keys.
function violations(payload: unknown): Violation[] {
  const reports: Record<string, unknown>[] = []

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      if (entry?.type === 'csp-violation' && entry.body) reports.push(entry.body)
    }
  } else if (payload && typeof payload === 'object' && 'csp-report' in payload) {
    reports.push((payload as Record<string, Record<string, unknown>>)['csp-report'])
  }

  return reports.map((report) => ({
    directive: text(
      report.effectiveDirective ?? report['effective-directive'] ?? report['violated-directive']
    ),
    blocked: text(report.blockedURL ?? report['blocked-uri']),
    page: pagePath(report.documentURL ?? report['document-uri']),
    source: text(report.sourceFile ?? report['source-file'])
  }))
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 })
  }

  let payload: unknown
  try {
    const body = await request.text()

    if (body.length > MAX_BODY_BYTES) return new Response(null, { status: 413 })

    payload = JSON.parse(body)
  } catch {
    return new Response(null, { status: 400 })
  }

  for (const violation of violations(payload).slice(0, MAX_LOGGED)) {
    console.warn('CSP violation', JSON.stringify(violation))
  }

  return new Response(null, { status: 204 })
}

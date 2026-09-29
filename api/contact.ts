import { Resend } from 'resend'

export const config = { runtime: 'edge' }

const resend = new Resend(process.env.RESEND_API_KEY)

const TOPIC_LABELS: Record<string, string> = {
  'setting-up-chassis': 'Setting up Chassis',
  'design-system-architecture': 'Design System Architecture',
  'figma-components': 'Figma Components',
  'token-integration': 'Token Integration',
  other: 'Other'
}

// The form sends four short fields. Anything larger is not from the form.
const MAX_BODY_BYTES = 8 * 1024

// The same limits are set as `maxlength` on the form in `SupportSection.astro`.
const MAX_LENGTHS = { name: 100, email: 254, company: 100 } as const

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

// The form is served from the same host as this endpoint, on every environment. A browser
// always sends `Origin` with a POST, so a missing or foreign one means another site, or no
// browser at all.
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const hosts = [
    request.headers.get('x-forwarded-host'),
    request.headers.get('host'),
    new URL(request.url).host
  ]

  if (!origin) return false

  try {
    return hosts.includes(new URL(origin).host)
  } catch {
    return false
  }
}

// Reads the body up to `MAX_BODY_BYTES` and stops there. A `Content-Length` header is not
// enough, because a chunked request has none. Returns `null` when the body is larger.
async function readBody(request: Request): Promise<Uint8Array<ArrayBuffer> | null> {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return null
  if (!request.body) return new Uint8Array()

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0

  for (;;) {
    const { done, value } = await reader.read()

    if (done) break

    size += value.byteLength

    if (size > MAX_BODY_BYTES) return null

    chunks.push(value)
  }

  const body = new Uint8Array(size)
  let offset = 0

  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  return body
}

// Collapses control characters, line breaks included, so that a value stays on one line in
// the subject and in the message.
function singleLine(value: FormDataEntryValue | null): string {
  return (value?.toString() ?? '')
    .replace(/\p{Cc}+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  if (!isSameOrigin(request)) {
    return reply(403, { error: 'Forbidden' })
  }

  const body = await readBody(request)

  if (!body) {
    return reply(413, { error: 'Request too large' })
  }

  let data: FormData
  try {
    data = await new Response(body, { headers: request.headers }).formData()
  } catch {
    return reply(400, { error: 'Invalid request body' })
  }

  // Honeypot — bots fill this hidden field; real users don't
  if (data.get('website')) {
    return reply(200, { ok: true })
  }

  const name = singleLine(data.get('name'))
  const email = singleLine(data.get('email'))
  const company = singleLine(data.get('company'))
  const topic = singleLine(data.get('topic'))

  // Server-side validation
  if (!name || !email || !topic) {
    return reply(400, { error: 'Name, email and topic are required.' })
  }

  if (
    name.length > MAX_LENGTHS.name ||
    email.length > MAX_LENGTHS.email ||
    company.length > MAX_LENGTHS.company
  ) {
    return reply(400, { error: 'One of the fields is too long.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply(400, { error: 'Please provide a valid email address.' })
  }

  if (!Object.hasOwn(TOPIC_LABELS, topic)) {
    return reply(400, { error: 'Invalid topic selected.' })
  }

  const topicLabel = TOPIC_LABELS[topic]

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Chassis Support <noreply@chassis-ui.com>',
      to: process.env.RESEND_TO_EMAIL ?? 'support@chassis-ui.com',
      replyTo: email,
      subject: `Support inquiry: ${topicLabel} from ${name}`,
      html: `
        <h2>New Support Inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>Company:</strong> ${company ? escapeHtml(company) : '—'}</p>
        <p><strong>Topic:</strong> ${topicLabel}</p>
      `
    })

    if (error) {
      console.error('Resend API error:', error)
      return reply(500, { error: 'Failed to send message. Please try again.' })
    }
  } catch (err) {
    console.error('Resend request failed:', err)
    return reply(500, { error: 'Failed to send message. Please try again.' })
  }

  return reply(200, { ok: true })
}

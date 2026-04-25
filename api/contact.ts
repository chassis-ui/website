import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const TOPIC_LABELS: Record<string, string> = {
  'setting-up-chassis': 'Setting up Chassis',
  'design-system-architecture': 'Design System Architecture',
  'figma-components': 'Figma Components',
  'token-integration': 'Token Integration',
  other: 'Other'
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let data: FormData
  try {
    data = await request.formData()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Honeypot — bots fill this hidden field; real users don't
  if (data.get('website')) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const name = data.get('name')?.toString().trim()
  const email = data.get('email')?.toString().trim()
  const company = data.get('company')?.toString().trim()
  const topic = data.get('topic')?.toString().trim()

  // Server-side validation
  if (!name || !email || !topic) {
    return new Response(JSON.stringify({ error: 'Name, email and topic are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Please provide a valid email address.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (!TOPIC_LABELS[topic]) {
    return new Response(JSON.stringify({ error: 'Invalid topic selected.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const topicLabel = TOPIC_LABELS[topic]

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Chassis Support <noreply@chassis-ui.com>',
      to: process.env.RESEND_TO_EMAIL ?? 'support@chassis-ui.com',
      replyTo: email,
      subject: `Support inquiry: ${topicLabel} from ${name}`,
      html: `
        <h2>New Support Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Company:</strong> ${company || '—'}</p>
        <p><strong>Topic:</strong> ${topicLabel}</p>
      `
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to send message. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

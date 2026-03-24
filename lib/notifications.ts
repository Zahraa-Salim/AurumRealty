import 'server-only'

import { Resend } from 'resend'

let resendClient: Resend | null = null

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null

  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }

  return resendClient
}

function parseRecipients(value: string | undefined) {
  return (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

async function sendEmail({
  subject,
  text,
  recipients,
  replyTo,
}: {
  subject: string
  text: string
  recipients: string[]
  replyTo?: string
}) {
  const client = getResendClient()
  const from = process.env.RESEND_FROM_EMAIL

  if (!client || !from || recipients.length === 0) {
    return
  }

  try {
    await client.emails.send({
      from,
      to: recipients,
      subject,
      text,
      replyTo,
    })
  } catch (error) {
    console.error('Notification email failed:', error)
  }
}

export async function sendContactNotification(data: {
  name: string
  email: string
  phone?: string | null
  message: string
}) {
  const recipients = parseRecipients(
    process.env.CONTACT_NOTIFICATION_TO ?? process.env.RESEND_NOTIFICATION_TO
  )

  await sendEmail({
    recipients,
    subject: `New contact message from ${data.name}`,
    replyTo: data.email,
    text: [
      'A new contact form submission was received.',
      '',
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone || 'Not provided'}`,
      '',
      'Message:',
      data.message,
    ].join('\n'),
  })
}

export async function sendShowingNotification(data: {
  type: string
  propertyName: string
  name: string
  email: string
  phone?: string | null
  date?: string | null
  time?: string | null
  message?: string | null
}) {
  const recipients = parseRecipients(
    process.env.SHOWINGS_NOTIFICATION_TO ?? process.env.RESEND_NOTIFICATION_TO
  )

  await sendEmail({
    recipients,
    subject: `New ${data.type === 'agent_enquiry' ? 'agent enquiry' : 'showing request'} from ${data.name}`,
    replyTo: data.email,
    text: [
      'A new property enquiry was received.',
      '',
      `Type: ${data.type}`,
      `Property: ${data.propertyName || 'Not provided'}`,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone || 'Not provided'}`,
      `Date: ${data.date || 'Not provided'}`,
      `Time: ${data.time || 'Not provided'}`,
      '',
      'Message:',
      data.message || 'No message provided.',
    ].join('\n'),
  })
}

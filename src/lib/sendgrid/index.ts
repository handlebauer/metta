import sgMail from '@sendgrid/mail'

if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY is not set')
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// SendGrid Inbound Parse webhook payload type
// https://docs.sendgrid.com/for-developers/parsing-email/inbound-email
export interface SendGridInboundPayload {
    headers: string
    dkim: string
    content_ids: string
    to: string
    html: string
    from: string
    text: string
    sender_ip: string
    envelope: string
    attachments: number
    subject: string
    charsets: string
    SPF: string
    spam_score: string
    spam_report: string
    email: string // The raw email
    from_name?: string
    attachment_info?: string
    attachment?: string
    attachment_count?: number
    [key: `attachment_${number}`]: string // Dynamic attachment fields
}

export const sendgrid = sgMail

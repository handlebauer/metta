import { sendgrid } from '@/lib/sendgrid'

if (!process.env.SENDGRID_TEST_EMAIL) {
    throw new Error('SENDGRID_TEST_EMAIL is not set')
}

const msg = {
    to: process.env.SENDGRID_TEST_EMAIL,
    from: 'test@metta.now',
    subject: '[Test] Metta Email Service',
    text: 'This is a test email from the Metta email service.',
    html: '<strong>This is a test email from the Metta email service.</strong>',
}

try {
    await sendgrid.send(msg)
    console.log('Test email sent successfully!')
} catch (error) {
    console.error('Error sending test email:', error)
    process.exit(1)
}

import { createElement } from 'react'
import { render } from '@react-email/render'

import { NewAgentTicketNotification } from '@/components/emails/new-agent-ticket-notification'
import { sendgrid } from '@/lib/sendgrid'

import type { TicketRow } from '@/lib/schemas/ticket.schemas'
import type { UserRow } from '@/lib/schemas/user.schemas'

export class EmailService {
    static async sendNewTicketNotification(ticket: TicketRow, agent: UserRow) {
        if (!agent.email) {
            console.error('Agent email not found')
            throw new Error('Agent email not found')
        }

        let to: string
        let from: string
        if (process.env.NODE_ENV === 'development') {
            to = process.env.SENDGRID_TEST_EMAIL!
            from = 'test@metta.now'
        } else {
            /**
             * XXX: FOR NOW, JUST SEND TO THE TEST USER IN PRODUCTION
             */
            to = process.env.SENDGRID_TEST_EMAIL!
            from = 'support@metta.now'
        }

        try {
            // Render the React email template to HTML
            const html = await render(
                createElement(NewAgentTicketNotification, { ticket }),
            )

            const msg = {
                to,
                from,
                subject: `[Metta] ${ticket.subject} (#${ticket.id})`,
                html,
            }

            await sendgrid.send(msg)
            return { success: true }
        } catch (error) {
            console.error('Failed to send email notification:', error)
            throw error
        }
    }
}

import { NewTicketNotification } from '@/components/emails/new-ticket-notification'
import { resend } from '@/lib/resend'

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
            to = process.env.RESEND_TEST_USER_EMAIL!
            from = 'Metta Support <dev@metta.now>'
        } else {
            /**
             * XXX: FOR NOW, JUST SEND TO THE TEST USER IN PRODUCTION
             */
            to = process.env.RESEND_TEST_USER_EMAIL!
            from = 'Metta Support <support@metta.now>'
        }

        try {
            const { data, error } = await resend.emails.send({
                from,
                to,
                subject: `New Ticket Assigned: ${ticket.subject}`,
                react: await NewTicketNotification({ ticket }),
            })

            if (error) {
                console.error('Failed to send email notification:', error)
                throw error
            }

            return data
        } catch (error) {
            console.error('Failed to send email notification:', error)
            throw error
        }
    }
}

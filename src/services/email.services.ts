import { createElement } from 'react'
import { render } from '@react-email/render'

import { AgentReplyNotification } from '@/components/emails/agent-reply-notification'
import { CustomerReplyNotification } from '@/components/emails/customer-reply-notification'
import { NewAgentTicketNotification } from '@/components/emails/new-agent-ticket-notification'
import { sendgrid } from '@/lib/sendgrid'
import { createServiceClient } from '@/lib/supabase/service'

import type { TicketRow } from '@/lib/schemas/ticket.schemas'
import type { UserRow } from '@/lib/schemas/user.schemas'

export class EmailService {
    /**
     * Get a test user for development mode
     * This helps us maintain proper user roles while testing email flows
     */
    static async getTestUser(
        role: 'agent' | 'customer',
    ): Promise<UserRow | null> {
        if (process.env.NODE_ENV !== 'development') return null

        const supabase = createServiceClient()
        const { data } = await supabase
            .from('users')
            .select('*, profiles(*)')
            .eq('profiles.role', role)
            .limit(1)
            .single()

        return data
    }

    private static async sendEmail(options: {
        to: string
        subject: string
        html: string
        role?: 'agent' | 'customer' // Used to determine email direction in development
    }) {
        let from: string
        if (process.env.NODE_ENV === 'development') {
            // In development:
            // - If sending TO a customer, use test email as recipient
            // - If sending TO an agent, use a different test email to see both sides
            if (options.role === 'customer') {
                options.to = process.env.SENDGRID_TEST_EMAIL!
            } else {
                // For agent notifications, use a different test email if provided
                options.to =
                    process.env.SENDGRID_TEST_EMAIL_AGENT ||
                    process.env.SENDGRID_TEST_EMAIL!
            }
            from = 'test@metta.now'
        } else {
            /**
             * XXX: FOR NOW, JUST SEND TO THE TEST USER IN PRODUCTION
             */
            options.to = process.env.SENDGRID_TEST_EMAIL!
            from = 'support@metta.now'
        }

        try {
            const msg = {
                to: options.to,
                from,
                subject: options.subject,
                html: options.html,
            }

            console.log('[Email] Sending to:', {
                to: msg.to,
                from: msg.from,
                subject: msg.subject,
                role: options.role,
            })

            await sendgrid.send(msg)
            return { success: true }
        } catch (error) {
            console.error('Failed to send email:', error)
            throw error
        }
    }

    static async sendNewTicketNotification(ticket: TicketRow, agent: UserRow) {
        if (!agent.email) {
            console.error('Agent email not found')
            throw new Error('Agent email not found')
        }

        const html = await render(
            createElement(NewAgentTicketNotification, { ticket }),
        )

        return this.sendEmail({
            to: agent.email,
            subject: `[Metta] New ticket assigned: ${ticket.subject} (#${ticket.id})`,
            html,
            role: 'agent',
        })
    }

    static async sendAgentReplyNotification(
        ticket: TicketRow,
        customer: UserRow,
        messageContent: string,
    ) {
        if (!customer.email) {
            console.error('Customer email not found')
            throw new Error('Customer email not found')
        }

        const html = await render(
            createElement(AgentReplyNotification, { ticket, messageContent }),
        )

        return this.sendEmail({
            to: customer.email,
            subject: `Re: [Metta] ${ticket.subject} (#${ticket.id})`,
            html,
            role: 'customer',
        })
    }

    static async sendCustomerReplyNotification(
        ticket: TicketRow,
        agent: UserRow,
        customer: UserRow,
        messageContent: string,
    ) {
        if (!agent.email) {
            console.error('Agent email not found')
            throw new Error('Agent email not found')
        }

        const html = await render(
            createElement(CustomerReplyNotification, {
                ticket,
                customer,
                messageContent,
            }),
        )

        return this.sendEmail({
            to: agent.email,
            subject: `Re: [Metta] ${ticket.subject} (#${ticket.id})`,
            html,
            role: 'agent',
        })
    }
}

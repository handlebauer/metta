import { createElement } from 'react'
import { render } from '@react-email/render'

import { sendgrid } from '@/lib/sendgrid'
import { createServiceClient } from '@/lib/supabase/service'
import { AgentReplyNotification } from '@/components/emails/agent-reply-notification'
import { CustomerReplyNotification } from '@/components/emails/customer-reply-notification'
import { NewAdminTicketNotification } from '@/components/emails/new-admin-ticket-notification'
import { NewAgentTicketNotification } from '@/components/emails/new-agent-ticket-notification'
import { NewCustomerTicketNotification } from '@/components/emails/new-customer-ticket-notification'
import { TicketReopenedNotification } from '@/components/emails/ticket-reopened-notification'
import { TicketResolutionNotification } from '@/components/emails/ticket-resolution-notification'

import type { TicketRow } from '@/lib/schemas/ticket.schemas'
import type { UserWithProfile } from '@/lib/schemas/user-with-profile.schemas'
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
        role?: 'agent' | 'customer' | 'admin' // Used to determine email direction in development
    }) {
        let from: string
        if (process.env.NODE_ENV === 'development') {
            // In development:
            // - If sending TO a customer, use test email as recipient
            // - If sending TO an agent/admin, use a different test email to see both sides
            if (options.role === 'customer') {
                options.to = process.env.SENDGRID_TEST_EMAIL!
            } else {
                // For agent/admin notifications, use a different test email if provided
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
                mail_settings: {
                    click_tracking: {
                        enable: false,
                    },
                },
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

    static async sendNewAdminTicketNotification(
        ticket: TicketRow,
        admin: UserWithProfile,
        customer: UserWithProfile,
    ) {
        if (!admin.email) {
            console.error('Admin email not found')
            throw new Error('Admin email not found')
        }

        const html = await render(
            createElement(NewAdminTicketNotification, { ticket, customer }),
        )

        return this.sendEmail({
            to: admin.email,
            subject: `[Metta] New support ticket: ${ticket.subject} (#${ticket.id})`,
            html,
            role: 'admin',
        })
    }

    static async sendAgentReplyNotification(
        ticket: TicketRow,
        customer: UserRow,
        messageContent: string,
        accessToken: string,
    ) {
        if (!customer.email) {
            console.error('Customer email not found')
            throw new Error('Customer email not found')
        }

        const html = await render(
            createElement(AgentReplyNotification, {
                ticket,
                messageContent,
                accessToken,
            }),
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

    static async sendTicketResolutionNotification(
        ticket: TicketRow,
        customer: UserRow,
        accessToken: string,
    ) {
        if (!customer.email) {
            console.error('Customer email not found')
            throw new Error('Customer email not found')
        }

        const html = await render(
            createElement(TicketResolutionNotification, {
                ticket,
                accessToken,
            }),
        )

        return this.sendEmail({
            to: customer.email,
            subject: `[Metta] Ticket resolved: ${ticket.subject} (#${ticket.id})`,
            html,
            role: 'customer',
        })
    }

    static async sendTicketReopenedNotification(
        ticket: TicketRow,
        customer: UserRow,
        reopenReason: string,
    ) {
        if (!customer.email) {
            console.error('Customer email not found')
            throw new Error('Customer email not found')
        }

        const html = await render(
            createElement(TicketReopenedNotification, { ticket, reopenReason }),
        )

        return this.sendEmail({
            to: customer.email,
            subject: `[Metta] Ticket reopened: ${ticket.subject} (#${ticket.id})`,
            html,
            role: 'customer',
        })
    }

    static async sendNewCustomerTicketNotification(
        ticket: TicketRow,
        customer: UserRow,
        accessToken: string,
    ) {
        if (!customer.email) {
            console.error('Customer email not found')
            throw new Error('Customer email not found')
        }

        const html = await render(
            createElement(NewCustomerTicketNotification, {
                ticket,
                accessToken,
            }),
        )

        return this.sendEmail({
            to: customer.email,
            subject: `[Metta] Support ticket created: ${ticket.subject} (#${ticket.id})`,
            html,
            role: 'customer',
        })
    }
}

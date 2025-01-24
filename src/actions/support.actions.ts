'use server'

import { z } from 'zod'

import { SupportService } from '@/services/support.services'

const _supportTicketSchema = z.object({
    name: z.string().min(1, 'Please provide your name'),
    email: z.string().email(),
    subject: z.string().min(1),
    description: z.string().min(1),
})

export async function createSupportTicket(
    input: z.infer<typeof _supportTicketSchema>,
) {
    try {
        const supportService = new SupportService()
        const ticket = await supportService.createTicket(input)
        return { data: ticket, error: null }
    } catch (error) {
        console.error('❌ Support ticket creation failed:', error)
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create support ticket',
        }
    }
}

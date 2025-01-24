'use server'

import { revalidatePath } from 'next/cache'

import { MessageService } from '@/services/message.services'
import { UserWithProfileService } from '@/services/user-with-profile.services'

const messageService = new MessageService()
const userService = new UserWithProfileService()

export async function getTicketMessages(ticketId: string) {
    try {
        const messages = await messageService.findByTicketId(ticketId)
        return { data: messages, error: null }
    } catch (error) {
        console.error('[getTicketMessages]', error)
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to load messages',
        }
    }
}

export async function createMessage(
    ticketId: string,
    content: string,
    customerId?: string,
    token?: string,
) {
    try {
        // If customerId is provided, this is a public token-based access
        if (customerId) {
            const message = await messageService.create(
                {
                    ticket_id: ticketId,
                    user_id: customerId,
                    role: 'customer',
                    content,
                    html_content: content,
                },
                token,
            )

            revalidatePath(`/tickets/${ticketId}`)
            return { data: message, error: null }
        }

        // Otherwise, this is an authenticated user
        const currentUser = await userService.getAuthenticatedUser()
        if (!currentUser) {
            throw new Error('User not found')
        }

        const message = await messageService.create({
            ticket_id: ticketId,
            user_id: currentUser.id,
            role: currentUser.profile.role,
            content,
            html_content: content,
        })

        revalidatePath(`/dashboard/tickets/${ticketId}`)
        return { data: message, error: null }
    } catch (error) {
        console.error('[createMessage]', error)
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create message',
        }
    }
}

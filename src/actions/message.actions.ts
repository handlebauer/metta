'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { MessageService } from '@/services/message.services'
import { ProfileService } from '@/services/profile.services'

const messageService = new MessageService()
const profileService = new ProfileService()

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

export async function createMessage(ticketId: string, content: string) {
    try {
        const db = await createClient()
        const session = await db.auth.getSession()
        if (!session.data.session) {
            throw new Error('Not authenticated')
        }

        const userId = session.data.session.user.id
        const profile = await profileService.findByUserId(userId)
        if (!profile) {
            throw new Error('Profile not found')
        }

        const message = await messageService.create({
            ticket_id: ticketId,
            user_id: userId,
            role: profile.role,
            content,
            html_content: content, // For now, just store the plain text
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

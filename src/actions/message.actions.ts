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
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('User not found')
        }

        const profile = await profileService.findByUserId(user.id)

        if (!profile) {
            throw new Error('Profile not found')
        }

        const message = await messageService.create({
            ticket_id: ticketId,
            user_id: user.id,
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

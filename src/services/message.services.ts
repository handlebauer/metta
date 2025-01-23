import { z } from 'zod'

import { DatabaseError } from '@/lib/errors'
import {
    messageInsertSchema,
    messageSchema,
    messageUpdateSchema,
} from '@/lib/schemas/message.schemas'
import { createClient } from '@/lib/supabase/server'

import { EmailService } from './email.services'
import { TicketService } from './ticket.services'
import { UserWithProfileService } from './user-with-profile.services'

import type { MessageRow, MessageWithUser } from '@/lib/schemas/message.schemas'

const ticketService = new TicketService()
const userService = new UserWithProfileService()

export class MessageService {
    async findByTicketId(ticketId: string): Promise<MessageWithUser[]> {
        try {
            const db = await createClient()

            type JoinedMessage = MessageRow & {
                users: {
                    email: string
                    profiles: {
                        full_name: string | null
                        avatar_url: string | null
                    } | null
                }
            }

            const { data, error } = await db
                .from('messages')
                .select(
                    `
                    *,
                    users!user_id (
                        email,
                        profiles (
                            full_name,
                            avatar_url
                        )
                    )
                `,
                )
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true })

            if (error) throw new DatabaseError(error.message)

            // Transform the nested data structure to match our expected format
            const messages =
                (data as JoinedMessage[])?.map(({ users, ...message }) => ({
                    ...message,
                    created_at: new Date(message.created_at!).toISOString(),
                    updated_at: new Date(message.updated_at!).toISOString(),
                    user: {
                        email: users.email,
                        profile: users.profiles,
                    },
                })) || []

            return messages
        } catch (error) {
            console.error('[MessageService.findByTicketId]', error)
            throw error
        }
    }

    async create(
        input: z.infer<typeof messageInsertSchema>,
    ): Promise<MessageRow> {
        try {
            const validated = messageInsertSchema.parse(input)
            const db = await createClient()
            const { data, error } = await db
                .from('messages')
                .insert(validated)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('Failed to create message')

            const message = messageSchema.parse(data)

            // If this is an agent message, send email notification to customer
            if (message.role === 'agent') {
                const ticket = await ticketService.findById(message.ticket_id)
                if (!ticket) throw new DatabaseError('Ticket not found')

                const customer = await userService.findById(ticket.customer_id)
                if (customer) {
                    await EmailService.sendAgentReplyNotification(
                        ticket,
                        customer,
                        message.content,
                    )
                }
            }

            return message
        } catch (error) {
            console.error('[MessageService.create]', error)
            throw error
        }
    }

    async update(
        id: string,
        input: z.infer<typeof messageUpdateSchema>,
    ): Promise<MessageRow> {
        try {
            const validated = messageUpdateSchema.parse({ ...input, id })
            const db = await createClient()
            const { data, error } = await db
                .from('messages')
                .update(validated)
                .eq('id', id)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('Message not found')

            return {
                ...data,
                created_at: new Date(data.created_at!).toISOString(),
                updated_at: new Date(data.updated_at!).toISOString(),
            }
        } catch (error) {
            console.error('[MessageService.update]', error)
            throw error
        }
    }
}

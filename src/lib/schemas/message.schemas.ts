import { z } from 'zod'

import {
    type Tables,
    type TablesInsert,
    type TablesUpdate,
} from '@/lib/supabase/types'

// Database types
export type MessageRow = Tables<'messages'>
export type MessageInsert = TablesInsert<'messages'>
export type MessageUpdate = TablesUpdate<'messages'>

// Base schema matching database exactly
export const messageSchema = z.object({
    id: z.string(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    ticket_id: z.string(),
    user_id: z.string(),
    role: z.enum(['customer', 'agent', 'system']),
    content: z.string(),
    html_content: z.string(),
}) satisfies z.ZodType<MessageRow>

// Insert schema (omitting generated fields)
export const messageInsertSchema = messageSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
}) satisfies z.ZodType<MessageInsert>

// Update schema (all fields optional except id)
export const messageUpdateSchema = messageSchema
    .omit({
        created_at: true,
        updated_at: true,
    })
    .partial()
    .required({ id: true }) satisfies z.ZodType<MessageUpdate>

// Extended type for messages with user info
export interface MessageWithUser
    extends Omit<MessageRow, 'created_at' | 'updated_at'> {
    created_at: string
    updated_at: string
    user: {
        email: string
        profile: {
            full_name: string | null
            avatar_url: string | null
        } | null
    }
}

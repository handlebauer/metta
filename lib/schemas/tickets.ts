import { z } from 'zod'
import { type Tables, type TablesInsert } from '@/lib/supabase/types'

// Runtime validation schema
export const ticketSchema = z.object({
    id: z.string(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    subject: z.string().min(1),
    description: z.string(),
    status: z.enum(['new', 'open', 'closed']),
    customer_id: z.string(),
    agent_id: z.string().nullable(),
}) satisfies z.ZodType<Tables<'tickets'>>

// Input validation schema for creating tickets
export const createTicketSchema = ticketSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    status: true,
    agent_id: true,
}) satisfies z.ZodType<TablesInsert<'tickets'>>

// Input validation schema for updating tickets
export const updateTicketSchema = ticketSchema
    .pick({
        status: true,
        agent_id: true,
    })
    .partial()

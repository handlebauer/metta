import { z } from 'zod'

import type { Tables, TablesInsert } from '@/lib/supabase/types'

export const incidentSchema = z.object({
    id: z.string(),
    created_at: z.string().datetime(),
    title: z.string().min(1),
    description: z.string().min(1),
    pattern_name: z.string().min(1),
    severity: z.enum(['low', 'medium', 'high']),
    linked_ticket_ids: z.array(z.string()),
    status: z.enum(['open', 'closed', 'resolved']),
}) satisfies z.ZodType<Tables<'incidents'>>

export const createIncidentSchema = incidentSchema.omit({
    id: true,
    created_at: true,
}) satisfies z.ZodType<TablesInsert<'incidents'>>

export type Incident = z.infer<typeof incidentSchema>
export type CreateIncident = z.infer<typeof createIncidentSchema>

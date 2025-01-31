import { z } from 'zod'

import { type Tables, type TablesInsert } from '@/lib/supabase/types'

// Runtime validation schema for the database table
export const firebreakAnalysisSchema = z.object({
    id: z.string(),
    created_at: z.string().datetime(),
    total_tickets: z.number().int().nonnegative(),
    time_window: z.string(),
    status: z.enum(['analyzing', 'completed', 'no_tickets']),
    found_tickets: z.array(
        z.object({
            id: z.string(),
            subject: z.string(),
            description: z.string(),
            status: z.string(),
        }),
    ),
    identified_patterns: z.array(
        z.object({
            name: z.string(),
            description: z.string(),
            affected_systems: z.array(z.string()),
            severity: z.enum(['low', 'medium', 'high']),
            related_ticket_ids: z.array(z.string()),
        }),
    ),
    created_incident_ids: z.array(z.string()),
    workspace_id: z.string(),
    created_by: z.string(),
}) satisfies z.ZodType<Tables<'firebreak_analysis'>>

// Input validation schema for creating new analysis
export const createFirebreakAnalysisSchema = firebreakAnalysisSchema.omit({
    id: true,
    created_at: true,
}) satisfies z.ZodType<TablesInsert<'firebreak_analysis'>>

export type FirebreakAnalysis = z.infer<typeof firebreakAnalysisSchema>
export type CreateFirebreakAnalysis = z.infer<
    typeof createFirebreakAnalysisSchema
>

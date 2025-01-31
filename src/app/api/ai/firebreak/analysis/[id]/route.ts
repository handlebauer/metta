import { type NextRequest } from 'next/server'
import { FirebreakResponse } from '@/app/api/ai/firebreak/schemas'

import { createServiceClient } from '@/lib/supabase/service'
import { type Tables } from '@/lib/supabase/types'

export async function GET(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params
        const supabase = createServiceClient()

        // Get the analysis and its incidents
        const { data: analysis, error: analysisError } = await supabase
            .from('firebreak_analysis')
            .select('*, incidents(*)')
            .eq('id', id)
            .single()

        if (analysisError) {
            console.error(
                '[Firebreak Analysis] Failed to fetch analysis:',
                analysisError,
            )
            return Response.json(
                { error: 'Failed to fetch analysis data' },
                { status: 500 },
            )
        }

        // Format the data to match the FirebreakResponse schema
        const formattedData = {
            analysis_state: {
                total_tickets: analysis.total_tickets,
                time_window: analysis.time_window,
                status: analysis.status,
            },
            found_tickets: analysis.found_tickets,
            identified_patterns: analysis.identified_patterns,
            created_incidents: analysis.incidents.map(
                (incident: Tables<'incidents'>) => ({
                    id: incident.id,
                    subject: incident.title,
                    description: incident.description,
                    pattern_name: incident.pattern_name,
                    linked_ticket_ids: incident.linked_ticket_ids,
                }),
            ),
            agent_steps: analysis.agent_steps || [],
        }

        // Validate the response format
        const validatedData = FirebreakResponse.parse(formattedData)

        // Return both the validated data and the agent steps
        return Response.json({
            ...validatedData,
            agent_steps: analysis.agent_steps || [],
        })
    } catch (error) {
        console.error('[Firebreak Analysis] Failed to fetch analysis:', error)
        return Response.json(
            { error: 'Failed to fetch analysis data' },
            { status: 500 },
        )
    }
}

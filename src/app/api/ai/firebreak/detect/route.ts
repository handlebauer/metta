import { createIncidentSchema } from '@/lib/schemas/incident.schemas'
import { createServiceClient } from '@/lib/supabase/service'

import { agent } from '../agent'
import { FirebreakResponse } from '../schemas'

export const maxDuration = 60

const SYSTEM_PROMPT = `
    You are the Firebreak agent, responsible for analyzing tickets for potential crisis patterns.
    Your task is to:
    1. Get tickets from the last 2 hours
    2. If no tickets are found, stop and report that there are no tickets to analyze
    3. If tickets are found, look for a pattern that might indicate a braoder issue, such as:
        - Multiple tickets with similar error messages
        - Tickets affecting the same system or component
        - Tickets with related symptoms or behavior
    4. Before creating any incidents, review your pattern analysis and validate the pattern
    5. For each validated pattern:
        - Create a new incident ticket summarizing the pattern
        - Link the related tickets to this incident
    6. Finally, use the structureAnalysis tool to convert your findings into a structured format

    Focus on identifying clear patterns that suggest a broader system issue rather than isolated problems.
    Do not make redundant tool calls - if a tool returns no results, proceed to the final reflection.
    Always review patterns before creating incidents to ensure high-quality clustering.

    IMPORTANT: Always end by calling structureAnalysis with your complete analysis, even if no patterns were found.
    This ensures we have structured data about the analysis state and any findings.
`

export async function POST(_req: Request) {
    try {
        console.log('[CRITICAL] [Firebreak] Starting analysis...')

        const agentStream = await agent.stream([
            { role: 'system', content: SYSTEM_PROMPT },
        ])

        for await (const step of agentStream) {
            for (const [key, message] of Object.entries(step)) {
                if (message && typeof message === 'object') {
                    const msg = message as Record<string, unknown>

                    // Check if this is the structureAnalysis result
                    if (
                        key === 'callTool' &&
                        'name' in msg &&
                        msg.name === 'structureAnalysis' &&
                        'content' in msg
                    ) {
                        const rawAnalysis = JSON.parse(String(msg.content))

                        console.log({ rawAnalysis: msg.content })

                        // Validate the analysis with our schema
                        const result = FirebreakResponse.safeParse(rawAnalysis)
                        if (!result.success) {
                            console.error(
                                '[CRITICAL] [Firebreak] Invalid analysis structure:',
                                result.error,
                            )
                            return Response.json(
                                { error: 'Invalid analysis structure' },
                                { status: 500 },
                            )
                        }

                        const analysis = result.data

                        // Ensure analysis is completed
                        if (analysis.analysis_state.status !== 'completed') {
                            console.error(
                                '[CRITICAL] [Firebreak] Analysis incomplete:',
                                analysis.analysis_state.status,
                            )
                            return Response.json(
                                { error: 'Analysis not completed' },
                                { status: 500 },
                            )
                        }

                        // Only create incidents if we found patterns
                        if (
                            analysis.identified_patterns.length > 0 &&
                            analysis.created_incidents.length > 0
                        ) {
                            console.log(
                                `[CRITICAL] [Firebreak] Found ${analysis.identified_patterns.length} patterns, creating ${analysis.created_incidents.length} incidents...`,
                            )

                            const supabase = createServiceClient()
                            const incidents = analysis.created_incidents.map(
                                incident => ({
                                    title: incident.subject,
                                    description: incident.description,
                                    pattern_name: incident.pattern_name,
                                    severity: 'high',
                                    linked_ticket_ids:
                                        incident.linked_ticket_ids,
                                    status: 'open',
                                }),
                            )

                            // Validate and insert incidents
                            const validatedIncidents = incidents.map(incident =>
                                createIncidentSchema.parse(incident),
                            )

                            const { error } = await supabase
                                .from('incidents')
                                .insert(validatedIncidents)

                            if (error) {
                                console.error(
                                    '[CRITICAL] [Firebreak] Failed to create incidents:',
                                    error,
                                )
                                return Response.json(
                                    { error: 'Failed to create incidents' },
                                    { status: 500 },
                                )
                            }

                            console.log(
                                `[CRITICAL] [Firebreak] Successfully created ${validatedIncidents.length} incidents`,
                            )
                            return Response.json(analysis)
                        }

                        // Return the analysis even when no incidents were created
                        console.log(
                            '[CRITICAL] [Firebreak] Analysis complete - no incidents created',
                        )
                        return Response.json({
                            ...analysis,
                            created_incidents: [],
                        })
                    }
                }
            }
        }

        console.error('[CRITICAL] [Firebreak] No analysis produced')
        return Response.json({ error: 'No analysis produced' }, { status: 500 })
    } catch (error) {
        console.error('[CRITICAL] [Firebreak] Analysis failed:', error)
        return Response.json(
            { error: 'Failed to analyze tickets' },
            { status: 500 },
        )
    }
}

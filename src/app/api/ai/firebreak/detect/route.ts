import {
    agentStepSchema,
    langGraphMessageSchema,
} from '@/lib/schemas/agent.schemas'
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

interface AgentStep {
    timestamp: string
    type: 'action' | 'reflection' | 'result'
    content: string
    tool_calls?: Array<{
        id: string
        type: string
        function: {
            name: string
            arguments: string
        }
    }>
    name?: string
    tool_call_id?: string
}

function processAgentMessage(
    key: string,
    message: Record<string, unknown>,
): AgentStep[] {
    try {
        // Parse and validate the raw message
        const parseResult = langGraphMessageSchema.safeParse(message)
        if (!parseResult.success) {
            console.error(
                '[Firebreak] Invalid message format:',
                parseResult.error,
            )
            return []
        }

        const parsedMessage = parseResult.data
        const timestamp = new Date().toISOString()
        const steps: AgentStep[] = []

        // Debug log the parsed message
        console.log('[Firebreak] Processing message:', {
            key,
            type: parsedMessage.type,
            content: parsedMessage.content?.slice(0, 100),
            tool_calls: parsedMessage.tool_calls?.length,
            name: parsedMessage.name,
        })

        // Handle AI messages (reflections and actions)
        if (key === 'callModel') {
            // Always capture the reflection if there's content
            if (parsedMessage.content?.trim()) {
                const reflectionStep = agentStepSchema.parse({
                    timestamp,
                    type: 'reflection',
                    content: parsedMessage.content,
                })
                console.log(
                    '[Firebreak] Adding reflection:',
                    reflectionStep.content.slice(0, 100),
                )
                steps.push(reflectionStep)
            }

            // If it has tool_calls, also capture the action
            if (parsedMessage.tool_calls?.length) {
                const actionStep = agentStepSchema.parse({
                    timestamp,
                    type: 'action',
                    content: parsedMessage.content || '',
                    tool_calls: parsedMessage.tool_calls.map(call => ({
                        id: call.id,
                        type: call.type,
                        function: {
                            name: call.name,
                            arguments:
                                typeof call.args === 'string'
                                    ? call.args
                                    : JSON.stringify(call.args),
                        },
                    })),
                })
                console.log('[Firebreak] Adding action:', {
                    content: actionStep.content.slice(0, 100),
                    tool_calls: actionStep.tool_calls?.map(
                        t => t.function.name,
                    ),
                })
                steps.push(actionStep)
            }
        }

        // Handle tool results
        if (key === 'callTool' && parsedMessage.name) {
            const resultStep = agentStepSchema.parse({
                timestamp,
                type: 'result',
                content: parsedMessage.content || '',
                name: parsedMessage.name,
                tool_call_id: parsedMessage.tool_call_id || '',
            })
            console.log('[Firebreak] Adding result:', {
                name: resultStep.name,
                content: resultStep.content.slice(0, 100),
            })
            steps.push(resultStep)
        }

        return steps
    } catch (error) {
        console.error('[Firebreak] Failed to process message:', error)
        return []
    }
}

export async function POST(_req: Request) {
    try {
        console.log('[CRITICAL] [Firebreak] Starting analysis...')
        const agentSteps: AgentStep[] = []

        const agentStream = await agent.stream([
            { role: 'system', content: SYSTEM_PROMPT },
        ])

        for await (const step of agentStream) {
            for (const [key, message] of Object.entries(step)) {
                if (message && typeof message === 'object') {
                    const msg = message as Record<string, unknown>

                    // Debug log to see exact message format
                    console.log('[DEBUG] [Firebreak] Message:', {
                        key,
                        type: msg.type,
                        content: msg.content?.toString()?.slice(0, 200) + '...',
                        tool_calls: msg.tool_calls,
                        name: msg.name,
                        tool_call_id: msg.tool_call_id,
                    })

                    // Process and collect agent steps with the key for context
                    const newSteps = processAgentMessage(key, msg)
                    if (newSteps.length > 0) {
                        agentSteps.push(...newSteps)
                        for (const step of newSteps) {
                            console.log(
                                '[CRITICAL] [Firebreak] Collected step:',
                                {
                                    type: step.type,
                                    content: step.content.slice(0, 100) + '...',
                                },
                            )
                        }
                    }

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

                        // Save the analysis to the database
                        const supabase = createServiceClient()

                        // Get the demo workspace and system user
                        const workspacePromise = supabase
                            .from('workspaces')
                            .select('id')
                            .eq('slug', 'demohost')
                            .single()

                        const userPromise = supabase
                            .from('users')
                            .select('id')
                            .eq('email', 'ai.sysadmin@metta.now')
                            .single()

                        const [workspace, user] = await Promise.all([
                            workspacePromise,
                            userPromise,
                        ])

                        if (workspace.error || user.error) {
                            console.error(
                                '[CRITICAL] [Firebreak] Failed to get workspace/user:',
                                workspace.error || user.error,
                            )
                            return Response.json(
                                { error: 'Failed to get workspace/user' },
                                { status: 500 },
                            )
                        }

                        // Save the analysis
                        const { data: savedAnalysis, error: analysisError } =
                            await supabase
                                .from('firebreak_analysis')
                                .insert({
                                    total_tickets:
                                        analysis.analysis_state.total_tickets,
                                    time_window:
                                        analysis.analysis_state.time_window,
                                    status: analysis.analysis_state.status,
                                    found_tickets: analysis.found_tickets,
                                    identified_patterns:
                                        analysis.identified_patterns,
                                    created_incident_ids: [],
                                    workspace_id: workspace.data.id,
                                    created_by: user.data.id,
                                    agent_steps: agentSteps.map(step => {
                                        // Only include tool_calls if they exist and have the correct structure
                                        const tool_calls = step.tool_calls?.map(
                                            call => ({
                                                id: call.id,
                                                type: call.type,
                                                function: {
                                                    name:
                                                        call.function?.name ||
                                                        '',
                                                    arguments:
                                                        call.function
                                                            ?.arguments || '{}',
                                                },
                                            }),
                                        )

                                        return {
                                            timestamp: step.timestamp,
                                            type: step.type,
                                            content: step.content,
                                            ...(tool_calls
                                                ? { tool_calls }
                                                : {}),
                                            ...(step.name
                                                ? { name: step.name }
                                                : {}),
                                            ...(step.tool_call_id
                                                ? {
                                                      tool_call_id:
                                                          step.tool_call_id,
                                                  }
                                                : {}),
                                        }
                                    }),
                                })
                                .select()
                                .single()

                        if (analysisError) {
                            console.error(
                                '[CRITICAL] [Firebreak] Failed to save analysis:',
                                analysisError,
                            )
                            return Response.json(
                                { error: 'Failed to save analysis' },
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

                            const incidents = analysis.created_incidents.map(
                                incident => ({
                                    title: incident.subject,
                                    description: incident.description,
                                    pattern_name: incident.pattern_name,
                                    severity: 'high',
                                    linked_ticket_ids:
                                        incident.linked_ticket_ids,
                                    status: 'open',
                                    analysis_id: savedAnalysis.id,
                                }),
                            )

                            // Validate and insert incidents
                            const validatedIncidents = incidents.map(incident =>
                                createIncidentSchema.parse(incident),
                            )

                            const { data: createdIncidents, error } =
                                await supabase
                                    .from('incidents')
                                    .insert(validatedIncidents)
                                    .select()

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

                            // Update the analysis with the created incident IDs
                            const { error: updateError } = await supabase
                                .from('firebreak_analysis')
                                .update({
                                    created_incident_ids: createdIncidents.map(
                                        i => i.id,
                                    ),
                                })
                                .eq('id', savedAnalysis.id)

                            if (updateError) {
                                console.error(
                                    '[CRITICAL] [Firebreak] Failed to update analysis with incident IDs:',
                                    updateError,
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

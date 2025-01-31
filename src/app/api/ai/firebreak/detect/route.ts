import { Client } from 'langsmith'

import {
    agentStepSchema,
    langGraphMessageSchema,
} from '@/lib/schemas/agent.schemas'
import { createIncidentSchema } from '@/lib/schemas/incident.schemas'
import { createServiceClient } from '@/lib/supabase/service'

import { agent } from '../agent'
import { FirebreakEvaluation, FirebreakResponse } from '../schemas'

export const maxDuration = 60

const SYSTEM_PROMPT = `
    You are the Firebreak agent, responsible for analyzing tickets for potential crisis patterns.

    IMPORTANT: Always explain your thinking before taking any action. This helps users understand your decision-making process.

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

    ALWAYS remember to:
    1. Explain your thinking before each action
    2. Summarize what you learned from each tool result
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
    const startTime = Date.now()
    try {
        console.log('[CRITICAL] [Firebreak] Starting analysis...')
        const agentSteps: AgentStep[] = []
        let analysisResult: typeof FirebreakResponse._type | null = null
        let runId: string | undefined

        const agentStream = await agent.stream([
            { role: 'system', content: SYSTEM_PROMPT },
        ])

        // Process the stream once, capturing runId and processing messages
        for await (const step of agentStream) {
            // Capture runId if present
            if ('id' in step) {
                runId = step.id as string
            }

            // Process messages
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

                    // Store the structureAnalysis result when found
                    if (
                        key === 'callTool' &&
                        'name' in msg &&
                        msg.name === 'structureAnalysis' &&
                        'content' in msg
                    ) {
                        const rawAnalysis = JSON.parse(String(msg.content))
                        const result = FirebreakResponse.safeParse(rawAnalysis)

                        if (!result.success) {
                            console.error(
                                '[CRITICAL] [Firebreak] Invalid analysis structure:',
                                result.error,
                            )
                            continue
                        }

                        analysisResult = result.data
                    }
                }
            }
        }

        // After stream is complete, process the analysis result
        if (!analysisResult) {
            console.error('[CRITICAL] [Firebreak] No analysis produced')
            return Response.json(
                { error: 'No analysis produced' },
                { status: 500 },
            )
        }

        // Ensure analysis is completed
        if (analysisResult.analysis_state.status !== 'completed') {
            console.error(
                '[CRITICAL] [Firebreak] Analysis incomplete:',
                analysisResult.analysis_state.status,
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
        const { data: savedAnalysis, error: analysisError } = await supabase
            .from('firebreak_analysis')
            .insert({
                total_tickets: analysisResult.analysis_state.total_tickets,
                time_window: analysisResult.analysis_state.time_window,
                status: analysisResult.analysis_state.status,
                found_tickets: analysisResult.found_tickets,
                identified_patterns: analysisResult.identified_patterns,
                created_incident_ids: [],
                workspace_id: workspace.data.id,
                created_by: user.data.id,
                agent_steps: agentSteps.map(step => {
                    // Only include tool_calls if they exist and have the correct structure
                    const tool_calls = step.tool_calls?.map(call => ({
                        id: call.id,
                        type: call.type,
                        function: {
                            name: call.function?.name || '',
                            arguments: call.function?.arguments || '{}',
                        },
                    }))

                    return {
                        timestamp: step.timestamp,
                        type: step.type,
                        content: step.content,
                        ...(tool_calls ? { tool_calls } : {}),
                        ...(step.name ? { name: step.name } : {}),
                        ...(step.tool_call_id
                            ? { tool_call_id: step.tool_call_id }
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

        // Collect evaluation metrics
        const metrics = FirebreakEvaluation.parse({
            pattern_identification_success:
                analysisResult.identified_patterns.length > 0,
            response_time_ms: Date.now() - startTime,
        })

        // Add LangSmith annotation if API key is available
        if (process.env.LANGCHAIN_API_KEY && runId) {
            const client = new Client({
                apiUrl: process.env.LANGCHAIN_ENDPOINT,
                apiKey: process.env.LANGCHAIN_API_KEY,
            })

            await client.addRunsToAnnotationQueue(
                '4e2aa77c-7540-43b0-9ce6-ac40ba860ac3',
                [runId],
            )
        }

        // Only create incidents if we found patterns
        if (
            analysisResult.identified_patterns.length > 0 &&
            analysisResult.created_incidents.length > 0
        ) {
            console.log(
                `[CRITICAL] [Firebreak] Found ${analysisResult.identified_patterns.length} patterns, creating ${analysisResult.created_incidents.length} incidents...`,
            )

            const incidents = analysisResult.created_incidents.map(
                (incident: {
                    subject: string
                    description: string
                    pattern_name: string
                    linked_ticket_ids: string[]
                }) => ({
                    title: incident.subject,
                    description: incident.description,
                    pattern_name: incident.pattern_name,
                    severity: 'high',
                    linked_ticket_ids: incident.linked_ticket_ids,
                    status: 'open',
                    analysis_id: savedAnalysis.id,
                }),
            )

            // Validate and insert incidents
            const validatedIncidents = incidents.map(
                (incident: Record<string, unknown>) =>
                    createIncidentSchema.parse(incident),
            )

            const { data: createdIncidents, error } = await supabase
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
                    created_incident_ids: createdIncidents.map(i => i.id),
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

            return Response.json({
                ...analysisResult,
                created_incidents: [],
                _metrics: metrics,
            })
        }

        // Return the analysis with metrics
        console.log(
            '[CRITICAL] [Firebreak] Analysis complete - no incidents created',
        )
        return Response.json({
            ...analysisResult,
            created_incidents: [],
            _metrics: metrics,
        })
    } catch (error) {
        console.error('[CRITICAL] [Firebreak] Analysis failed:', error)
        return Response.json(
            { error: 'Failed to analyze tickets' },
            { status: 500 },
        )
    }
}

import dedent from 'dedent'
import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

// Define our Zod schemas
export const AnalysisState = z.object({
    total_tickets: z.number(),
    time_window: z.string(),
    status: z.enum(['analyzing', 'completed', 'no_tickets']),
})

export const Ticket = z.object({
    id: z.string(),
    subject: z.string(),
    description: z.string(),
    status: z.string(),
})

export const Pattern = z.object({
    name: z.string(),
    description: z.string(),
    affected_systems: z.array(z.string()),
    severity: z.enum(['low', 'medium', 'high']),
    related_ticket_ids: z.array(z.string()),
})

export const Incident = z.object({
    id: z.string(),
    subject: z.string(),
    description: z.string(),
    pattern_name: z.string(),
    linked_ticket_ids: z.array(z.string()),
})

export const AgentStep = z.object({
    timestamp: z.string(),
    type: z.enum(['action', 'reflection', 'result']),
    content: z.string(),
    tool_calls: z
        .array(
            z.object({
                id: z.string(),
                type: z.string(),
                function: z.object({
                    name: z.string(),
                    arguments: z.string(),
                }),
            }),
        )
        .optional(),
    name: z.string().optional(),
    tool_call_id: z.string().optional(),
})

export const FirebreakResponse = z.object({
    analysis_state: AnalysisState,
    found_tickets: z.array(Ticket),
    identified_patterns: z.array(Pattern),
    created_incidents: z.array(Incident),
    agent_steps: z.array(AgentStep).optional(),
})

export type FirebreakResponseType = z.infer<typeof FirebreakResponse>

const openai = new OpenAI()

export async function parseFirebreakAnalysis(analysis: {
    summary: string
    pattern_found: string
    incident_created_id: string
    related_tickets: { id: string }[]
    tickets_analyzed_length: number
}): Promise<FirebreakResponseType> {
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: dedent`
                    Convert the following analysis into a structured format.
                    IMPORTANT: Use ONLY these exact ticket IDs in your response: ${analysis.related_tickets.map(t => t.id).join(', ')}
                    Do not generate new ticket IDs. Map the analysis to these existing tickets.
                `,
            },
            {
                role: 'user',
                content: JSON.stringify(analysis, null, 2),
            },
        ],
        response_format: zodResponseFormat(
            FirebreakResponse,
            'firebreak_response',
        ),
    })

    const parsed = FirebreakResponse.parse(
        JSON.parse(completion.choices[0].message.content || '{}'),
    )
    return parsed
}

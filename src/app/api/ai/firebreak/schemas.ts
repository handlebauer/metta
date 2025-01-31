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

export const FirebreakResponse = z.object({
    analysis_state: AnalysisState,
    found_tickets: z.array(Ticket),
    identified_patterns: z.array(Pattern),
    created_incidents: z.array(Incident),
})

export type FirebreakResponseType = z.infer<typeof FirebreakResponse>

const openai = new OpenAI()

export async function parseFirebreakAnalysis(
    content: string,
    originalTickets: { id: string }[],
): Promise<FirebreakResponseType> {
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: dedent`
                    Convert the following analysis into a structured format.
                    IMPORTANT: Use ONLY these exact ticket IDs in your response: ${originalTickets.map(t => t.id).join(', ')}
                    Do not generate new ticket IDs. Map the analysis to these existing tickets.
                `,
            },
            {
                role: 'user',
                content,
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

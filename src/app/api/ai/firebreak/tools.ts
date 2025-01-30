import { tool } from '@langchain/core/tools'
import { ChatOpenAI } from '@langchain/openai'
import dedent from 'dedent'
import { z } from 'zod'

import { SystemService } from '@/services/system.services'
import { TicketCrisisService } from '@/services/ticket-crisis.services'
import { TicketService } from '@/services/ticket.services'

import { parseFirebreakAnalysis } from './schemas'

const ticketService = new TicketService()
const ticketCrisisService = new TicketCrisisService()
const systemService = SystemService.getInstance()

const MIN_TICKETS_FOR_INCIDENT = 2

export const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
})

export const getRecentTickets = tool(
    async () => {
        const tickets = await ticketCrisisService.findPotentialCrisisTickets({
            hoursBack: 2,
        })

        if (tickets.length === 0) {
            return 'No tickets found in the last 2 hours'
        }

        const formattedTickets = tickets
            .map(
                t =>
                    dedent`
                    ${t.id}: ${t.subject}
                      - Status: ${t.status}
                      - Description: ${t.description}
                      - Priority: ${t.priority}`,
            )
            .join('\n\n')

        return dedent`Found ${tickets.length} tickets from the last 2 hours

        ${formattedTickets}`
    },
    {
        name: 'getRecentTickets',
        description: 'Get all tickets from the last 2 hours.',
    },
)

export const createIncidentTicket = tool(
    async ({ subject, description, related_tickets }) => {
        // Enforce minimum number of tickets for incident creation
        if (related_tickets.length < MIN_TICKETS_FOR_INCIDENT) {
            return `Cannot create an incident with fewer than ${MIN_TICKETS_FOR_INCIDENT} related tickets. This helps ensure we only create incidents for actual patterns or systemic issues.`
        }

        // Get full ticket details to validate the relationship
        const tickets = await ticketCrisisService.findTicketsByIds(
            related_tickets.map(t => t.id),
        )

        // Ensure all tickets exist
        if (tickets.length !== related_tickets.length) {
            return 'Some of the specified tickets could not be found. Please verify the ticket IDs.'
        }

        const sysUserId = await systemService.getSystemUserId()

        const formattedDescription = dedent`
            ${description}

            Related Tickets:
            ${tickets
                .map(t => `- ${t.id}: ${t.subject} (Priority: ${t.priority})`)
                .join('\n')}
        `

        // Create the incident ticket with service client
        const incident = await ticketService.create(
            {
                subject: `[INCIDENT] ${subject}`,
                description: formattedDescription,
                priority: 'high',
                customer_id: sysUserId,
                agent_id: null,
                parent_ticket_id: null,
                crisis_keywords: [],
                chaos_score: null,
            },
            { useServiceClient: true },
        )

        // Update related tickets with the incident ID
        for (const ticket of tickets) {
            await ticketCrisisService.updateCrisisMetadata(ticket.id, {
                parent_ticket_id: incident.id,
            })
        }

        return `Created incident ticket ${incident.id} and linked ${tickets.length} related tickets. All tickets are new and high/urgent priority, indicating a potential systemic issue.`
    },
    {
        name: 'createIncidentTicket',
        description:
            'Create a new incident ticket and link it to related tickets. Only use this when you find a clear pattern of related issues (minimum 2 tickets) that are new and high/urgent priority.',
        schema: z.object({
            subject: z.string().describe('Brief description of the incident'),
            description: z
                .string()
                .describe('Detailed description of the incident'),
            related_tickets: z
                .array(z.object({ id: z.string() }))
                .describe(
                    'Array of related ticket objects. Must include at least 2 tickets.',
                ),
        }),
    },
)

export const reviewAnalysis = tool(
    async ({ tickets, patterns }) => {
        // Get full ticket details for analysis
        const ticketDetails = await ticketCrisisService.findTicketsByIds(
            tickets.map(t => t.id),
        )

        // Format tickets for review
        const formattedTickets = ticketDetails.map(t => ({
            id: t.id,
            subject: t.subject,
            description: t.description,
            priority: t.priority,
            status: t.status,
            keywords: t.crisis_keywords || [],
        }))

        // Use the model to analyze the clusters
        const analysis = await model.invoke([
            {
                role: 'system',
                content: dedent`
                    You are a clustering validation expert with a strict single-cluster policy. Your task is to:

                    1. Review the provided tickets and proposed patterns
                    2. Determine if there is ONE clear, cohesive pattern that represents a systemic issue
                    3. If multiple patterns exist:
                       - Identify the most significant pattern (highest impact, most related tickets)
                       - Only keep tickets that strongly relate to this pattern
                       - Drop other patterns and their unrelated tickets
                    4. If no clear pattern exists:
                       - Report that no actionable pattern was found
                       - Explain why the tickets don't form a cohesive pattern

                    Remember:
                    - Better to find no pattern than to force unrelated tickets together
                    - Only group tickets that share a clear root cause or affected system
                    - Quality over quantity - fewer strongly related tickets is better than many loosely related ones
                    - If you do find a pattern and it has less than 3 tickets, this does not qualify as a pattern

                    Provide your analysis in this format:
                    1. Pattern Found: Yes/No
                    2. If Yes:
                       - Incident title: [title]
                       - Incident description: [description]
                       - Related Tickets: [list of IDs]
                       - Explanation: Why these tickets form a cohesive pattern
                    3. If No:
                       - Explanation: Why no actionable pattern was found
                `,
            },
            {
                role: 'user',
                content: dedent`
                    Tickets to analyze:
                    ${JSON.stringify(formattedTickets, null, 2)}

                    Proposed patterns:
                    ${JSON.stringify(patterns, null, 2)}

                    Please validate the clustering and provide recommendations following the format above.
                `,
            },
        ])

        return analysis.content
    },
    {
        name: 'reviewAnalysis',
        description:
            'Review the identified patterns and validate clustering decisions. Will enforce a single-cluster policy, either finding one clear pattern or no pattern at all.',
        schema: z.object({
            tickets: z
                .array(
                    z.object({
                        id: z.string(),
                        subject: z.string().optional(),
                        description: z.string().optional(),
                    }),
                )
                .describe('Array of tickets to analyze'),
            patterns: z
                .array(
                    z.object({
                        title: z.string(),
                        description: z.string(),
                        severity: z.enum(['low', 'medium', 'high', 'urgent']),
                        related_ticket_ids: z.array(z.string()),
                    }),
                )
                .describe('Array of identified patterns to validate'),
        }),
    },
)

export const structureAnalysis = tool(
    async ({ analysis }) => {
        console.log('[Firebreak] Structuring analysis...')
        const structured = await parseFirebreakAnalysis(analysis)
        return JSON.stringify(structured)
    },
    {
        name: 'structureAnalysis',
        description:
            'Convert your analysis into a structured format that can be used by the system.',
        schema: z.object({
            analysis: z
                .string()
                .describe(
                    'Your complete analysis of the situation, including patterns found, incidents created, and tickets analyzed.',
                ),
        }),
    },
)

export const tools = [
    getRecentTickets,
    reviewAnalysis,
    createIncidentTicket,
    structureAnalysis,
]

import { type NextRequest } from 'next/server'
import { FirebreakResponse } from '@/app/api/ai/firebreak/schemas'

export async function GET(
    _: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        // TODO: In production, this would fetch the actual analysis data from your database
        // For demo purposes, we'll return mock data
        const mockData = {
            analysis_state: {
                total_tickets: 3,
                time_window: '2 hours',
                status: 'completed',
            },
            found_tickets: [
                {
                    id: 'ticket-1',
                    title: 'Checkout page loading slowly',
                    description:
                        'Customer reported extremely slow loading times on the checkout page. Takes over 10 seconds to process payment.',
                    status: 'open',
                },
                {
                    id: 'ticket-2',
                    title: 'Payment processing timeout',
                    description:
                        'Multiple customers experiencing timeouts during payment processing. Transactions are failing to complete.',
                    status: 'open',
                },
                {
                    id: 'ticket-3',
                    title: 'Cart API errors',
                    description:
                        'Backend logs showing increased error rates from the cart service. Multiple 500 errors recorded.',
                    status: 'new',
                },
            ],
            identified_patterns: [
                {
                    name: 'Payment Processing Degradation',
                    description:
                        'Multiple reports of slow response times and timeouts specifically in the checkout and payment processing flow. This appears to be a systemic issue affecting the payment infrastructure.',
                    affected_systems: [
                        'Checkout Service',
                        'Payment Gateway',
                        'Cart API',
                    ],
                    severity: 'high',
                    related_ticket_ids: ['ticket-1', 'ticket-2', 'ticket-3'],
                },
            ],
            created_incidents: [
                {
                    id: params.id,
                    title: 'Payment System Performance Degradation',
                    description:
                        'Critical incident: Multiple customers reporting payment processing issues. Investigation shows increased error rates and timeouts across the payment infrastructure.',
                    pattern_name: 'Payment Processing Degradation',
                    linked_ticket_ids: ['ticket-1', 'ticket-2', 'ticket-3'],
                },
            ],
        }

        // Validate the response format
        const validatedData = FirebreakResponse.parse(mockData)

        return Response.json(validatedData)
    } catch (error) {
        console.error('[Firebreak Analysis] Failed to fetch analysis:', error)
        return Response.json(
            { error: 'Failed to fetch analysis data' },
            { status: 500 },
        )
    }
}

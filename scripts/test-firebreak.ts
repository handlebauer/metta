import { createServiceClient } from '@/lib/supabase/service'

interface TestCase {
    name: string
    setup: {
        tickets: Array<{
            subject: string
            description: string
            priority: 'low' | 'medium' | 'high'
            status: 'open'
            customer_id: string
            crisis_keywords?: string[]
            agent_id?: string
            chaos_score?: number
        }>
    }
    expected: {
        should_find_pattern: boolean
        pattern_type?: string
        min_incidents?: number
    }
}

const testCases: TestCase[] = [
    {
        name: 'Multiple similar errors',
        setup: {
            tickets: [
                {
                    subject: 'API Connection Timeout',
                    description:
                        'Getting connection timeout errors when calling the API',
                    priority: 'high',
                    status: 'open',
                    crisis_keywords: ['timeout', 'connection', 'api'],
                    customer_id: 'test-customer-1',
                    chaos_score: 0.8,
                },
                {
                    subject: 'API Connection Failed',
                    description: 'API connection failing with timeout error',
                    priority: 'high',
                    status: 'open',
                    crisis_keywords: ['timeout', 'connection', 'api'],
                    customer_id: 'test-customer-2',
                    chaos_score: 0.7,
                },
                {
                    subject: 'API Timeout Issues',
                    description: 'Multiple users reporting API timeouts',
                    priority: 'high',
                    status: 'open',
                    crisis_keywords: ['timeout', 'api'],
                    customer_id: 'test-customer-3',
                    chaos_score: 0.9,
                },
            ],
        },
        expected: {
            should_find_pattern: true,
            pattern_type: 'similar_errors',
            min_incidents: 1,
        },
    },
    {
        name: 'Unrelated tickets',
        setup: {
            tickets: [
                {
                    subject: 'Login Issue',
                    description: 'Cannot log in to my account',
                    priority: 'medium',
                    status: 'open',
                    customer_id: 'test-customer-4',
                    chaos_score: 0.3,
                },
                {
                    subject: 'Feature Request',
                    description: 'Would like to see dark mode',
                    priority: 'low',
                    status: 'open',
                    customer_id: 'test-customer-5',
                    chaos_score: 0.1,
                },
                {
                    subject: 'Billing Question',
                    description: 'Need help understanding my invoice',
                    priority: 'medium',
                    status: 'open',
                    customer_id: 'test-customer-6',
                    chaos_score: 0.2,
                },
            ],
        },
        expected: {
            should_find_pattern: false,
        },
    },
]

async function setupTestData(testCase: TestCase) {
    const supabase = createServiceClient()

    // Get demo workspace
    const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('slug', 'demohost')
        .single()

    if (workspaceError) {
        throw new Error(`Failed to get workspace: ${workspaceError.message}`)
    }

    // Insert test tickets
    const { data: tickets, error: ticketError } = await supabase
        .from('tickets')
        .insert(
            testCase.setup.tickets.map(ticket => ({
                ...ticket,
                workspace_id: workspace.id,
                created_at: new Date().toISOString(),
            })),
        )
        .select()

    if (ticketError) {
        throw new Error(`Failed to insert tickets: ${ticketError.message}`)
    }

    return tickets
}

async function runFirebreakTest(testCase: TestCase) {
    console.log(`Running test case: ${testCase.name}`)

    try {
        // Setup test data
        const tickets = await setupTestData(testCase)
        console.log(`Created ${tickets.length} test tickets`)

        // Run Firebreak detection
        const response = await fetch(
            'http://localhost:3000/api/ai/firebreak/detect',
            {
                method: 'POST',
            },
        )

        const result = await response.json()

        // Log metrics
        console.log('Test Results:')
        console.log('-------------')
        console.log(`Pattern Found: ${result.identified_patterns.length > 0}`)
        console.log(`Response Time: ${result._metrics.response_time_ms}ms`)
        console.log(
            `Tickets Analyzed: ${result._metrics.total_tickets_analyzed}`,
        )
        console.log(`Patterns Found: ${result._metrics.patterns_found}`)
        console.log(`Incidents Created: ${result._metrics.incidents_created}`)
        console.log(`Run ID: ${result._metrics.run_id}`)
        console.log('-------------\n')

        // Validate expectations
        const success =
            result.identified_patterns.length > 0 ===
                testCase.expected.should_find_pattern &&
            (!testCase.expected.min_incidents ||
                result.created_incidents.length >=
                    testCase.expected.min_incidents)

        console.log(`Test ${success ? 'PASSED' : 'FAILED'}: ${testCase.name}`)
        if (!success) {
            console.log('Expected:', testCase.expected)
            console.log('Got:', {
                patterns_found: result.identified_patterns.length > 0,
                incidents_created: result.created_incidents.length,
            })
        }
    } catch (error) {
        console.error(`Test failed: ${testCase.name}`)
        console.error(error)
    }
}

async function main() {
    for (const testCase of testCases) {
        await runFirebreakTest(testCase)
    }
}

main().catch(console.error)

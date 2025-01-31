import { SupabaseClient } from '@supabase/supabase-js'

import { type Database } from '@/lib/supabase/types'

import { SYSTEM_USER } from './users'
import { DEMO_WORKSPACE } from './workspaces'

export async function seedFirebreakAnalysis(
    supabase: SupabaseClient<Database>,
    { ticketMap }: { ticketMap: Record<string, string> },
) {
    console.log('📊 Creating firebreak analysis...')

    // Get some ticket IDs from the map
    const ticketIds = Object.values(ticketMap).slice(0, 5)

    const workspaceIdPromise = supabase
        .from('workspaces')
        .select('id')
        .eq('slug', DEMO_WORKSPACE.slug)
        .single()
        .then(res => res.data?.id)

    const userIdPromise = supabase
        .from('users')
        .select('id')
        .eq('email', SYSTEM_USER.email)
        .single()
        .then(res => res.data?.id)

    const [workspaceId, userId] = await Promise.all([
        workspaceIdPromise,
        userIdPromise,
    ])

    const { data: analysis, error } = await supabase
        .from('firebreak_analysis')
        .insert({
            total_tickets: 5,
            time_window: '2 hours',
            status: 'completed',
            found_tickets: [
                {
                    id: ticketIds[0],
                    subject: 'Performance Degradation Report',
                    description:
                        'Significant performance degradation across batch processing and chart rendering.',
                    status: 'open',
                },
                {
                    id: ticketIds[1],
                    subject: 'Slow Page Loads',
                    description:
                        'Users are experiencing very slow page load times.',
                    status: 'open',
                },
                {
                    id: ticketIds[2],
                    subject: 'API Response Time Issues',
                    description:
                        'API response times have increased significantly.',
                    status: 'open',
                },
                {
                    id: ticketIds[3],
                    subject: 'Batch Processing Delays',
                    description:
                        'Batch processing is taking unusually long to complete.',
                    status: 'open',
                },
                {
                    id: ticketIds[4],
                    subject: 'Database Timeout Errors',
                    description:
                        'Potential database issues affecting multiple features.',
                    status: 'open',
                },
            ],
            identified_patterns: [
                {
                    name: 'Performance Issues Across Systems',
                    description:
                        'Multiple tickets report significant performance degradation across batch processing, chart rendering, page load times, and API response times, indicating a broader issue affecting system performance.',
                    affected_systems: [
                        'batch processing',
                        'chart rendering',
                        'page load',
                        'API',
                    ],
                    severity: 'high',
                    related_ticket_ids: ticketIds.slice(0, 4),
                },
            ],
            created_incident_ids: [],
            workspace_id: workspaceId!,
            created_by: userId!,
        })
        .select()
        .single()

    if (error) {
        throw error
    }

    console.log('✅ Created firebreak analysis')
    return { analysisId: analysis.id }
}

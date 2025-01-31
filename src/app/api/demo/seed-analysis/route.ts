import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
    try {
        const supabase = createServiceClient()

        // Get the first analysis from the database
        const { data: analysis, error } = await supabase
            .from('firebreak_analysis')
            .select('*')
            .limit(1)
            .single()

        if (error) {
            throw error
        }

        return Response.json({
            analysis_state: {
                total_tickets: analysis.total_tickets,
                time_window: analysis.time_window,
                status: analysis.status,
            },
            found_tickets: analysis.found_tickets,
            identified_patterns: analysis.identified_patterns,
            created_incidents: [],
        })
    } catch (error) {
        console.error('[Demo] Failed to fetch seeded analysis:', error)
        return Response.json(
            { error: 'Failed to fetch seeded analysis' },
            { status: 500 },
        )
    }
}

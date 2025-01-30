import { NextResponse } from 'next/server'

import { createServiceClient } from '@/lib/supabase/service'

export async function POST() {
    try {
        const supabase = createServiceClient()

        // Calculate timestamp from 2 hours ago
        const now = new Date()
        const twoHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        // Log timestamps for debugging
        console.log('Deleting tickets between:')
        console.log('Now:', now.toISOString())
        console.log('Two hours ago:', twoHoursAgo.toISOString())

        // Delete all tickets created in the last 2 hours
        const { error } = await supabase
            .from('tickets')
            .delete()
            .gte('created_at', twoHoursAgo.toISOString())
            .lte('created_at', now.toISOString())

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete test tickets:', error)
        return NextResponse.json(
            { error: 'Failed to delete test tickets' },
            { status: 500 },
        )
    }
}

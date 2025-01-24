import { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

export async function seedAccessTokens(supabase: SupabaseClient<Database>) {
    console.log('🎟️ Seeding access tokens...')

    // Get a customer user's ID
    const { data: customerUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'testcustomer@example.com')
        .single()

    if (userError || !customerUser) {
        throw new Error('Failed to find customer user')
    }

    // Find the test ticket
    const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('id')
        .eq('subject', '[Test] Access Token Test Ticket')
        .single()

    if (ticketError || !ticket) {
        throw new Error('Failed to find the access token test ticket')
    }

    // Generate an access token for the ticket
    const { data: token, error: tokenError } = await supabase.rpc(
        'generate_ticket_access_token',
        {
            p_ticket_id: ticket.id,
            p_expires_in: '30 days', // Set a longer expiry for the demo token
            p_created_by: customerUser.id,
        },
    )

    if (tokenError) {
        throw new Error(
            `Failed to generate access token: ${tokenError.message}`,
        )
    }

    if (token && process.env.NODE_ENV !== 'production') {
        console.log('Generated access token:', {
            ticket_id: ticket.id,
            token,
        })
    }

    console.log('✅ Access tokens seeded')

    return {
        ticketId: ticket.id,
        token,
    }
}

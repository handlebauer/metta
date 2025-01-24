import { createClient } from '@/lib/supabase/server'

import type { MessageWithUser } from '@/lib/schemas/message.schemas'
import type { TicketWithCustomer } from '@/lib/schemas/ticket.schemas'

export async function generateTicketAccessToken(
    ticketId: string,
    expiresIn = '7 days',
) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('generate_ticket_access_token', {
        p_ticket_id: ticketId,
        p_expires_in: expiresIn,
    })

    if (error) throw error
    return data
}

export async function verifyTicketAccessToken(token: string) {
    const supabase = await createClient()

    // First set the token in the session
    const { error: setError } = await supabase.rpc('set_ticket_access_token', {
        p_token: token,
    })

    if (setError) return null

    // Now fetch the ticket data with the token session
    const { data: tokenData, error: tokenError } = await supabase
        .from('ticket_access_tokens')
        .select('*, ticket:tickets(*, customer:users(*))')
        .eq('token', token)
        .single()

    if (tokenError) throw tokenError
    if (!tokenData) return null

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
        return null
    }

    // Update last accessed timestamp
    await supabase
        .from('ticket_access_tokens')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('token', token)

    return tokenData
}

export async function getTicketWithToken(
    ticketId: string,
    token: string,
): Promise<(TicketWithCustomer & { messages: MessageWithUser[] }) | null> {
    const supabase = await createClient()

    // Ensure token is properly decoded
    const decodedToken = decodeURIComponent(token)

    // First verify the token exists and is valid
    const { data: tokenData, error: tokenError } = await supabase
        .from('ticket_access_tokens')
        .select('*')
        .eq('token', decodedToken)
        .eq('ticket_id', ticketId)
        .single()

    if (tokenError) {
        console.warn('Token lookup failed:', tokenError)
        return null
    }

    if (!tokenData) {
        console.warn('No token found')
        return null
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
        console.warn('Token has expired')
        return null
    }

    console.log('Found valid token:', tokenData)

    // Set the token in the session
    const { error: setTokenError } = await supabase.rpc(
        'set_ticket_access_token',
        {
            p_token: decodedToken,
        },
    )

    if (setTokenError) {
        console.warn('Failed to set token in session:', setTokenError)
        return null
    }

    // Create a new Supabase client with the token in headers
    const clientWithToken = await createClient({
        'x-ticket-token': decodedToken,
    })

    // Now try to get the full ticket data using the client with token headers
    const { data: ticketData, error: ticketError } = await clientWithToken
        .from('tickets')
        .select(
            `
            *,
            customer:users!tickets_customer_id_fkey(
                id,
                email,
                profile:profiles(
                    full_name,
                    avatar_url
                )
            ),
            agent:users!tickets_agent_id_fkey(
                id,
                email,
                profile:profiles(
                    full_name,
                    avatar_url
                )
            ),
            messages(
                *,
                user:users!messages_user_id_fkey(
                    id,
                    email,
                    profile:profiles(
                        full_name,
                        avatar_url
                    )
                )
            )
        `,
        )
        .eq('id', ticketId)
        .order('created_at', { foreignTable: 'messages', ascending: true })
        .single()

    if (ticketError) {
        console.warn('Full ticket fetch failed:', {
            error: ticketError,
            token: decodedToken,
        })
        return null
    }

    if (!ticketData) {
        console.warn('No ticket data found')
        return null
    }

    // Transform the messages to match MessageWithUser shape
    const messages = ticketData.messages.map(message => ({
        ...message,
        user: {
            email: message.user.email,
            profile: {
                full_name: message.user.profile?.full_name || null,
                avatar_url: message.user.profile?.avatar_url || null,
            },
        },
    }))

    // Transform to match TicketWithCustomer shape
    return {
        ...ticketData,
        status: ticketData.status ?? 'new',
        customer: {
            email: ticketData.customer.email,
            full_name: ticketData.customer.profile?.full_name ?? null,
        },
        messages,
    }
}

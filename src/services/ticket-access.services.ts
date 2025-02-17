import { createClient } from '@/lib/supabase/server'
import {
    createTicketTokenOptions,
    decodeTicketToken,
    requireTicketToken,
    setTicketTokenInSession,
} from '@/lib/utils/tokens'

import type { MessageWithUser } from '@/lib/schemas/message.schemas'
import type {
    TicketStatusHistoryRow,
    TicketWithCustomer,
} from '@/lib/schemas/ticket.schemas'

export async function generateTicketAccessToken(
    ticketId: string,
    expiresIn = '7 days',
    createdBy?: string,
) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('generate_ticket_access_token', {
        p_ticket_id: ticketId,
        p_expires_in: expiresIn,
        p_created_by: createdBy,
    })

    if (error) throw error
    return data
}

export async function verifyTicketAccessToken(token: string) {
    const supabase = await createClient()

    // First set the token in the session
    await setTicketTokenInSession(token)

    // Now fetch the ticket data with the token session
    const { data: tokenData, error: tokenError } = await supabase
        .from('ticket_access_tokens')
        .select('*, ticket:tickets(*, customer:users(*))')
        .eq('token', requireTicketToken(token))
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
        .eq('token', requireTicketToken(token))

    return tokenData
}

export async function getTicketWithToken(
    ticketId: string,
    token: string,
): Promise<(TicketWithCustomer & { messages: MessageWithUser[] }) | null> {
    const supabase = await createClient()

    // First verify the token exists and is valid
    const { data: tokenData, error: tokenError } = await supabase
        .from('ticket_access_tokens')
        .select('*')
        .eq('token', requireTicketToken(token))
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

    console.log('Found valid token ✅')

    // Set the token in the session
    await setTicketTokenInSession(token)

    // Create a new Supabase client with the token in headers
    const clientWithToken = await createClient(createTicketTokenOptions(token))

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
            token: decodeTicketToken(token),
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

export async function getTicketHistoryWithToken(
    ticketId: string,
    token: string,
): Promise<TicketStatusHistoryRow[]> {
    const supabase = await createClient(createTicketTokenOptions(token))

    const { data, error } = await supabase
        .from('ticket_status_history')
        .select(
            `
            *,
            changed_by_name:users!changed_by(
                email,
                profile:profiles(
                    full_name
                )
            )
        `,
        )
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) {
        console.warn('Failed to fetch ticket history:', error)
        return []
    }

    return data.map(event => ({
        ...event,
        changed_by_name:
            event.changed_by_name?.profile?.full_name ??
            event.changed_by_name?.email,
        changed_by_email: event.changed_by_name?.email,
    }))
}

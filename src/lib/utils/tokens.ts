import { DatabaseError } from '../errors'
import { createClient } from '../supabase/server'

/**
 * Safely decode a ticket access token, handling URL encoding
 */
export function decodeTicketToken(token?: string): string | undefined {
    if (!token) return undefined
    try {
        return decodeURIComponent(token)
    } catch (error) {
        console.warn('[decodeTicketToken] Failed to decode token:', error)
        return token // Return original if decoding fails
    }
}

/**
 * Decode a ticket token and throw if invalid
 */
export function requireTicketToken(token?: string): string {
    const decoded = decodeTicketToken(token)
    if (!decoded) {
        throw new DatabaseError('Invalid or missing token')
    }
    return decoded
}

/**
 * Create Supabase client options with ticket token header
 */
export function createTicketTokenOptions(token?: string) {
    const decodedToken = decodeTicketToken(token)
    return decodedToken ? { 'x-ticket-token': decodedToken } : undefined
}

/**
 * Set ticket token in the database session
 */
export async function setTicketTokenInSession(token?: string) {
    if (!token) return

    const decodedToken = decodeTicketToken(token)
    if (!decodedToken) return

    console.log('[setTicketTokenInSession] Setting token in session:', {
        source: 'passed in',
        token: decodedToken.slice(0, 8) + '...',
    })

    const db = await createClient({ 'x-ticket-token': decodedToken })
    const { error: setError } = await db.rpc('set_ticket_access_token', {
        p_token: decodedToken,
    })

    if (setError) throw new DatabaseError(setError.message)
}

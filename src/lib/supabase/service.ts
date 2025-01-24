import { createClient } from '@supabase/supabase-js'

import type { Database } from './types'

/**
 * Supabase client with service role access.
 * Use this client for operations that need to bypass RLS policies:
 * - Webhooks
 * - Background jobs
 * - System-level operations
 *
 * ⚠️ WARNING: This client has full database access.
 * Only use it in server-side code and never expose it to the client.
 */
export const createServiceClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
    }

    if (!supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

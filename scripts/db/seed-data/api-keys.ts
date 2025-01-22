import { SupabaseClient } from '@supabase/supabase-js'

import { DEMO_USER } from './users'

import type { Database } from '@/lib/supabase/types'

type ApiKeyResponse = {
    api_key_id: string
    api_key: string
}

export async function seedApiKeys(supabase: SupabaseClient<Database>) {
    console.log('🔑 Seeding API keys...')

    // Get the admin user's ID
    const { data: adminUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', DEMO_USER.email)
        .single()

    if (userError || !adminUser) {
        throw new Error('Failed to find admin user')
    }

    // Generate test API keys using our database function
    const keys = [
        { name: 'Development Key' },
        { name: 'Production Key' },
        { name: 'Test Key' },
    ]

    for (const key of keys) {
        const { data, error } = await supabase.rpc('generate_api_key', {
            key_name: key.name,
            user_id: adminUser.id,
        })

        if (error) {
            throw new Error(`Failed to generate API key: ${error.message}`)
        }

        if (data) {
            // Log the generated key (only in development)
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Generated ${key.name}:`, {
                    id: (data as ApiKeyResponse).api_key_id,
                    key: (data as ApiKeyResponse).api_key,
                })
            }
        }
    }

    console.log('✅ API keys seeded')
}

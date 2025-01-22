import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

import { seedApiKeys } from './seed-data/api-keys'
import { seedInternalNotes } from './seed-data/internal-notes'
import { seedMessages } from './seed-data/messages'
import { seedTickets } from './seed-data/tickets'
import { seedUsers } from './seed-data/users'

import type { Database } from '@/lib/supabase/types'

// Load the environment variables first
dotenv.config({ path: '.env.local' }) // Load local env first as fallback

// Then check NODE_ENV and load production env if needed
const isProd = process.env.NODE_ENV === 'production'
if (isProd) {
    console.log('🌍 Loading production environment (.env.production)')
    dotenv.config({ path: '.env.production', override: true })
} else {
    console.log('🌍 Using local environment (.env.local)')
}

// Validate required environment variables
const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
]
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
    console.error(
        '❌ Missing required environment variables:',
        missingEnvVars.join(', '),
    )
    console.error(
        `Please ensure these are set in ${isProd ? '.env.production' : '.env.local'}`,
    )
    process.exit(1)
}

// Create a Supabase client with service role for seeding
const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
)

async function main() {
    try {
        // Verify database connection
        const { error: pingError } = await supabase
            .from('profiles')
            .select('count')
            .limit(0)
        if (pingError) {
            throw new Error(
                `Failed to connect to database: ${pingError.message}`,
            )
        }

        console.log('🧹 Cleaning existing data...')
        await supabase
            .from('ticket_internal_notes')
            .delete()
            .neq('id', '0')
            .throwOnError()
        await supabase.from('messages').delete().neq('id', '0').throwOnError()
        await supabase.from('tickets').delete().neq('id', '0').throwOnError()
        await supabase.from('api_keys').delete().neq('id', '0').throwOnError()
        await supabase.from('profiles').delete().neq('id', '0').throwOnError()
        await supabase.from('users').delete().neq('id', '0').throwOnError()
        console.log('✅ Database cleaned')

        console.log('🌱 Creating application data...')
        await seedUsers(supabase)
        await seedTickets(supabase)
        await seedInternalNotes(supabase)
        await seedMessages(supabase)
        await seedApiKeys(supabase)
        console.log('✅ Seed data created successfully')
    } catch (error) {
        console.error('❌ Failed to seed database:', error)
        if (isProd) {
            console.error('\nFor production seeding, please ensure:')
            console.error(
                '1. Your SUPABASE_SERVICE_ROLE_KEY is correct and has sufficient permissions',
            )
            console.error(
                '2. Your database is accessible from your current IP address',
            )
            console.error('3. The database exists and is properly linked')
        }
        process.exit(1)
    }
}

main()

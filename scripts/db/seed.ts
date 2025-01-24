import dotenv from 'dotenv'

import { createServiceClient } from '@/lib/supabase/service'

import { seedAccessTokens } from './seed-data/access-tokens'
import { seedApiKeys } from './seed-data/api-keys'
import { seedInternalNotes } from './seed-data/internal-notes'
import { seedMessages } from './seed-data/messages'
import { seedStatusHistory } from './seed-data/status-history'
import { seedTickets } from './seed-data/tickets'
import { seedUsers } from './seed-data/users'

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

// Create a Supabase client with service role for seeding
const supabase = createServiceClient()

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
            .from('ticket_status_history')
            .delete()
            .neq('id', '0')
            .throwOnError()
        await supabase
            .from('ticket_internal_notes')
            .delete()
            .neq('id', '0')
            .throwOnError()
        await supabase.from('messages').delete().neq('id', '0').throwOnError()
        await supabase.from('tickets').delete().neq('id', '0').throwOnError()
        await supabase.from('api_keys').delete().neq('id', '0').throwOnError()
        await supabase
            .from('ticket_access_tokens')
            .delete()
            .neq('id', '0')
            .throwOnError()
        await supabase.from('profiles').delete().neq('id', '0').throwOnError()
        await supabase.from('users').delete().neq('id', '0').throwOnError()
        console.log('✅ Database cleaned')

        console.log('🌱 Creating application data...')
        const { agentMap } = await seedUsers(supabase)
        const ticketMap = await seedTickets(supabase)
        await seedInternalNotes(supabase)
        await seedMessages(supabase)
        await seedApiKeys(supabase)
        await seedStatusHistory(supabase, ticketMap, agentMap)
        const { ticketId, token } = await seedAccessTokens(supabase)
        console.log('✅ Seed data created successfully')

        // Log the access URL if we're not in production
        if (!isProd && token) {
            const baseUrl =
                process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
            console.log('\n🔗 Demo Ticket Access URL:')
            console.log(`${baseUrl}/tickets/${ticketId}/access/${token}`)
            console.log(
                '\nThis URL can be used to access the ticket without authentication',
            )
        }
    } catch (error) {
        console.error('❌ Error seeding database:', error)
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

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

import { seedMessages } from './seed-data/messages'
import { seedTickets } from './seed-data/tickets'
import { seedUsers } from './seed-data/users'

import type { Database } from '@/lib/supabase/types'

const isProd = process.env.NODE_ENV === 'production'
const envFile = isProd ? '.env.production' : '.env.local'

console.log(
    `🌍 Using ${isProd ? 'production' : 'local'} environment (${envFile})`,
)
dotenv.config({ path: envFile })

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
        console.log('🧹 Cleaning existing data...')
        await supabase.from('messages').delete()
        await supabase.from('tickets').delete()
        await supabase.from('profiles').delete()
        await supabase.from('users').delete()
        console.log('✅ Database cleaned')

        console.log('🌱 Creating application data...')
        await seedUsers(supabase)
        await seedTickets(supabase)
        await seedMessages(supabase)
        console.log('✅ Seed data created successfully')
    } catch (error) {
        console.error('❌ Failed to seed database:', error)
        process.exit(1)
    }
}

main()

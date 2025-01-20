import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { DEMO_USER, TEST_USERS, type SeedUser } from './seed-data/users'
import { SEED_TICKETS } from './seed-data/tickets'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface User {
    id: string
    email: string
    is_active: boolean
}

async function cleanDatabase() {
    try {
        console.log('🧹 Cleaning existing data...')
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Delete in correct order due to foreign key constraints
        await supabase.from('tickets').delete().neq('id', '')
        await supabase.from('profiles').delete().neq('id', '')
        await supabase.from('users').delete().neq('id', '')

        console.log('✅ Database cleaned')
    } catch (error) {
        console.error('❌ Error cleaning database:', error)
        throw error
    }
}

async function ensureUsers(users: SeedUser[]) {
    try {
        console.log('👥 Ensuring users exist...')
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })

        // Get all existing users in one call
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const createdUsers = []

        for (const userData of users) {
            const existingUser = existingUsers?.users.find(
                u => u.email === userData.email,
            )

            let authUser
            if (!existingUser) {
                // Create auth user if doesn't exist
                const { data: newAuthUser, error: authError } =
                    await supabase.auth.admin.createUser({
                        email: userData.email,
                        password: userData.password,
                        email_confirm: true,
                    })

                if (authError) throw authError
                authUser = newAuthUser.user
                console.log(`✅ Created auth user: ${userData.email}`)
            } else {
                authUser = existingUser
                console.log(`✅ Using existing auth user: ${userData.email}`)
            }

            // Upsert app user
            const { data: user, error: userError } = await supabase
                .from('users')
                .upsert(
                    {
                        id: authUser.id,
                        email: userData.email,
                        is_active: true,
                    },
                    { onConflict: 'id' },
                )
                .select()
                .single()

            if (userError) throw userError

            // Upsert profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(
                    {
                        user_id: user.id,
                        full_name: userData.name,
                        bio: userData.bio,
                        role: userData.role,
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
                    },
                    { onConflict: 'user_id' },
                )

            if (profileError) throw profileError
            createdUsers.push(user)
        }

        return createdUsers
    } catch (error) {
        console.error('❌ Error ensuring users:', error)
        throw error
    }
}

async function createSeedTickets(supabase: SupabaseClient, users: User[]) {
    try {
        console.log('🎫 Creating seed tickets...')

        // First user is demo user, rest are from TEST_USERS
        const demoUser = users[0]
        const testUsers = users.slice(1)

        const customers = testUsers.filter(
            user =>
                TEST_USERS.find(u => u.email === user.email)?.role ===
                'customer',
        )

        const agents = testUsers.filter(
            user =>
                TEST_USERS.find(u => u.email === user.email)?.role === 'agent',
        )

        const tickets = SEED_TICKETS.map(ticket => ({
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            customer_id:
                ticket.customer_index === -1
                    ? demoUser.id
                    : customers[ticket.customer_index].id,
            agent_id:
                ticket.agent_index !== undefined
                    ? agents[ticket.agent_index - 2].id
                    : undefined,
        }))

        const { error } = await supabase.from('tickets').insert(tickets)

        if (error) throw error
        console.log('✅ Seed tickets created successfully')
    } catch (error) {
        console.error('❌ Error creating seed tickets:', error)
        throw error
    }
}

async function seed() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing Supabase credentials')
        console.log(
            'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables',
        )
        process.exit(1)
    }

    try {
        await cleanDatabase()
        console.log('🌱 Creating application data...')

        // Create all users (including demo user) in one go
        const allUsers = [DEMO_USER, ...TEST_USERS]
        const createdUsers = await ensureUsers(allUsers)

        // Create seed tickets
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        await createSeedTickets(supabase, createdUsers)

        console.log('✅ Development seed data created successfully')
    } catch (error) {
        console.error('❌ Error seeding development data:', error)
        throw error
    }
}

// Only run if this file is executed directly
if (import.meta.main === true) {
    seed().catch(error => {
        console.error('Failed to seed development data:', error)
        process.exit(1)
    })
}

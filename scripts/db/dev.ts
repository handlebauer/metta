import { createClient } from '@supabase/supabase-js'

const DEMO_USER = {
    email: 'demo@example.com',
    password: 'demo123456',
    name: 'Demo User',
    role: 'agent',
    bio: 'Demo account for testing',
}

// Additional test users
const TEST_USERS = [
    {
        email: 'customer1@example.com',
        password: 'test123456',
        name: 'Alice Johnson',
        role: 'customer',
        bio: 'Regular customer account',
    },
    {
        email: 'customer2@example.com',
        password: 'test123456',
        name: 'Bob Smith',
        role: 'customer',
        bio: 'Premium customer account',
    },
    {
        email: 'agent1@example.com',
        password: 'test123456',
        name: 'Carol Williams',
        role: 'agent',
        bio: 'Support agent - Level 1',
    },
    {
        email: 'agent2@example.com',
        password: 'test123456',
        name: 'David Brown',
        role: 'agent',
        bio: 'Support agent - Level 2',
    },
]

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

async function ensureUsers(users: (typeof TEST_USERS)[0][]) {
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
        await ensureUsers(allUsers)

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

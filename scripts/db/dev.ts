import { createClient } from '@supabase/supabase-js'

const DEMO_USER = {
    email: 'demo@example.com',
    password: 'demo123456',
}

async function cleanDatabase() {
    try {
        console.log('🧹 Cleaning existing data...')
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // Delete all profiles first (due to foreign key constraints)
        await supabase.from('profiles').delete().neq('id', '')
        // Delete all users
        await supabase.from('users').delete().neq('id', '')

        console.log('✅ Database cleaned')
    } catch (error) {
        console.error('❌ Error cleaning database:', error)
        throw error
    }
}

async function ensureAuthUser() {
    try {
        console.log('🔐 Ensuring demo auth user exists...')
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        )

        // Check if auth user exists
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const demoUser = existingUser?.users.find(
            u => u.email === DEMO_USER.email,
        )

        if (!demoUser) {
            // Create demo user in Supabase Auth
            const { error: createError } = await supabase.auth.admin.createUser(
                {
                    email: DEMO_USER.email,
                    password: DEMO_USER.password,
                    email_confirm: true,
                },
            )

            if (createError) throw createError
            console.log('✅ Demo auth user created')
        } else {
            console.log('✅ Demo auth user already exists')
        }

        return demoUser?.id
    } catch (error) {
        console.error('❌ Error ensuring auth user:', error)
        throw error
    }
}

async function seed() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing Supabase credentials')
        console.log(
            'Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables',
        )
        process.exit(1)
    }

    try {
        await cleanDatabase()
        const authUserId = await ensureAuthUser()

        if (!authUserId) {
            throw new Error('Failed to get auth user ID')
        }

        console.log('🌱 Creating application data...')
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
        )

        // Create demo user in the application database
        const { data: user, error: userError } = await supabase
            .from('users')
            .insert({
                id: authUserId,
                email: DEMO_USER.email,
                is_active: true,
            })
            .select()
            .single()

        if (userError) throw userError
        if (!user) throw new Error('Failed to create user')

        // Create demo user profile
        const { error: profileError } = await supabase.from('profiles').insert({
            user_id: user.id,
            full_name: 'Demo User',
            bio: 'Demo account for testing',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        })

        if (profileError) throw profileError

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

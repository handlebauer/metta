import { redirect } from 'next/navigation'

import { UsersTable } from '@/components/users/users-table.client'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/actions/user.actions'

import type { UserWithProfile } from '@/components/users/users-table.client'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UsersPage({ searchParams }: PageProps) {
    const supabase = await createClient()

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await getProfile(user.id)

    if (profileError || !profile) {
        throw new Error('Failed to load user profile')
    }

    // Only admins can access this page
    if (profile.role !== 'admin') {
        redirect('/dashboard')
    }

    // Build query based on type filter
    let query = supabase.from('users').select(
        `
            *,
            profiles!inner (
                full_name,
                role,
                avatar_url
            ),
            assigned_tickets:tickets!agent_id (count),
            created_tickets:tickets!customer_id (count)
        `,
    )

    // Apply role filter if specified
    const type = (await searchParams).type as
        | 'admin'
        | 'agent'
        | 'customer'
        | undefined

    if (type) {
        query = query.eq('profiles.role', type)
    }

    // Get users with their profiles
    const { data: users, error: usersError } = await query.order('created_at', {
        ascending: false,
    })

    if (usersError) {
        throw new Error('Failed to load users')
    }

    // Transform the data to match our component's expected format
    const transformedUsers: UserWithProfile[] = users.map(user => ({
        id: user.id,
        email: user.email,
        is_active: user.is_active ?? false,
        last_sign_in_at: user.last_sign_in_at,
        profile: {
            full_name: user.profiles?.full_name ?? null,
            role: user.profiles?.role ?? 'customer',
            avatar_url: user.profiles?.avatar_url ?? null,
        },
        ticket_counts: {
            assigned: user.assigned_tickets?.[0]?.count ?? 0,
            created: user.created_tickets?.[0]?.count ?? 0,
        },
    }))

    // Get the title based on the type
    const title = type
        ? `${type.charAt(0).toUpperCase() + type.slice(1)}s`
        : 'All Users'

    return (
        <div className="flex-1 space-y-4 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {title}
                    </h2>
                    <p className="text-muted-foreground">
                        Manage user accounts and roles
                    </p>
                </div>
            </div>

            <UsersTable users={transformedUsers} />
        </div>
    )
}

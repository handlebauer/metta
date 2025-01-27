import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PlusCircle } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { UsersTable } from '@/components/users/users-table.client'
import { getAuthenticatedUserWithProfile } from '@/actions/user-with-profile.actions'

import type { UserWithProfile } from '@/components/users/users-table.client'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    params: Promise<{ slug: string }>
}

export default async function UsersPage({ searchParams, params }: PageProps) {
    const { slug } = await params
    // Get authenticated user with profile
    const { data: user, error } = await getAuthenticatedUserWithProfile()

    if (error || !user) {
        redirect('/login')
    }

    // Only admins can access this page
    if (user.profile.role !== 'admin') {
        redirect(`/${slug}`)
    }

    const supabase = await createClient()

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
    const { data: users, error: usersError } = await query

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
                <div className="flex items-center">
                    <h2 className="flex items-center text-2xl font-bold tracking-tight">
                        {title}
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="group ml-2 h-8 hover:bg-transparent"
                            aria-label="Create new user"
                        >
                            <Link
                                href={`/${slug}/users/new`}
                                prefetch={true}
                                className="flex items-center gap-1"
                            >
                                <PlusCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                                <span className="text-sm font-normal text-semi-muted-foreground transition-colors group-hover:text-foreground">
                                    Create
                                </span>
                            </Link>
                        </Button>
                    </h2>
                </div>
            </div>

            <UsersTable users={transformedUsers} />
        </div>
    )
}

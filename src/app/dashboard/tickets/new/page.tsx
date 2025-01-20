import { redirect } from 'next/navigation'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { NewTicketForm } from '@/components/tickets/new-ticket-form'
import { createClient } from '@/lib/supabase/server'
import { getAllActiveUsersExcept } from '@/actions/users'

export default async function NewTicketPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user's role from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (!profile) {
        throw new Error('Profile not found')
    }

    // Get all users except current user if agent
    const { data: users = [], error } =
        profile.role === 'agent'
            ? await getAllActiveUsersExcept(user.id)
            : { data: [], error: null }

    if (error) {
        console.error('Failed to load users:', error)
    }

    return (
        <div className="flex-1 space-y-4 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        New Ticket
                    </h2>
                    <p className="text-muted-foreground">
                        Create a new support ticket
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ticket Details</CardTitle>
                    <CardDescription>
                        Please provide details about your issue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <NewTicketForm
                        customerId={user.id}
                        userRole={profile.role}
                        users={users}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

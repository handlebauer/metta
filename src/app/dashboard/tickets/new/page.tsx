import { redirect } from 'next/navigation'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { NewTicketForm } from '@/components/tickets/form/new-ticket-form.client'
import { createClient } from '@/lib/supabase/server'
import {
    getAllActiveUsersExcept,
    getProfile,
    getUser,
} from '@/actions/user.actions'

export default async function NewTicketPage() {
    const supabase = await createClient()
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    // Get app-level user data and profile
    const [userResult, profileResult] = await Promise.all([
        getUser(authUser.id),
        getProfile(authUser.id),
    ])

    if (!userResult.data || !profileResult.data) {
        throw new Error('User or profile not found')
    }

    const user = {
        ...userResult.data,
        profile: profileResult.data,
    }

    // Get all users if agent or admin
    const { data: users = [], error } =
        profileResult.data.role === 'agent' ||
        profileResult.data.role === 'admin'
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
                        userRole={user.profile.role}
                        users={users}
                        currentUser={user}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

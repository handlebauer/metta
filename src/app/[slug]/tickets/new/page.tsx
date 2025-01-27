import { redirect } from 'next/navigation'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { NewTicketForm } from '@/components/tickets/form/new-ticket-form.client'
import { UserWithProfileService } from '@/services/user-with-profile.services'
import { getAuthenticatedUserWithProfile } from '@/actions/user-with-profile.actions'

export default async function NewTicketPage() {
    // Get authenticated user with profile
    const { data: user, error } = await getAuthenticatedUserWithProfile()

    if (error || !user) {
        redirect('/login')
    }

    // Get all users if agent or admin
    const userService = new UserWithProfileService()
    const users =
        user.profile.role === 'agent' || user.profile.role === 'admin'
            ? await userService.findAllActiveExcept(user.id)
            : []

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

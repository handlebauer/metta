import { redirect } from 'next/navigation'

import { NewUserForm } from '@/components/users/form/new-user-form.client'
import { getAuthenticatedUserWithProfile } from '@/actions/user-with-profile.actions'

export default async function NewUserPage() {
    // Get authenticated user with profile
    const { data: user, error } = await getAuthenticatedUserWithProfile()

    if (error || !user) {
        redirect('/login')
    }

    return (
        <div className="flex-1 p-8">
            <NewUserForm currentUser={user} />
        </div>
    )
}

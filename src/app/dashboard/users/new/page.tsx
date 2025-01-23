import { redirect } from 'next/navigation'

import { NewUserForm } from '@/components/users/form/new-user-form.client'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/actions/user.actions'

export default async function NewUserPage() {
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

    return (
        <div className="flex-1 p-8">
            <NewUserForm currentUserRole={profile.role} />
        </div>
    )
}

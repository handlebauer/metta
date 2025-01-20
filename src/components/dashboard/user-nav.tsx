import { User } from '@supabase/supabase-js'
import { SignOutButton } from '../auth/sign-out.client'

export function UserNav({ user }: { user: User }) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-sm">{user.email}</span>
            <SignOutButton />
        </div>
    )
}

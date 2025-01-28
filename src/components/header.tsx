import { Brand } from '@/components/ui/brand'
import { UserNav } from '@/components/dashboard/user-nav'

import type { UserWithProfile } from '@/lib/schemas/user-with-profile.schemas'

interface HeaderProps {
    user?: UserWithProfile
}

export function Header({ user }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
                <Brand>metta</Brand>
                {user && <UserNav user={user} />}
            </div>
        </header>
    )
}

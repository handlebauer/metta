import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserWithProfile } from '@/lib/schemas/user-with-profile.schemas'

import { DashboardButton } from './dashboard-button.client'
import { SignOutItem } from './sign-out-item.client'

export function UserNav({ user }: { user: UserWithProfile }) {
    // Get initials from email
    const initials = user.email?.split('@')[0].slice(0, 2).toUpperCase() || '??'

    return (
        <div className="flex items-center gap-2">
            <DashboardButton />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="h-11 w-11 cursor-pointer border border-muted-foreground/30 hover:opacity-80">
                        <AvatarFallback className="select-none bg-zinc-700 text-sm font-medium text-zinc-50">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {user.email}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.profile.role}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <SignOutItem />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

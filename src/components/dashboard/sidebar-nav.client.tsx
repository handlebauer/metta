'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
    Code,
    Crown,
    Headphones,
    Inbox,
    List,
    Plus,
    Settings,
    Sliders,
    User,
    Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { UserWithProfile } from '@/lib/schemas/user-with-profile.schemas'

interface SidebarNavProps {
    user: UserWithProfile
}

interface UserType {
    type: 'admin' | 'agent' | 'customer'
    label: string
    icon: typeof Crown | typeof Headphones | typeof User
}

const USER_TYPES: UserType[] = [
    { type: 'admin', label: 'Admins', icon: Crown },
    { type: 'agent', label: 'Agents', icon: Headphones },
    { type: 'customer', label: 'Customers', icon: User },
]

function UserTypeButton({
    type,
    label,
    icon: Icon,
    isActive,
    showAdd,
}: UserType & { isActive: boolean; showAdd: boolean }) {
    const pathname = usePathname()

    return (
        <>
            <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                    'w-full justify-start pl-7',
                    isActive && 'bg-muted',
                )}
            >
                <Link href={`/dashboard/users?type=${type}`}>
                    <Icon className="mr-2 h-3.5 w-3.5" />
                    {label}
                </Link>
            </Button>
            {showAdd && (
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(
                        'w-full justify-start pl-10',
                        pathname === '/dashboard/users/new' && 'bg-muted',
                    )}
                >
                    <Link
                        href={`/dashboard/users/new?type=${type}`}
                        prefetch={true}
                    >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Add
                    </Link>
                </Button>
            )}
        </>
    )
}

export function SidebarNav({ user }: SidebarNavProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const isTicketsSection = pathname?.startsWith('/dashboard/tickets')
    const isUsersSection = pathname?.startsWith('/dashboard/users')
    const userType = searchParams.get('type') as
        | 'admin'
        | 'agent'
        | 'customer'
        | null

    return (
        <div className="select-none space-y-0.5">
            <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                    'w-full justify-start font-medium',
                    isTicketsSection && 'bg-muted/50',
                )}
            >
                <Link href="/dashboard/tickets">
                    <div className="flex items-center">
                        <Inbox className="mr-2 h-3.5 w-3.5" />
                        Tickets
                    </div>
                </Link>
            </Button>
            <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                    'w-full justify-start pl-7',
                    pathname === '/dashboard/tickets' && 'bg-muted',
                )}
            >
                <Link href="/dashboard/tickets">
                    <List className="mr-2 h-3.5 w-3.5" />
                    View
                </Link>
            </Button>
            <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                    'w-full justify-start pl-7',
                    pathname === '/dashboard/tickets/new' && 'bg-muted',
                )}
            >
                <Link href="/dashboard/tickets/new" prefetch={true}>
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Create
                </Link>
            </Button>

            {/* Users section - only visible to admins */}
            {user.profile.role === 'admin' && (
                <>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'mt-4 w-full justify-start font-medium',
                            isUsersSection && 'bg-muted/50',
                        )}
                    >
                        <Link href="/dashboard/users">
                            <div className="flex items-center">
                                <Users className="mr-2 h-3.5 w-3.5" />
                                Users
                            </div>
                        </Link>
                    </Button>
                    {USER_TYPES.map(userTypeData => (
                        <UserTypeButton
                            key={userTypeData.type}
                            {...userTypeData}
                            isActive={
                                isUsersSection && userType === userTypeData.type
                            }
                            showAdd={userType === userTypeData.type}
                        />
                    ))}

                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'mt-4 w-full justify-start font-medium',
                            pathname?.startsWith('/dashboard/settings') &&
                                'bg-muted/50',
                        )}
                    >
                        <Link href="/dashboard/settings">
                            <div className="flex items-center">
                                <Settings className="mr-2 h-3.5 w-3.5" />
                                Settings
                            </div>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'w-full justify-start pl-7',
                            pathname === '/dashboard/settings/preferences' &&
                                'bg-muted',
                        )}
                    >
                        <Link href="/dashboard/settings/preferences">
                            <Sliders className="mr-2 h-3.5 w-3.5" />
                            General
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'w-full justify-start pl-7',
                            pathname === '/dashboard/settings/developer' &&
                                'bg-muted',
                        )}
                    >
                        <Link href="/dashboard/settings/developer">
                            <Code className="mr-2 h-3.5 w-3.5" />
                            Developer
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}

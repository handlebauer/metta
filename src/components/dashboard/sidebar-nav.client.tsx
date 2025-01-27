'use client'

import Link from 'next/link'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import {
    BarChart,
    Clock,
    Code,
    Crown,
    Headphones,
    Inbox,
    LineChart,
    List,
    Plus,
    Settings,
    Sliders,
    User,
    Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
    const { slug } = useParams()

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
                <Link href={`/${slug}/users?type=${type}`}>
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
                        pathname === `/${slug}/users/new` && 'bg-muted',
                    )}
                >
                    <Link
                        href={`/${slug}/users/new?type=${type}`}
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
    const { slug } = useParams()
    const searchParams = useSearchParams()
    const isTicketsSection = pathname?.startsWith(`/${slug}/tickets`)
    const isUsersSection = pathname?.startsWith(`/${slug}/users`)
    const isStatsSection = pathname?.startsWith(`/${slug}/stats`)
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
                <Link href={`/${slug}/tickets`}>
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
                    pathname === `/${slug}/tickets` && 'bg-muted',
                )}
            >
                <Link href={`/${slug}/tickets`}>
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
                    pathname === `/${slug}/tickets/new` && 'bg-muted',
                )}
            >
                <Link href={`/${slug}/tickets/new`} prefetch={true}>
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
                        <Link href={`/${slug}/users`}>
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
                            isStatsSection && 'bg-muted/50',
                        )}
                    >
                        <Link href={`/${slug}/stats`}>
                            <div className="flex items-center">
                                <BarChart className="mr-2 h-3.5 w-3.5" />
                                Stats
                            </div>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'w-full justify-start pl-7',
                            pathname === `/${slug}/stats` && 'bg-muted',
                        )}
                    >
                        <Link href={`/${slug}/stats`}>
                            <LineChart className="mr-2 h-3.5 w-3.5" />
                            Overview
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'w-full justify-start pl-7',
                            pathname === `/${slug}/stats/trends` && 'bg-muted',
                        )}
                    >
                        <Link href={`/${slug}/stats/trends`}>
                            <Clock className="mr-2 h-3.5 w-3.5" />
                            Trends
                        </Link>
                    </Button>
                </>
            )}

            {/* Settings section - only visible to admins */}
            {user.profile.role === 'admin' && (
                <>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'mt-4 w-full justify-start font-medium',
                            pathname?.startsWith(`/${slug}/settings`) &&
                                'bg-muted/50',
                        )}
                    >
                        <Link href={`/${slug}/settings`}>
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
                            pathname === `/${slug}/settings/preferences` &&
                                'bg-muted',
                        )}
                    >
                        <Link href={`/${slug}/settings/preferences`}>
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
                            pathname === `/${slug}/settings/developer` &&
                                'bg-muted',
                        )}
                    >
                        <Link href={`/${slug}/settings/developer`}>
                            <Code className="mr-2 h-3.5 w-3.5" />
                            Developer
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}

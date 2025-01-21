'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Crown, Headphones, Inbox, List, Plus, User, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarNavProps {
    userRole: 'customer' | 'agent' | 'admin'
}

export function SidebarNav({ userRole }: SidebarNavProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const isTicketsSection = pathname?.startsWith('/dashboard/tickets')
    const isUsersSection = pathname?.startsWith('/dashboard/users')
    const userType = searchParams.get('type')

    return (
        <div className="space-y-0.5 select-none">
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
                    New
                </Link>
            </Button>

            {/* Users section - only visible to admins */}
            {userRole === 'admin' && (
                <>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'w-full justify-start font-medium mt-4',
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
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'w-full justify-start pl-7',
                            isUsersSection &&
                                userType === 'admin' &&
                                'bg-muted',
                        )}
                    >
                        <Link href="/dashboard/users?type=admin">
                            <Crown className="mr-2 h-3.5 w-3.5" />
                            Admins
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'w-full justify-start pl-7',
                            isUsersSection &&
                                userType === 'agent' &&
                                'bg-muted',
                        )}
                    >
                        <Link href="/dashboard/users?type=agent">
                            <Headphones className="mr-2 h-3.5 w-3.5" />
                            Agents
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'w-full justify-start pl-7',
                            isUsersSection &&
                                userType === 'customer' &&
                                'bg-muted',
                        )}
                    >
                        <Link href="/dashboard/users?type=customer">
                            <User className="mr-2 h-3.5 w-3.5" />
                            Customers
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}

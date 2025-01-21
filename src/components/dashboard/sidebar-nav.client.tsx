'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox, List, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SidebarNav() {
    const pathname = usePathname()
    const isTicketsSection = pathname?.startsWith('/dashboard/tickets')

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
        </div>
    )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SidebarNav() {
    const pathname = usePathname()
    const isTicketsActive = pathname?.startsWith('/dashboard/tickets')

    return (
        <Button
            asChild
            variant="ghost"
            className={cn('justify-start', isTicketsActive && 'bg-muted')}
        >
            <Link href="/dashboard/tickets">
                <Inbox className="mr-2 h-4 w-4" />
                Tickets
            </Link>
        </Button>
    )
}

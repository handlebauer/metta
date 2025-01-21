'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function DashboardButton() {
    const pathname = usePathname()

    if (pathname.startsWith('/dashboard')) {
        return null
    }

    return (
        <Button variant="ghost" size="sm" asChild>
            <Link
                href="/dashboard"
                className="flex items-center gap-2 uppercase"
            >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
            </Link>
        </Button>
    )
}

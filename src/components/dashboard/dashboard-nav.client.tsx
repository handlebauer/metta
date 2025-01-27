'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, User } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function DashboardNav() {
    const pathname = usePathname()

    return (
        <div className="select-none space-y-0.5">
            <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                    'w-full justify-start font-medium',
                    pathname?.startsWith('/dashboard/workspaces') &&
                        'bg-muted/50',
                )}
            >
                <Link href="/dashboard/workspaces">
                    <div className="flex items-center">
                        <Building2 className="mr-2 h-3.5 w-3.5" />
                        Workspaces
                    </div>
                </Link>
            </Button>

            <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                    'w-full justify-start font-medium',
                    pathname?.startsWith('/dashboard/account') && 'bg-muted/50',
                )}
            >
                <Link href="/dashboard/account">
                    <div className="flex items-center">
                        <User className="mr-2 h-3.5 w-3.5" />
                        Account
                    </div>
                </Link>
            </Button>
        </div>
    )
}

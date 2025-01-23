import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { Tables } from '@/lib/supabase/types'

interface TicketStatusBadgeProps {
    status: Tables<'tickets'>['status']
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
    const { variant, className } = getStatusStyles(status)
    return (
        <Badge
            variant={variant}
            className={cn('min-w-[60px] justify-center text-center', className)}
        >
            {status}
        </Badge>
    )
}

function getStatusStyles(status: Tables<'tickets'>['status']): {
    variant: 'default' | 'secondary' | 'outline'
    className: string
} {
    switch (status) {
        case 'new':
            return {
                variant: 'outline',
                className:
                    'bg-accent-purple border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300',
            }
        case 'open':
            return {
                variant: 'outline',
                className:
                    'bg-accent-emerald border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300',
            }
        case 'closed':
            return {
                variant: 'outline',
                className:
                    'bg-muted border-muted-foreground/20 text-muted-foreground',
            }
        default:
            return {
                variant: 'default',
                className: '',
            }
    }
}

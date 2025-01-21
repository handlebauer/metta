import {
    AlertCircle,
    AlertOctagon,
    AlertTriangle,
    ArrowDown,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import type { Tables } from '@/lib/supabase/types'

interface TicketPriorityBadgeProps {
    priority: Tables<'tickets'>['priority']
}

export function TicketPriorityBadge({ priority }: TicketPriorityBadgeProps) {
    const { icon: Icon, className } = getPriorityStyles(priority)
    return (
        <div className="flex items-center gap-1.5 min-w-[60px] text-muted-foreground">
            <Icon className={cn('h-3.5 w-3.5', className)} />
            {priority}
        </div>
    )
}

function getPriorityStyles(priority: Tables<'tickets'>['priority']): {
    icon: typeof AlertOctagon
    className: string
} {
    switch (priority) {
        case 'urgent':
            return {
                icon: AlertOctagon,
                className: 'text-red-500',
            }
        case 'high':
            return {
                icon: AlertTriangle,
                className: 'text-orange-500',
            }
        case 'medium':
            return {
                icon: AlertCircle,
                className: 'text-yellow-500',
            }
        case 'low':
            return {
                icon: ArrowDown,
                className: 'text-green-500',
            }
        default:
            return {
                icon: AlertCircle,
                className: 'text-muted-foreground',
            }
    }
}

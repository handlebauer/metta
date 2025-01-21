import { Badge } from '@/components/ui/badge'

import type { Tables } from '@/lib/supabase/types'

interface TicketStatusBadgeProps {
    status: Tables<'tickets'>['status']
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
    const variant = getVariant(status)
    return (
        <Badge
            variant={variant}
            className="min-w-[60px] text-center justify-center"
        >
            {status}
        </Badge>
    )
}

function getVariant(
    status: Tables<'tickets'>['status'],
): 'default' | 'secondary' | 'outline' {
    switch (status) {
        case 'new':
            return 'default'
        case 'open':
            return 'secondary'
        case 'closed':
            return 'outline'
        default:
            return 'default'
    }
}

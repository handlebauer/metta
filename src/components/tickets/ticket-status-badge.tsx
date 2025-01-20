import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import type { TicketRow } from '@/lib/schemas/tickets'

interface TicketStatusBadgeProps {
    status: TicketRow['status']
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
    switch (status) {
        case 'new':
            return (
                <Badge variant="secondary" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    New
                </Badge>
            )
        case 'open':
            return (
                <Badge variant="default" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Open
                </Badge>
            )
        case 'closed':
            return (
                <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Closed
                </Badge>
            )
    }
}

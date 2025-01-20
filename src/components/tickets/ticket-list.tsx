import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import type { TicketRow } from '@/lib/schemas/tickets'
import Link from 'next/link'

interface TicketListProps {
    tickets: TicketRow[]
    isLoading?: boolean
    error?: string | null
    className?: string
}

function formatDate(date: string | null): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
}

export function TicketList({
    tickets,
    isLoading,
    error,
    className,
}: TicketListProps) {
    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-[100px] w-full" />
                <Skeleton className="h-[100px] w-full" />
                <Skeleton className="h-[100px] w-full" />
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <Card className="p-6 bg-destructive/10">
                <p className="text-destructive">
                    Failed to load tickets: {error}
                </p>
            </Card>
        )
    }

    // Empty state
    if (!tickets.length) {
        return (
            <Card className="p-6">
                <p className="text-muted-foreground">No tickets found</p>
            </Card>
        )
    }

    // Data state
    return (
        <div className={className}>
            {tickets.map(ticket => (
                <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                    <Card className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium leading-none">
                                        {ticket.subject}
                                    </h3>
                                    <StatusBadge status={ticket.status} />
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {ticket.description}
                                </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {formatDate(ticket.created_at)}
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

function StatusBadge({ status }: { status: TicketRow['status'] }) {
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

import {
    AlertCircle,
    AlertOctagon,
    AlertTriangle,
    ArrowDown,
    CheckCircle2,
    Clock4,
    UserPlus2,
} from 'lucide-react'

import type {
    TicketPriorityHistoryRow,
    TicketStatusHistoryRow,
} from '@/lib/schemas/ticket.schemas'

function CompactStatusBadge({ status }: { status: 'new' | 'open' | 'closed' }) {
    const className = (() => {
        switch (status) {
            case 'new':
                return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/20'
            case 'open':
                return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/20'
            case 'closed':
                return 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-500/20'
            default:
                return ''
        }
    })()

    return (
        <span
            className={`inline-block rounded-sm px-1.5 text-[10px] font-medium ${className}`}
        >
            {status}
        </span>
    )
}

function CompactPriorityBadge({
    priority,
}: {
    priority: 'low' | 'medium' | 'high' | 'urgent'
}) {
    const className = (() => {
        switch (priority) {
            case 'low':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/20'
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/20'
            case 'high':
                return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/20'
            case 'urgent':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/20'
            default:
                return ''
        }
    })()

    return (
        <span
            className={`inline-block rounded-sm px-1.5 text-[10px] font-medium ${className}`}
        >
            {priority}
        </span>
    )
}

interface TicketHistoryProps {
    ticketId: string
    history: (TicketStatusHistoryRow | TicketPriorityHistoryRow)[]
    createdAt: string
}

export function TicketHistory({ history, createdAt }: TicketHistoryProps) {
    if (history.length === 0 && !createdAt) {
        return (
            <div className="px-4 py-2">
                <p className="-mx-2 mt-1 text-sm text-muted-foreground">
                    No history yet
                </p>
            </div>
        )
    }

    const formatDate = (date: string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })
    }

    return (
        <div className="px-4 py-2">
            <div className="space-y-3">
                {history.map(event => {
                    const isStatusChange = 'new_status' in event
                    const isPriorityChange = 'new_priority' in event

                    return (
                        <div key={event.id} className="relative">
                            {/* Timeline connector */}
                            <div className="absolute left-2 top-6 h-full w-px -translate-x-1/2 bg-border" />

                            <div className="flex items-start gap-3">
                                {/* Status/Priority icon */}
                                <div className="relative z-10 rounded-full bg-background p-0.5 shadow-sm ring-1 ring-border">
                                    {isStatusChange && (
                                        <StatusIcon status={event.new_status} />
                                    )}
                                    {isPriorityChange && (
                                        <PriorityIcon
                                            priority={event.new_priority}
                                        />
                                    )}
                                </div>

                                {/* Event details */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[11px] font-medium">
                                                Changed to
                                            </span>
                                            {isStatusChange && (
                                                <CompactStatusBadge
                                                    status={event.new_status}
                                                />
                                            )}
                                            {isPriorityChange && (
                                                <CompactPriorityBadge
                                                    priority={
                                                        event.new_priority
                                                    }
                                                />
                                            )}
                                        </div>
                                        <time className="flex-none text-[11px] tabular-nums text-muted-foreground">
                                            {formatDate(event.created_at || '')}
                                        </time>
                                    </div>

                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        {event.changed_by_name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {/* Initial creation marker */}
                <div className="relative">
                    <div className="flex items-start gap-3">
                        <div className="relative z-10 rounded-full bg-background p-0.5 shadow-sm ring-1 ring-border">
                            <Clock4 className="h-3 w-3 text-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[11px] font-medium">
                                    Ticket created
                                </p>
                                <time className="flex-none text-[11px] tabular-nums text-muted-foreground">
                                    {formatDate(createdAt)}
                                </time>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatusIcon({ status }: { status: 'new' | 'open' | 'closed' }) {
    const Icon = (() => {
        switch (status) {
            case 'new':
                return UserPlus2
            case 'open':
                return Clock4
            case 'closed':
                return CheckCircle2
            default:
                return Clock4
        }
    })()

    const className = (() => {
        switch (status) {
            case 'new':
                return 'text-purple-600 dark:text-purple-400'
            case 'open':
                return 'text-emerald-600 dark:text-emerald-400'
            case 'closed':
                return 'text-zinc-400 dark:text-zinc-400'
            default:
                return 'text-muted-foreground'
        }
    })()

    return <Icon className={`h-3 w-3 ${className}`} />
}

function PriorityIcon({
    priority,
}: {
    priority: 'low' | 'medium' | 'high' | 'urgent'
}) {
    const Icon = (() => {
        switch (priority) {
            case 'low':
                return ArrowDown
            case 'medium':
                return AlertCircle
            case 'high':
                return AlertTriangle
            case 'urgent':
                return AlertOctagon
            default:
                return AlertCircle
        }
    })()

    const className = (() => {
        switch (priority) {
            case 'low':
                return 'text-green-600 dark:text-green-400'
            case 'medium':
                return 'text-yellow-600 dark:text-yellow-400'
            case 'high':
                return 'text-orange-600 dark:text-orange-400'
            case 'urgent':
                return 'text-red-600 dark:text-red-400'
            default:
                return 'text-muted-foreground'
        }
    })()

    return <Icon className={`h-3 w-3 ${className}`} />
}

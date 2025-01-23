import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, Inbox, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TicketList } from '@/components/tickets/list/ticket-list.client'
import { cn } from '@/lib/utils'
import { getTickets, getTicketStats } from '@/actions/ticket.actions'

type TicketStatus = 'new' | 'open' | 'closed'

interface TicketsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
    const status = (await searchParams).status as TicketStatus | undefined
    if (status && !['new', 'open', 'closed'].includes(status)) {
        redirect('/dashboard/tickets')
    }

    // Get ticket stats and tickets
    const [statsResult, ticketsResult] = await Promise.all([
        getTicketStats(),
        getTickets({ status }),
    ])

    const stats = statsResult.data || { total: 0, open: 0, closedToday: 0 }

    return (
        <div className="flex-1 space-y-4 p-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <h1 className="flex items-center text-2xl font-bold">
                        Tickets
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="group ml-2 h-8 hover:bg-transparent"
                            aria-label="Create new ticket"
                        >
                            <Link
                                href="/dashboard/tickets/new"
                                prefetch={true}
                                className="flex items-center gap-1"
                            >
                                <PlusCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                                <span className="text-sm font-normal text-semi-muted-foreground transition-colors group-hover:text-foreground">
                                    Create
                                </span>
                            </Link>
                        </Button>
                    </h1>
                </div>
            </div>

            <div className="mt-8">
                {/* Filter Buttons */}
                <div className="mb-4 flex gap-2">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className={cn('gap-2', !status && 'bg-muted')}
                    >
                        <Link href="/dashboard/tickets">
                            <Inbox className="h-4 w-4" />
                            All
                            <span className="text-muted-foreground">
                                {stats.total}
                            </span>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className={cn('gap-2', status === 'open' && 'bg-muted')}
                    >
                        <Link href="/dashboard/tickets?status=open">
                            <Clock className="h-4 w-4" />
                            Open
                            <span className="text-muted-foreground">
                                {stats.open}
                            </span>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className={cn(
                            'gap-2',
                            status === 'closed' && 'bg-muted',
                        )}
                    >
                        <Link href="/dashboard/tickets?status=closed">
                            <CheckCircle2 className="h-4 w-4" />
                            Closed Today
                            <span className="text-muted-foreground">
                                {stats.closedToday}
                            </span>
                        </Link>
                    </Button>
                </div>

                <TicketList
                    tickets={ticketsResult.data}
                    error={ticketsResult.error}
                    className="space-y-3"
                />
            </div>
        </div>
    )
}

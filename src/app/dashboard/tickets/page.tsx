import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, Inbox, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TicketList } from '@/components/tickets/list/ticket-list.client'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { getTickets, getTicketStats } from '@/actions/tickets'

type TicketStatus = 'new' | 'open' | 'closed'

interface TicketsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const status = (await searchParams).status as TicketStatus | undefined
    if (status && !['new', 'open', 'closed'].includes(status)) {
        redirect('/dashboard/tickets')
    }

    // Get ticket stats and tickets
    const [statsResult, ticketsResult] = await Promise.all([
        getTicketStats(),
        getTickets({ status }),
    ])

    console.log('status', status)

    const stats = statsResult.data || { total: 0, open: 0, closedToday: 0 }

    return (
        <div className="flex-1 space-y-4 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Tickets</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button asChild>
                        <Link href="/dashboard/tickets/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Ticket
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mt-8">
                {/* Filter Buttons */}
                <div className="flex gap-2 mb-4">
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
                                ({stats.total})
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
                                ({stats.open})
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
                                ({stats.closedToday})
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

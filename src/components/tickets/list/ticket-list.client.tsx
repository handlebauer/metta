'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import { ticketColumns } from './ticket-columns'

import type { TicketWithCustomer } from '@/lib/schemas/ticket.schemas'
import type { Database } from '@/lib/supabase/types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { SortingState } from '@tanstack/react-table'

export interface TicketListProps {
    tickets: TicketWithCustomer[]
    isLoading?: boolean
    error?: string | null
    className?: string
}

type Ticket = Database['public']['Tables']['tickets']['Row']

// Helper to check if a ticket is an AI incident
const isAIIncident = (ticket: TicketWithCustomer) =>
    !ticket.parent_ticket_id &&
    ticket.customer.email === 'ai.sysadmin@metta.now'

// Helper to group tickets by parent
const groupTickets = (tickets: TicketWithCustomer[]) => {
    return tickets.reduce(
        (acc, ticket) => {
            if (!ticket.parent_ticket_id) {
                // This is a parent ticket or standalone ticket
                if (!acc[ticket.id]) {
                    acc[ticket.id] = {
                        parent: ticket,
                        children: [],
                        isAI: isAIIncident(ticket),
                    }
                } else {
                    acc[ticket.id].parent = ticket
                    acc[ticket.id].isAI = isAIIncident(ticket)
                }
            } else {
                // This is a child ticket
                if (!acc[ticket.parent_ticket_id]) {
                    acc[ticket.parent_ticket_id] = {
                        children: [ticket],
                        isAI: false,
                    }
                } else {
                    acc[ticket.parent_ticket_id].children.push(ticket)
                }
            }
            return acc
        },
        {} as Record<
            string,
            {
                parent?: TicketWithCustomer
                children: TicketWithCustomer[]
                isAI: boolean
            }
        >,
    )
}

// Helper to flatten grouped tickets with AI incidents first
const flattenGroupedTickets = (
    groupedTickets: Record<
        string,
        {
            parent?: TicketWithCustomer
            children: TicketWithCustomer[]
            isAI: boolean
        }
    >,
) => {
    // Sort groups by AI status first, then by creation date
    const sortedGroups = Object.entries(groupedTickets).sort(([, a], [, b]) => {
        // AI incidents go first
        if (a.isAI && !b.isAI) return -1
        if (!a.isAI && b.isAI) return 1

        // Then sort by creation date (newest first)
        const aDate = a.parent?.created_at || ''
        const bDate = b.parent?.created_at || ''
        return bDate.localeCompare(aDate)
    })

    // Flatten the sorted groups
    return sortedGroups.reduce((acc, [, { parent, children }]) => {
        if (parent) {
            acc.push(parent)
            // Sort children by creation date (newest first)
            const sortedChildren = [...children].sort((a, b) => {
                const aDate = a.created_at || ''
                const bDate = b.created_at || ''
                return bDate.localeCompare(aDate)
            })
            acc.push(...sortedChildren)
        }
        return acc
    }, [] as TicketWithCustomer[])
}

export function TicketList({
    tickets: initialTickets,
    isLoading,
    error,
    className,
}: TicketListProps) {
    const router = useRouter()
    const { slug } = useParams()
    const [tickets, setTickets] = useState<TicketWithCustomer[]>(initialTickets)
    const [sorting, setSorting] = useState<SortingState>([]) // Remove default sorting since we handle it in flattenGroupedTickets

    // Set up realtime subscription
    useEffect(() => {
        const supabase = createClient()
        console.log('[TicketList] Setting up realtime subscription...')

        // Subscribe to all ticket changes
        const channel = supabase
            .channel('ticket-updates')
            .on<Ticket>(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tickets',
                },
                async (payload: RealtimePostgresChangesPayload<Ticket>) => {
                    console.log('[TicketList] Received ticket update:', payload)

                    // Only proceed if we have a valid ticket ID
                    const newTicket = payload.new
                    const oldTicket = payload.old

                    // For DELETE events, we only need the old ticket ID
                    if (payload.eventType === 'DELETE') {
                        if (!oldTicket || !('id' in oldTicket)) {
                            console.log(
                                '[TicketList] Invalid DELETE payload:',
                                payload,
                            )
                            return
                        }
                        console.log(
                            '[TicketList] Removing ticket:',
                            oldTicket.id,
                        )
                        setTickets(currentTickets =>
                            currentTickets.filter(t => t.id !== oldTicket.id),
                        )
                        return
                    }

                    // For INSERT and UPDATE events, we need the new ticket
                    if (!newTicket || !('id' in newTicket)) {
                        console.log('[TicketList] Invalid payload:', payload)
                        return
                    }

                    // Fetch the complete ticket data with customer info
                    const { data: updatedTicket, error } = await supabase
                        .from('tickets')
                        .select(
                            `
                            *,
                            customer:users!tickets_customer_id_fkey (
                                email,
                                profiles!inner (
                                    full_name
                                )
                            )
                        `,
                        )
                        .eq('id', newTicket.id)
                        .single()

                    if (error || !updatedTicket) {
                        console.log(
                            '[TicketList] Error fetching updated ticket:',
                            error,
                        )
                        return
                    }

                    // Transform the data to match TicketWithCustomer type
                    const ticketWithCustomer: TicketWithCustomer = {
                        ...updatedTicket,
                        customer: {
                            email: updatedTicket.customer.email,
                            full_name:
                                updatedTicket.customer.profiles.full_name,
                        },
                    }

                    console.log(
                        '[TicketList] Updating tickets with:',
                        ticketWithCustomer,
                    )

                    // Update tickets based on the event type
                    setTickets(currentTickets => {
                        switch (payload.eventType) {
                            case 'INSERT':
                                return [...currentTickets, ticketWithCustomer]
                            case 'UPDATE':
                                return currentTickets.map(t =>
                                    t.id === ticketWithCustomer.id
                                        ? ticketWithCustomer
                                        : t,
                                )
                            default:
                                return currentTickets
                        }
                    })
                },
            )
            .subscribe(status => {
                console.log('[TicketList] Subscription status:', status)
            })

        return () => {
            console.log('[TicketList] Cleaning up realtime subscription...')
            supabase.removeChannel(channel)
        }
    }, [slug])

    // Update local tickets when initialTickets changes
    useEffect(() => {
        setTickets(initialTickets)
    }, [initialTickets])

    const handleTicketClick = (ticketId: string) => {
        router.push(`/${slug}/tickets/${ticketId}`)
    }

    // Memoize grouped tickets
    const groupedTickets = useMemo(() => groupTickets(tickets), [tickets])

    // Memoize flattened tickets
    const flattenedTickets = useMemo(
        () => flattenGroupedTickets(groupedTickets),
        [groupedTickets],
    )

    // Memoize table instance
    const table = useReactTable({
        data: flattenedTickets,
        columns: ticketColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
        defaultColumn: {
            minSize: 50,
            maxSize: 500,
        },
        state: {
            sorting,
        },
    })

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
            <Card className="bg-destructive/10 p-6">
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
        <div className={cn('rounded-md border', className)}>
            <Table className="table-fixed">
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <TableHead
                                    key={header.id}
                                    style={{
                                        width: header.getSize(),
                                    }}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="text-xs">
                    {table.getRowModel().rows.map(row => {
                        const ticket = row.original
                        const isParent = !ticket.parent_ticket_id
                        const isAI = isAIIncident(ticket)

                        return (
                            <TableRow
                                key={row.id}
                                className={cn(
                                    'cursor-pointer transition-colors',
                                    {
                                        'hover:bg-muted/50': !isAI,
                                        'bg-red-500/10 hover:bg-red-500/5':
                                            isAI,
                                        'border-t border-border/50': isParent,
                                    },
                                )}
                                onClick={() =>
                                    handleTicketClick(row.original.id)
                                }
                            >
                                {row.getVisibleCells().map(cell => (
                                    <TableCell
                                        key={cell.id}
                                        className={cn({
                                            'pl-12':
                                                !isParent &&
                                                cell.column.id === 'subject',
                                        })}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

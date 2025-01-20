'use client'

import { useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    type SortingState,
} from '@tanstack/react-table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ticketColumns } from './ticket-columns'
import type { TicketWithCustomer } from '@/lib/schemas/tickets'

export interface TicketListProps {
    tickets: TicketWithCustomer[]
    isLoading?: boolean
    error?: string | null
    className?: string
}

export function TicketList({
    tickets,
    isLoading,
    error,
    className,
}: TicketListProps) {
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data: tickets,
        columns: ticketColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
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
        <div className={cn('rounded-md border', className)}>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <TableHead key={header.id}>
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
                <TableBody>
                    {table.getRowModel().rows.map(row => (
                        <TableRow
                            key={row.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                                (window.location.href = `/dashboard/tickets/${row.original.id}`)
                            }
                        >
                            {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

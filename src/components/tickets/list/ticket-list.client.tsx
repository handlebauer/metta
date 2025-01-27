'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'

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
import type { SortingState } from '@tanstack/react-table'

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
    const router = useRouter()
    const { slug } = useParams()
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'status',
            desc: false,
        },
    ])

    const handleTicketClick = (ticketId: string) => {
        router.push(`/${slug}/tickets/${ticketId}`)
    }

    const table = useReactTable({
        data: tickets,
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
                    {table.getRowModel().rows.map(row => (
                        <TableRow
                            key={row.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleTicketClick(row.original.id)}
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

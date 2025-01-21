import { ArrowUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate, formatTimeAgo } from '@/lib/utils/dates'

import { TicketStatusBadge } from './ticket-status-badge'

import type { TicketWithCustomer } from '@/lib/schemas/ticket.schemas'
import type { Column, ColumnDef } from '@tanstack/react-table'

// Status sort order: new -> open -> closed
const statusOrder: Record<string, number> = {
    new: 0,
    open: 1,
    closed: 2,
}

function SortableHeader<TData>({
    column,
    title,
}: {
    column: Column<TData>
    title: string
}) {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
        >
            {title}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    )
}

export const ticketColumns: ColumnDef<TicketWithCustomer>[] = [
    {
        accessorKey: 'subject',
        header: ({ column }) => (
            <SortableHeader<TicketWithCustomer>
                column={column}
                title="Subject"
            />
        ),
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('subject')}</div>
        ),
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <SortableHeader<TicketWithCustomer>
                column={column}
                title="Status"
            />
        ),
        cell: ({ row }) => (
            <TicketStatusBadge status={row.getValue('status')} />
        ),
        sortingFn: (rowA, rowB) => {
            const statusA = rowA.getValue('status') as string
            const statusB = rowB.getValue('status') as string
            return statusOrder[statusA] - statusOrder[statusB]
        },
    },
    {
        accessorKey: 'customer',
        header: ({ column }) => (
            <SortableHeader<TicketWithCustomer>
                column={column}
                title="Customer"
            />
        ),
        cell: ({ row }) => {
            const customer = row.getValue(
                'customer',
            ) as TicketWithCustomer['customer']
            return (
                <div className="text-semi-muted-foreground">
                    {customer.full_name || customer.email}
                </div>
            )
        },
        sortingFn: (rowA, rowB) => {
            const customerA = rowA.getValue(
                'customer',
            ) as TicketWithCustomer['customer']
            const customerB = rowB.getValue(
                'customer',
            ) as TicketWithCustomer['customer']
            const nameA = customerA.full_name || customerA.email
            const nameB = customerB.full_name || customerB.email
            return nameA.localeCompare(nameB)
        },
    },
    {
        accessorKey: 'description',
        header: ({ column }) => (
            <SortableHeader<TicketWithCustomer>
                column={column}
                title="Description"
            />
        ),
        cell: ({ row }) => (
            <div className="text-semi-muted-foreground line-clamp-1">
                {row.getValue('description')}
            </div>
        ),
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => (
            <SortableHeader<TicketWithCustomer>
                column={column}
                title="Created"
            />
        ),
        cell: ({ row }) => (
            <div
                className="text-muted-foreground"
                title={formatDate(row.getValue('created_at'))}
            >
                {formatTimeAgo(row.getValue('created_at'))}
            </div>
        ),
    },
    {
        accessorKey: 'updated_at',
        header: ({ column }) => (
            <SortableHeader<TicketWithCustomer>
                column={column}
                title="Updated"
            />
        ),
        cell: ({ row }) => {
            const createdAt = row.getValue('created_at') as string | null
            const updatedAt = row.getValue('updated_at') as string | null

            // Show "Never" if same as created_at or if either is null
            if (!createdAt || !updatedAt || createdAt === updatedAt) {
                return <div className="text-muted-foreground">Never</div>
            }

            return (
                <div
                    className="text-muted-foreground"
                    title={formatDate(updatedAt)}
                >
                    {formatTimeAgo(updatedAt)}
                </div>
            )
        },
    },
]

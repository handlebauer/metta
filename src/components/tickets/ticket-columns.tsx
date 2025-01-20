import type { ColumnDef } from '@tanstack/react-table'
import type { TicketWithCustomer } from '@/lib/schemas/tickets'
import { TicketStatusBadge } from './ticket-status-badge'
import { formatDate, formatTimeAgo } from '@/lib/utils/dates'

export const ticketColumns: ColumnDef<TicketWithCustomer>[] = [
    {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('subject')}</div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <TicketStatusBadge status={row.getValue('status')} />
        ),
    },
    {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) => {
            const customer = row.getValue(
                'customer',
            ) as TicketWithCustomer['customer']
            return (
                <div className="text-muted-foreground">
                    {customer.full_name || customer.email}
                </div>
            )
        },
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
            <div className="text-muted-foreground line-clamp-1">
                {row.getValue('description')}
            </div>
        ),
    },
    {
        accessorKey: 'created_at',
        header: 'Created',
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
        header: 'Updated',
        cell: ({ row }) => (
            <div
                className="text-muted-foreground"
                title={formatDate(row.getValue('updated_at'))}
            >
                {formatTimeAgo(row.getValue('updated_at'))}
            </div>
        ),
    },
]

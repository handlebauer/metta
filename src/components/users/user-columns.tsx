import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { ColumnDef } from '@tanstack/react-table'
import type { UserWithProfile } from './users-table.client'

export const userColumns: ColumnDef<UserWithProfile>[] = [
    {
        id: 'user',
        header: ({ column }) => {
            return (
                <div className="pl-10 text-left">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-3"
                    >
                        User
                        {{
                            asc: <ArrowUpIcon className="ml-2 h-4 w-4" />,
                            desc: <ArrowDownIcon className="ml-2 h-4 w-4" />,
                        }[column.getIsSorted() as string] ?? null}
                    </Button>
                </div>
            )
        },
        accessorFn: row => row.email,
        size: 200,
    },
    {
        id: 'role',
        header: ({ column }) => {
            return (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Role
                        {{
                            asc: <ArrowUpIcon className="ml-2 h-4 w-4" />,
                            desc: <ArrowDownIcon className="ml-2 h-4 w-4" />,
                        }[column.getIsSorted() as string] ?? null}
                    </Button>
                </div>
            )
        },
        accessorFn: row => row.profile.role,
        size: 120,
    },
    {
        id: 'status',
        header: ({ column }) => {
            return (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Status
                        {{
                            asc: <ArrowUpIcon className="ml-2 h-4 w-4" />,
                            desc: <ArrowDownIcon className="ml-2 h-4 w-4" />,
                        }[column.getIsSorted() as string] ?? null}
                    </Button>
                </div>
            )
        },
        accessorFn: row => row.is_active,
        size: 120,
    },
    {
        id: 'assigned_tickets',
        header: ({ column }) => {
            return (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Assigned
                        {{
                            asc: <ArrowUpIcon className="ml-2 h-4 w-4" />,
                            desc: <ArrowDownIcon className="ml-2 h-4 w-4" />,
                        }[column.getIsSorted() as string] ?? null}
                    </Button>
                </div>
            )
        },
        accessorFn: row => row.ticket_counts.assigned,
        size: 100,
    },
    {
        id: 'created_tickets',
        header: ({ column }) => {
            return (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Created
                        {{
                            asc: <ArrowUpIcon className="ml-2 h-4 w-4" />,
                            desc: <ArrowDownIcon className="ml-2 h-4 w-4" />,
                        }[column.getIsSorted() as string] ?? null}
                    </Button>
                </div>
            )
        },
        accessorFn: row => row.ticket_counts.created,
        size: 100,
    },
    {
        id: 'last_sign_in',
        header: ({ column }) => {
            return (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Last Sign In
                        {{
                            asc: <ArrowUpIcon className="ml-2 h-4 w-4" />,
                            desc: <ArrowDownIcon className="ml-2 h-4 w-4" />,
                        }[column.getIsSorted() as string] ?? null}
                    </Button>
                </div>
            )
        },
        accessorFn: row => row.last_sign_in_at,
        size: 150,
    },
    {
        id: 'actions',
        header: '',
        size: 70,
    },
]

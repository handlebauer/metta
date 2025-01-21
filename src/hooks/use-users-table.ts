import { useState } from 'react'
import {
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'

import { userColumns } from '../components/users/user-columns'

import type { UserWithProfile } from '@/components/users/users-table.client'
import type { SortingState, Table } from '@tanstack/react-table'

interface UseUsersTableProps {
    users: UserWithProfile[]
}

interface UseUsersTableReturn {
    table: Table<UserWithProfile>
}

export function useUsersTable({
    users,
}: UseUsersTableProps): UseUsersTableReturn {
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'role',
            desc: false,
        },
    ])

    const table = useReactTable({
        data: users,
        columns: userColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    })

    return {
        table,
    }
}

import type { ColumnDef } from '@tanstack/react-table'
import type { UserWithProfile } from './users-table.client'

export const userColumns: ColumnDef<UserWithProfile>[] = [
    {
        id: 'user',
        header: 'User',
        accessorFn: row => row.email,
    },
    {
        id: 'role',
        header: 'Role',
        accessorFn: row => row.profile.role,
    },
    {
        id: 'status',
        header: 'Status',
        accessorFn: row => row.is_active,
    },
    {
        id: 'last_sign_in',
        header: 'Last Sign In',
        accessorFn: row => row.last_sign_in_at,
    },
    {
        id: 'actions',
        header: '',
    },
]

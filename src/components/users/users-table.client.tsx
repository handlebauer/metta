'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { type ProfileRow } from '@/lib/schemas/profile.schemas'
import { type UserRow } from '@/lib/schemas/user.schemas'
import { cn } from '@/lib/utils'
import {
    deleteUser,
    toggleUserActive,
    updateUserRole,
} from '@/actions/user-management.actions'
import { toast } from '@/hooks/use-toast'

import { userColumns } from './user-columns'
import { UserTableRow } from './user-table-row'
import { EmptyState, ErrorState, LoadingState } from './users-table-states'

import type { SortingState } from '@tanstack/react-table'

export interface UserWithProfile
    extends Pick<UserRow, 'id' | 'email' | 'is_active' | 'last_sign_in_at'> {
    profile: Pick<ProfileRow, 'full_name' | 'role' | 'avatar_url'>
    ticket_counts: {
        assigned: number
        created: number
    }
}

export interface UsersTableProps {
    users: UserWithProfile[]
    isLoading?: boolean
    error?: string | null
    className?: string
}

export function UsersTable({
    users,
    isLoading,
    error,
    className,
}: UsersTableProps) {
    const router = useRouter()
    const [userToDelete, setUserToDelete] = useState<UserWithProfile | null>(
        null,
    )
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data: users,
        columns: userColumns,
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

    const handleToggleActive = async (userId: string, isActive: boolean) => {
        const { error } = await toggleUserActive(userId, !isActive)
        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive',
            })
        } else {
            toast({
                title: 'Success',
                description: `User ${!isActive ? 'activated' : 'deactivated'} successfully`,
            })
            router.refresh()
        }
    }

    const handleUpdateRole = async (
        userId: string,
        newRole: ProfileRow['role'],
    ) => {
        const { error } = await updateUserRole(userId, newRole)
        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive',
            })
        } else {
            toast({
                title: 'Success',
                description: `User role updated to ${newRole}`,
            })
            router.refresh()
        }
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        const { error } = await deleteUser(userToDelete.id)
        setUserToDelete(null)

        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive',
            })
        } else {
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            })
            router.refresh()
        }
    }

    if (isLoading) {
        return <LoadingState />
    }

    if (error) {
        return <ErrorState error={error} />
    }

    if (!users.length) {
        return <EmptyState />
    }

    return (
        <>
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
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <UserTableRow
                                key={row.id}
                                user={row.original}
                                onToggleActive={handleToggleActive}
                                onUpdateRole={handleUpdateRole}
                                onDelete={() => setUserToDelete(row.original)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog
                open={!!userToDelete}
                onOpenChange={() => setUserToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this user? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

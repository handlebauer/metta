import { MoreHorizontal } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import { type ProfileRow } from '@/lib/schemas/profile.schemas'
import { formatConversationalDate } from '@/lib/utils'

import type { UserWithProfile } from './users-table.client'

interface UserTableRowProps {
    user: UserWithProfile
    onToggleActive: (userId: string, isActive: boolean) => Promise<void>
    onUpdateRole: (userId: string, newRole: ProfileRow['role']) => Promise<void>
    onDelete: (user: UserWithProfile) => void
}

export function UserTableRow({
    user,
    onToggleActive,
    onUpdateRole,
    onDelete,
}: UserTableRowProps) {
    const initials = user.profile.full_name
        ? user.profile.full_name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : user.email.slice(0, 2).toUpperCase()

    const isActive = user.is_active ?? false

    return (
        <TableRow>
            <TableCell className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">
                        {user.profile.full_name || 'No name'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {user.email}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge
                    variant={
                        user.profile.role === 'admin'
                            ? 'destructive'
                            : user.profile.role === 'agent'
                              ? 'default'
                              : 'secondary'
                    }
                >
                    {user.profile.role}
                </Badge>
            </TableCell>
            <TableCell>
                <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
                {user.last_sign_in_at
                    ? formatConversationalDate(user.last_sign_in_at)
                    : 'Never'}
            </TableCell>
            <TableCell>
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() =>
                                    onToggleActive(user.id, isActive)
                                }
                                className="cursor-pointer"
                            >
                                {isActive ? 'Deactivate user' : 'Activate user'}
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="cursor-pointer">
                                    Change Role
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {user.profile.role !== 'admin' && (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onUpdateRole(user.id, 'admin')
                                            }
                                            className="cursor-pointer"
                                        >
                                            Admin
                                        </DropdownMenuItem>
                                    )}
                                    {user.profile.role !== 'agent' && (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onUpdateRole(user.id, 'agent')
                                            }
                                            className="cursor-pointer"
                                        >
                                            Agent
                                        </DropdownMenuItem>
                                    )}
                                    {user.profile.role !== 'customer' && (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onUpdateRole(
                                                    user.id,
                                                    'customer',
                                                )
                                            }
                                            className="cursor-pointer"
                                        >
                                            Customer
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                                onClick={() => onDelete(user)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                Delete user
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    )
}

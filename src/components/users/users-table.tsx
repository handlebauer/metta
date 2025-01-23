import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatConversationalDate } from '@/lib/utils/dates'

interface User {
    id: string
    email: string
    is_active: boolean
    last_sign_in_at: string | null
    profile: {
        full_name: string | null
        role: 'customer' | 'agent' | 'admin'
        avatar_url: string | null
    }
}

interface UsersTableProps {
    users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sign In</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => {
                    const initials = user.profile.full_name
                        ? user.profile.full_name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                        : user.email.slice(0, 2).toUpperCase()

                    return (
                        <TableRow key={user.id}>
                            <TableCell className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
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
                                <Badge
                                    variant={
                                        user.is_active ? 'default' : 'secondary'
                                    }
                                >
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {user.last_sign_in_at
                                    ? formatConversationalDate(
                                          user.last_sign_in_at,
                                      )
                                    : 'Never'}
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

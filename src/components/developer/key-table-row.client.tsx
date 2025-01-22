'use client'

import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils/dates'
import { revokeApiKeyAction } from '@/actions/api-key.actions'

import type { ApiKey } from '@/lib/schemas/api-key.schemas'

interface ApiKeyTableRowProps {
    apiKey: ApiKey
}

export function ApiKeyTableRow({ apiKey }: ApiKeyTableRowProps) {
    const [isRevoking, setIsRevoking] = useState(false)

    async function handleRevoke() {
        setIsRevoking(true)
        try {
            await revokeApiKeyAction(apiKey.id)
        } finally {
            setIsRevoking(false)
        }
    }

    return (
        <TableRow>
            <TableCell>{apiKey.name}</TableCell>
            <TableCell>{formatDate(apiKey.created_at)}</TableCell>
            <TableCell>
                {apiKey.last_used_at
                    ? formatDate(apiKey.last_used_at)
                    : 'Never'}
            </TableCell>
            <TableCell>
                <span
                    className={
                        apiKey.status === 'active'
                            ? 'text-green-600 dark:text-green-500'
                            : 'text-destructive'
                    }
                >
                    {apiKey.status.charAt(0).toUpperCase() +
                        apiKey.status.slice(1)}
                </span>
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={apiKey.status !== 'active'}
                        >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-destructive cursor-pointer"
                            disabled={isRevoking}
                            onClick={handleRevoke}
                        >
                            {isRevoking ? 'Revoking...' : 'Revoke Key'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

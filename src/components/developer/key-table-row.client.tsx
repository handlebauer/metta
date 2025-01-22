'use client'

import { useState } from 'react'
import { Copy, KeyRound, MoreHorizontal, ShieldOff } from 'lucide-react'

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
import { useToast } from '@/hooks/use-toast'

import type { ApiKey } from '@/lib/schemas/api-key.schemas'

interface ApiKeyTableRowProps {
    apiKey: ApiKey
}

export function ApiKeyTableRow({ apiKey }: ApiKeyTableRowProps) {
    const [isRevoking, setIsRevoking] = useState(false)
    const { toast } = useToast()

    async function handleRevoke() {
        setIsRevoking(true)
        try {
            const result = await revokeApiKeyAction(apiKey.id)
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error,
                })
            }
        } finally {
            setIsRevoking(false)
        }
    }

    function handleCopyId() {
        navigator.clipboard.writeText(apiKey.id)
        toast({
            title: 'API Key ID Copied',
            description: 'The API key ID has been copied to your clipboard.',
        })
    }

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    {apiKey.name}
                </div>
            </TableCell>
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
                        <DropdownMenuItem onClick={handleCopyId}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Key ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            disabled={isRevoking}
                            onClick={handleRevoke}
                        >
                            <ShieldOff className="mr-2 h-4 w-4" />
                            {isRevoking ? 'Revoking...' : 'Revoke Key'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

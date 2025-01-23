'use client'

import { useState } from 'react'
import { Copy, Eye, EyeOff, KeyRound, ShieldOff, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import {
    deleteApiKeyAction,
    revokeApiKeyAction,
} from '@/actions/api-key.actions'
import { useToast } from '@/hooks/use-toast'

import type { ApiKey } from '@/lib/schemas/api-key.schemas'

interface ApiKeyTableRowProps {
    apiKey: ApiKey
    decryptedKey?: string
}

export function ApiKeyTableRow({ apiKey, decryptedKey }: ApiKeyTableRowProps) {
    const [isRevoking, setIsRevoking] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRevealed, setIsRevealed] = useState(false)
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

    async function handleDelete() {
        setIsDeleting(true)
        try {
            const result = await deleteApiKeyAction(apiKey.id)
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error,
                })
            } else {
                toast({
                    title: 'API Key Deleted',
                    description: 'The API key has been permanently deleted.',
                })
            }
        } finally {
            setIsDeleting(false)
        }
    }

    function handleRevealKey() {
        setIsRevealed(!isRevealed)
    }

    function handleCopyKey() {
        if (!decryptedKey) return

        navigator.clipboard.writeText(decryptedKey)
        toast({
            title: 'API Key Copied',
            description: 'The API key has been copied to your clipboard.',
        })
    }

    return (
        <TableRow className="hover:bg-transparent border-b border-muted-foreground/10 dark:border-purple-950/50">
            <TableCell>
                <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    {apiKey.name}
                </div>
            </TableCell>
            <TableCell>0</TableCell>
            <TableCell>
                <button
                    onClick={handleCopyKey}
                    className="text-left transition-opacity"
                    disabled={apiKey.status !== 'active' || !decryptedKey}
                >
                    <div
                        className={`px-3 py-2 inline-block font-['IBM_Plex_Mono'] tracking-tight text-sm border ${
                            apiKey.status === 'active'
                                ? 'text-muted-foreground border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20'
                                : 'text-muted-foreground/50 border-muted-foreground/20 bg-muted/50'
                        } cursor-pointer`}
                    >
                        <span className="font-medium whitespace-nowrap">
                            {isRevealed && decryptedKey
                                ? decryptedKey
                                : `metta-${'*'.repeat(44)}`}
                        </span>
                    </div>
                </button>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRevealKey}
                        disabled={apiKey.status !== 'active' || !decryptedKey}
                        className="h-8 w-8"
                    >
                        {isRevealed ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                            {isRevealed ? 'Hide key' : 'Reveal key'}
                        </span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyKey}
                        disabled={!decryptedKey}
                        className="h-8 w-8"
                    >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy key</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRevoke}
                        disabled={isRevoking || apiKey.status !== 'active'}
                        className="h-8 w-8"
                    >
                        <ShieldOff className="h-4 w-4" />
                        <span className="sr-only">Revoke key</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-8 w-8 hover:text-destructive"
                    >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete key</span>
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Building2, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { listUserWorkspaces } from '@/actions/workspace.actions'

import type { Tables } from '@/lib/supabase/types'

export function WorkspaceSelector() {
    const router = useRouter()
    const [workspaces, setWorkspaces] = useState<Tables<'workspaces'>[]>([])

    useEffect(() => {
        async function loadWorkspaces() {
            const result = await listUserWorkspaces()
            if (result.error) {
                console.error('Error loading workspaces:', result.error)
                return
            }

            if (result.data) {
                setWorkspaces(result.data)
            }
        }

        loadWorkspaces()
    }, [])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-accent data-[state=open]:bg-accent"
                >
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Switch workspace
                </div>
                <DropdownMenuSeparator />
                {workspaces.map(workspace => (
                    <DropdownMenuItem
                        key={workspace.id}
                        className="flex cursor-pointer items-center gap-2"
                        onSelect={() => {
                            router.push(`/${workspace.slug}`)
                        }}
                    >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                            {workspace.logo_url ? (
                                <Image
                                    src={workspace.logo_url}
                                    alt={workspace.name}
                                    width={16}
                                    height={16}
                                    className="rounded"
                                    unoptimized
                                />
                            ) : (
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                            )}
                        </div>
                        <span className="truncate">{workspace.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

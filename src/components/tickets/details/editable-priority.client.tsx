'use client'

import { useMemo, useState } from 'react'
import {
    AlertCircle,
    AlertOctagon,
    AlertTriangle,
    ArrowDown,
    ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ticketPriorityEnum } from '@/lib/schemas/ticket.schemas'
import { cn } from '@/lib/utils'
import { updateTicket } from '@/actions/ticket.actions'

import type { TicketPriority } from '@/lib/schemas/ticket.schemas'
import type { Tables } from '@/lib/supabase/types'

interface EditablePriorityProps {
    ticketId: string
    initialPriority: Tables<'tickets'>['priority']
}

const priorityConfig = {
    low: {
        icon: ArrowDown,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10 hover:bg-green-500/20',
    },
    medium: {
        icon: AlertCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    },
    high: {
        icon: AlertTriangle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/5 hover:bg-orange-500/20',
    },
    urgent: {
        icon: AlertOctagon,
        color: 'text-red-600',
        bgColor: 'bg-red-600/5 hover:bg-red-600/20',
    },
} as const

export function EditablePriority({
    ticketId,
    initialPriority,
}: EditablePriorityProps) {
    const [priority, setPriority] = useState<TicketPriority | null>(
        initialPriority || null,
    )
    const currentConfig = useMemo(
        () =>
            priority
                ? priorityConfig[priority]
                : {
                      icon: AlertCircle,
                      color: 'text-muted-foreground',
                      bgColor: 'bg-muted/50 hover:bg-muted',
                  },
        [priority],
    )

    async function handlePriorityChange(newPriority: TicketPriority) {
        try {
            const result = await updateTicket(ticketId, {
                priority: newPriority,
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            setPriority(newPriority)
            toast.success('Priority updated successfully')
        } catch (error) {
            toast.error('Failed to update priority')
            console.error(error)
        }
    }

    const Icon = currentConfig.icon

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'h-6 px-2 font-medium text-xs gap-1.5 border-foreground/10 focus-visible:ring-0',
                        currentConfig.bgColor,
                    )}
                >
                    <Icon className={cn('h-3 w-3', currentConfig.color)} />
                    <span className="capitalize">
                        {priority || 'Set Priority'}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">Change Priority</p>
                    <p className="text-xs text-muted-foreground">
                        Set the importance level
                    </p>
                </div>
                <DropdownMenuSeparator />
                {Object.values(ticketPriorityEnum.enum).map(value => {
                    const config = priorityConfig[value]
                    const ItemIcon = config.icon
                    return (
                        <DropdownMenuItem
                            key={value}
                            onClick={() => handlePriorityChange(value)}
                            disabled={value === priority}
                            className="gap-2 capitalize font-medium"
                        >
                            <ItemIcon
                                className={cn('h-3.5 w-3.5', config.color)}
                            />
                            {value}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

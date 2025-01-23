'use client'

import { useMemo, useTransition } from 'react'
import {
    CheckCircle2,
    ChevronDown,
    Lock,
    RotateCcw,
    UserPlus2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { claimTicket, updateTicket } from '@/actions/ticket.actions'

interface EditableStatusProps {
    ticketId: string
    currentStatus: 'new' | 'open' | 'closed'
    className?: string
    userId: string // Need this for claiming tickets
}

// Define the next logical status for each current status
const nextStatus = {
    new: 'open',
    open: 'closed',
    closed: 'open',
} as const

// All possible statuses
const allStatuses = ['new', 'open', 'closed'] as const

export function EditableStatus({
    ticketId,
    currentStatus,
    className,
    userId,
}: EditableStatusProps) {
    const [isPending, startTransition] = useTransition()

    const actionConfig = useMemo(() => {
        return {
            new: {
                label: "I'll take this one",
                description: 'Begin working on this ticket',
                icon: UserPlus2,
                variant: 'outline' as const,
                accent: 'bg-accent-emerald hover:bg-accent-emerald/80',
            },
            open: {
                label: 'Mark as Resolved',
                description: 'Complete this ticket',
                icon: CheckCircle2,
                variant: 'outline' as const,
                accent: 'bg-secondary hover:bg-secondary/70',
            },
            closed: {
                label: 'Reopen Ticket',
                description: 'Issue needs further attention',
                icon: RotateCcw,
                variant: 'outline' as const,
                accent: 'bg-accent-purple hover:bg-accent-purple/80',
            },
        }[currentStatus]
    }, [currentStatus])

    const handleStatusChange = async (
        newStatus: (typeof allStatuses)[number],
    ) => {
        startTransition(async () => {
            try {
                // If it's a new ticket being claimed
                if (currentStatus === 'new' && newStatus === 'open') {
                    await claimTicket(ticketId, userId)
                } else {
                    // For all other status changes
                    await updateTicket(ticketId, { status: newStatus })
                }
            } catch (error) {
                console.error('Failed to update status:', error)
            }
        })
    }

    const Icon = actionConfig.icon

    return (
        <div className={cn('inline-flex translate-y-2', className)}>
            <Button
                className={cn(
                    'h-auto w-[280px] rounded-r-none border-r-0 border-foreground/30 px-6 py-4 shadow-sm transition-all duration-200',
                    'shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
                    actionConfig.accent,
                )}
                variant={actionConfig.variant}
                onClick={() => handleStatusChange(nextStatus[currentStatus])}
                disabled={isPending}
            >
                <div className="flex w-full items-center gap-3">
                    <div className="flex h-5 w-5 flex-none items-center justify-center">
                        <Icon
                            className={cn(
                                'h-5 w-5',
                                isPending && 'animate-spin',
                            )}
                        />
                    </div>
                    <div className="flex min-w-0 flex-col items-start">
                        <span className="min-h-[1rem] text-sm font-medium leading-none">
                            {isPending ? 'Updating...' : actionConfig.label}
                        </span>
                        <span className="mt-1 text-xs text-muted-foreground">
                            {actionConfig.description}
                        </span>
                    </div>
                </div>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={actionConfig.variant}
                        className={cn(
                            'h-auto w-[42px] rounded-l-none border-l border-foreground/30 px-3 py-4 shadow-sm transition-all duration-200',
                            'shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
                            actionConfig.accent,
                        )}
                        disabled={isPending}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">Change Status</p>
                        <p className="text-xs text-muted-foreground">
                            Select a new status for this ticket
                        </p>
                    </div>
                    <DropdownMenuSeparator />
                    {allStatuses.map(status => (
                        <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            disabled={status === currentStatus || isPending}
                            className="capitalize"
                        >
                            {status === 'new' && (
                                <UserPlus2 className="mr-2 h-4 w-4" />
                            )}
                            {status === 'open' && (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            {status === 'closed' && (
                                <Lock className="mr-2 h-4 w-4" />
                            )}
                            {status}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

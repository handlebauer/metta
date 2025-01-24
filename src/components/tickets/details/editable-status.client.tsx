'use client'

import { useMemo, useState, useTransition } from 'react'
import {
    CheckCircle2,
    ChevronDown,
    Lock,
    RotateCcw,
    UserPlus2,
    Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { claimTicket, updateTicket } from '@/actions/ticket.actions'

interface EditableStatusProps {
    ticketId: string
    currentStatus: 'new' | 'open' | 'closed'
    userId: string
    agents: Array<{
        id: string
        email: string
        profile: {
            full_name: string | null
            avatar_url: string | null
        } | null
    }>
}

export function EditableStatus({
    ticketId,
    currentStatus,
    userId,
    agents,
}: EditableStatusProps) {
    const [isPending, startTransition] = useTransition()
    const [showReopenDialog, setShowReopenDialog] = useState(false)
    const [reopenReason, setReopenReason] = useState('')

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
        newStatus: 'new' | 'open' | 'closed',
        agentId?: string,
        reason?: string,
    ) => {
        startTransition(async () => {
            try {
                if (
                    currentStatus === 'new' &&
                    newStatus === 'open' &&
                    !agentId
                ) {
                    // Self-assign the ticket
                    await claimTicket(ticketId, userId)
                } else {
                    // For all other status changes
                    await updateTicket(
                        ticketId,
                        {
                            status: newStatus,
                            ...(agentId && { agent_id: agentId }),
                        },
                        reason,
                    )
                }
            } catch (error) {
                console.error('Failed to update status:', error)
            }
        })
    }

    const handleReopenConfirm = () => {
        handleStatusChange('open', undefined, reopenReason)
        setShowReopenDialog(false)
        setReopenReason('')
    }

    const Icon = actionConfig.icon

    return (
        <>
            <div className="inline-flex translate-y-2">
                <Button
                    className={cn(
                        'h-auto w-[280px] rounded-r-none border-r-0 border-foreground/30 px-6 py-4 shadow-sm transition-all duration-200',
                        'shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
                        actionConfig.accent,
                    )}
                    variant={actionConfig.variant}
                    onClick={() => {
                        if (currentStatus === 'closed') {
                            setShowReopenDialog(true)
                        } else if (currentStatus === 'new') {
                            handleStatusChange('open')
                        } else {
                            handleStatusChange('closed')
                        }
                    }}
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
                        <DropdownMenuItem
                            disabled={currentStatus === 'new' || isPending}
                            onClick={() => handleStatusChange('new')}
                            className="capitalize"
                        >
                            <UserPlus2 className="mr-2 h-4 w-4" />
                            New
                        </DropdownMenuItem>
                        {(currentStatus === 'new' ||
                            currentStatus === 'closed') && (
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Users className="mr-2 h-4 w-4" />
                                    Assign To
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-56">
                                    {agents.map(agent => (
                                        <DropdownMenuItem
                                            key={agent.id}
                                            onClick={() =>
                                                handleStatusChange(
                                                    'open',
                                                    agent.id,
                                                )
                                            }
                                        >
                                            {agent.profile?.full_name ||
                                                agent.email}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        )}
                        <DropdownMenuItem
                            disabled={currentStatus === 'closed' || isPending}
                            onClick={() => handleStatusChange('closed')}
                            className="capitalize"
                        >
                            <Lock className="mr-2 h-4 w-4" />
                            Resolved
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reopen Ticket</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for reopening this ticket.
                            This will be communicated to the customer.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Enter reason for reopening..."
                        value={reopenReason}
                        onChange={e => setReopenReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowReopenDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReopenConfirm}
                            disabled={!reopenReason.trim()}
                        >
                            Reopen Ticket
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

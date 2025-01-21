import { useMemo } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatConversationalDate } from '@/lib/utils/dates'

import { EditablePriority } from './details/editable-priority.client'
import { TicketInternalNotes } from './notes/ticket-internal-notes.client'

import type {
    TicketInternalNoteRow,
    TicketRow,
} from '@/lib/schemas/ticket.schemas'
import type { Tables } from '@/lib/supabase/types'

interface TicketSidebarProps {
    ticket: TicketRow
    customerProfile: {
        data: Tables<'profiles'> | null
        error: string | null
    }
    customerUser: {
        data: { email?: string } | null
        error: string | null
    }
    user: {
        id: string
        role?: string
    }
    notesResult: {
        data: TicketInternalNoteRow[]
        error: string | null
    }
}

export function TicketSidebar({
    ticket,
    customerProfile,
    customerUser,
    user,
    notesResult,
}: TicketSidebarProps) {
    // Get customer initials for avatar fallback
    const customerName = customerProfile.data?.full_name || 'Unknown'
    const initials = useMemo(
        () =>
            customerName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
        [customerName],
    )

    const isAgent = user.role === 'agent'

    const displayDate = useMemo(
        () => formatConversationalDate(ticket.created_at),
        [ticket.created_at],
    )

    return (
        <div className="w-[360px] border-l bg-muted/10 flex flex-col h-full">
            <div className="flex flex-col flex-1">
                <div className="px-6 py-4 space-y-4">
                    {/* Customer Details Section */}
                    <div className="border-b pb-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="font-medium text-sm">
                                    {customerProfile.data?.full_name ||
                                        'Unknown Customer'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {customerUser.data?.email ||
                                        'No email available'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Details Section */}
                    <div className="border-b pb-4">
                        <h2 className="text-sm font-medium mb-3">Details</h2>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    ID
                                </span>
                                <span className="font-medium">
                                    #{ticket.id.slice(0, 8)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Status
                                </span>
                                <span className="font-medium">
                                    {ticket.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Priority
                                </span>
                                {isAgent ? (
                                    <EditablePriority
                                        ticketId={ticket.id}
                                        initialPriority={ticket.priority}
                                    />
                                ) : (
                                    <span className="font-medium">
                                        {ticket.priority}
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Created
                                </span>
                                <span className="font-medium">
                                    {displayDate}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Internal Notes Section (agents only) */}
                {isAgent && (
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="px-6">
                            <h2 className="text-sm font-medium mb-1">
                                Internal Notes
                            </h2>
                            <p className="text-xs text-muted-foreground mb-3">
                                Notes are only visible to agents
                            </p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <TicketInternalNotes
                                ticketId={ticket.id}
                                userId={user.id}
                                initialNotes={notesResult.data || []}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

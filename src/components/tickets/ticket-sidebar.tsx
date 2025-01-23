import { useMemo } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatConversationalDate } from '@/lib/utils/dates'

import { EditablePriority } from './details/editable-priority.client'
import { EditableStatus } from './details/editable-status.client'
import { TicketHistory } from './history/ticket-history'
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

    const isAgentOrAdmin = user.role === 'agent' || user.role === 'admin'

    const displayDate = useMemo(
        () => formatConversationalDate(ticket.created_at),
        [ticket.created_at],
    )

    return (
        <div className="w-[360px] border-l bg-muted/10 flex flex-col h-full">
            {/* Fixed Header Section */}
            <div className="px-6 py-4 space-y-4 flex-none">
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
                            <span className="text-muted-foreground">ID</span>
                            <span className="font-medium">
                                #{ticket.id.slice(0, 8)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <span className="font-medium">
                                {ticket.status || 'new'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Priority
                            </span>
                            {isAgentOrAdmin ? (
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
                            <span className="font-medium">{displayDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Notes Section */}
            {isAgentOrAdmin && (
                <>
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <Tabs
                            defaultValue="notes"
                            className="w-full h-full flex flex-col"
                        >
                            <div className="px-6 bg-muted/5 pb-2">
                                <TabsList className="w-full grid grid-cols-2 bg-transparent p-0 h-auto gap-4">
                                    <TabsTrigger
                                        value="notes"
                                        className="border data-[state=active]:border-primary/50 data-[state=active]:text-primary data-[state=active]:shadow-none px-3 h-8"
                                    >
                                        Internal Notes
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="history"
                                        className="border data-[state=active]:border-primary/50 data-[state=active]:text-primary data-[state=active]:shadow-none px-3 h-8"
                                    >
                                        History
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="notes" className="flex-1 mt-0">
                                <div className="h-full px-6 overflow-y-auto">
                                    <TicketInternalNotes
                                        ticketId={ticket.id}
                                        userId={user.id}
                                        initialNotes={notesResult.data || []}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="history"
                                className="flex-1 mt-0"
                            >
                                <div className="px-8">
                                    <TicketHistory ticketId={ticket.id} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    {/* Fixed Footer Section */}
                    <div className="w-full px-6 py-4 border-t flex justify-center items-center flex-none">
                        <EditableStatus
                            ticketId={ticket.id}
                            currentStatus={ticket.status || 'new'}
                            userId={user.id}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

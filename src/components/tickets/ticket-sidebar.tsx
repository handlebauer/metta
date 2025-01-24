import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatConversationalDate } from '@/lib/utils/dates'
import { getAgents } from '@/actions/agent.actions'
import { getTicketHistory } from '@/actions/ticket.actions'

import { Avatar, AvatarFallback } from '../ui/avatar'
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

export async function TicketSidebar({
    ticket,
    customerProfile,
    customerUser,
    user,
    notesResult,
}: TicketSidebarProps) {
    const { data: history } = await getTicketHistory(ticket.id)
    const agents = await getAgents()

    const isAgentOrAdmin = user.role === 'agent' || user.role === 'admin'

    const customerName = customerProfile.data?.full_name || 'Unknown'
    const initials = customerName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="flex h-full w-[360px] flex-col border-l bg-muted/10">
            {/* Fixed Header Section */}
            <div className="flex-none space-y-4 px-6 py-4">
                {/* Customer Details Section */}
                <div className="border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-sm text-primary">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
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
                    <h2 className="mb-3 text-sm font-medium">Details</h2>
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
                            <span className="font-medium">
                                {formatConversationalDate(ticket.created_at)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Notes Section */}
            {isAgentOrAdmin && (
                <>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <Tabs
                            defaultValue="notes"
                            className="flex h-full w-full flex-col"
                        >
                            <div className="bg-muted/5 px-6 pb-2">
                                <TabsList className="grid h-auto w-full grid-cols-2 gap-4 bg-transparent p-0">
                                    <TabsTrigger
                                        value="notes"
                                        className="h-8 border px-3 data-[state=active]:border-primary/50 data-[state=active]:text-primary data-[state=active]:shadow-none"
                                    >
                                        Notes
                                        <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] text-primary">
                                            {notesResult.data?.length || 0}
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="history"
                                        className="h-8 border px-3 data-[state=active]:border-primary/50 data-[state=active]:text-primary data-[state=active]:shadow-none"
                                    >
                                        History
                                        <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] text-primary">
                                            {history?.length || 0}
                                        </span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="notes" className="mt-0 flex-1">
                                <div className="h-full overflow-y-auto px-6">
                                    <TicketInternalNotes
                                        ticketId={ticket.id}
                                        userId={user.id}
                                        initialNotes={notesResult.data || []}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="history"
                                className="mt-0 flex-1"
                            >
                                <div className="px-8">
                                    <TicketHistory
                                        ticketId={ticket.id}
                                        history={history || []}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    {/* Fixed Footer Section */}
                    <div className="flex h-[140px] w-full flex-none items-center justify-center px-6 py-4">
                        <EditableStatus
                            ticketId={ticket.id}
                            currentStatus={ticket.status || 'new'}
                            userId={user.id}
                            agents={agents}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

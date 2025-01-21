import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getTicketMessages } from '@/actions/message.actions'
import { getProfileByUserId } from '@/actions/profile.actions'
import { getTicketInternalNotes } from '@/actions/ticket.actions'
import { getUser } from '@/actions/user.actions'

import { TicketConversation } from './conversation/ticket-conversation.client'
import { TicketStatusBadge } from './list/ticket-status-badge'
import { TicketInternalNotes } from './notes/ticket-internal-notes.client'

import type { TicketRow } from '@/lib/schemas/ticket.schemas'

interface TicketViewProps {
    ticket: TicketRow
    user: { id: string; name: string; email: string; role?: string }
}

export async function TicketView({ ticket, user }: TicketViewProps) {
    // Fetch initial messages, notes, and customer data
    const [messagesResult, notesResult, customerProfile, customerUser] =
        await Promise.all([
            getTicketMessages(ticket.id),
            getTicketInternalNotes(ticket.id),
            getProfileByUserId(ticket.customer_id),
            getUser(ticket.customer_id),
        ])

    if (messagesResult.error) {
        throw new Error(messagesResult.error)
    }

    // Get customer initials for avatar fallback
    const customerName = customerProfile.data?.full_name || 'Unknown'
    const initials = customerName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="h-[calc(100vh-10rem)] flex flex-col">
            {/* Header - Compact and informational */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold tracking-tight">
                        {ticket.subject}
                    </h1>
                    <TicketStatusBadge status={ticket.status} />
                </div>
                <div className="text-sm text-muted-foreground">
                    #{ticket.id.slice(0, 8)}
                </div>
            </div>

            {/* Main content area with sidebar */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main conversation area */}
                <div className="flex-1 min-w-0">
                    <TicketConversation
                        ticketId={ticket.id}
                        user={user}
                        initialMessages={messagesResult.data || []}
                    />
                </div>

                {/* Sidebar */}
                <div className="w-[360px] border-l bg-muted/10 overflow-y-auto">
                    <div className="px-6 py-4">
                        {/* Customer Details Section */}
                        <div className="pb-4 mb-4 border-b">
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
                        <div className="pb-4 mb-4 border-b">
                            <h2 className="text-sm font-medium mb-3">
                                Details
                            </h2>
                            <div className="space-y-1.5 text-sm">
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
                                    <span className="font-medium">
                                        {ticket.priority}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Created
                                    </span>
                                    <span className="font-medium">
                                        {ticket.created_at?.split('T')[0]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Internal Notes Section (agents only) */}
                        {user.role === 'agent' && (
                            <div className="pb-4">
                                <h2 className="text-sm font-medium mb-1">
                                    Internal Notes
                                </h2>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Notes are only visible to agents
                                </p>
                                <TicketInternalNotes
                                    ticketId={ticket.id}
                                    userId={user.id}
                                    initialNotes={notesResult.data || []}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

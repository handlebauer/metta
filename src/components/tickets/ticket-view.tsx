import { getTicketMessages } from '@/actions/message.actions'
import { getTicketInternalNotes } from '@/actions/ticket.actions'
import { getUserWithProfile } from '@/actions/user-with-profile.actions'

import { TicketConversation } from './conversation/ticket-conversation.client'
import { TicketStatusBadge } from './list/ticket-status-badge'
import { TicketSidebar } from './ticket-sidebar'

import type { TicketRow } from '@/lib/schemas/ticket.schemas'
import type { UserWithProfile } from '@/lib/schemas/user-with-profile.schemas'

interface TicketViewProps {
    ticket: TicketRow
    user: UserWithProfile
}

export async function TicketView({ ticket, user }: TicketViewProps) {
    // Fetch initial messages, notes, and customer data
    const [messagesResult, notesResult, customerResult] = await Promise.all([
        getTicketMessages(ticket.id),
        getTicketInternalNotes(ticket.id),
        getUserWithProfile(ticket.customer_id),
    ])

    if (messagesResult.error) {
        throw new Error(messagesResult.error)
    }

    if (customerResult.error) {
        throw new Error(customerResult.error)
    }

    return (
        <div className="h-[calc(100vh-6rem)] flex">
            {/* Main conversation area */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Header - Compact and informational */}
                <div className="flex items-center gap-3 px-12 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <h1 className="text-xl font-semibold tracking-tight">
                        {ticket.subject}
                    </h1>
                    <TicketStatusBadge status={ticket.status} />
                </div>

                {/* Conversation */}
                <div className="flex-1 min-h-0 px-12">
                    <TicketConversation
                        ticketId={ticket.id}
                        user={user}
                        initialMessages={messagesResult.data || []}
                        status={ticket.status || 'new'}
                    />
                </div>
            </div>

            {/* Sidebar */}
            <TicketSidebar
                ticket={ticket}
                customerProfile={{
                    data: customerResult.data?.profile
                        ? {
                              ...customerResult.data.profile,
                              user_id: customerResult.data.id,
                          }
                        : null,
                    error: null,
                }}
                customerUser={{
                    data: customerResult.data
                        ? { email: customerResult.data.email }
                        : null,
                    error: null,
                }}
                user={{
                    id: user.id,
                    role: user.profile.role,
                }}
                notesResult={notesResult}
            />
        </div>
    )
}

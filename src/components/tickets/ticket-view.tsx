import { getTicketMessages } from '@/actions/message.actions'

import { TicketConversation } from './conversation/ticket-conversation.client'
import { TicketStatusBadge } from './list/ticket-status-badge'

import type { TicketRow } from '@/lib/schemas/ticket.schemas'

interface TicketViewProps {
    ticket: TicketRow
    user: { id: string; name: string; email: string; role?: string }
}

export async function TicketView({ ticket, user }: TicketViewProps) {
    // Fetch initial messages
    const messagesResult = await getTicketMessages(ticket.id)
    if (messagesResult.error) {
        throw new Error(messagesResult.error)
    }

    return (
        <div className="h-[calc(100vh-10rem)] flex flex-col max-w-[860px] mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold tracking-tight">
                            {ticket.subject}
                        </h1>
                        <TicketStatusBadge status={ticket.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        #{ticket.id.slice(0, 8)}
                    </p>
                </div>
            </div>

            {/* Description */}
            {ticket.description && (
                <div className="py-4 border-b">
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {ticket.description}
                    </div>
                </div>
            )}

            {/* Conversation */}
            <div className="flex-1 overflow-hidden">
                <TicketConversation
                    ticketId={ticket.id}
                    user={user}
                    initialMessages={messagesResult.data || []}
                />
            </div>
        </div>
    )
}

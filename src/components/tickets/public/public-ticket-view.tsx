import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatConversationalDate } from '@/lib/utils/dates'

import { TicketHistory } from '../history/ticket-history'
import { TicketStatusBadge } from '../list/ticket-status-badge'
import { CustomerConversation } from './customer-conversation.client'

import type { MessageWithUser } from '@/lib/schemas/message.schemas'
import type { TicketStatusHistoryRow } from '@/lib/schemas/ticket.schemas'

export interface CustomerTicketViewProps {
    ticket: {
        id: string
        subject: string
        status: 'new' | 'open' | 'closed' | null
        created_at: string | null
        customer_id: string
        customer: {
            email: string
            full_name: string | null
        }
        messages: MessageWithUser[]
    }
    token: string
    history: TicketStatusHistoryRow[]
}

export function CustomerTicketView({
    ticket,
    token,
    history,
}: CustomerTicketViewProps) {
    return (
        <div className="flex h-screen items-center justify-center py-12">
            <div className="flex gap-8">
                {/* Left Minimal sidebar - Agent Info */}
                <div className="mt-10 h-fit w-[280px] rounded-lg border bg-card p-6 shadow-sm">
                    {/* Agent Details Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=support@example.com`}
                                    alt="Demo Admin"
                                />
                                <AvatarFallback>DA</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">
                                    Demo Admin
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Support Agent
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <p>We typically respond in 24 hours</p>
                            <p className="mt-1">
                                Available Mon-Fri 9am-5pm PST
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main conversation area - centered and narrower */}
                <div className="flex h-[800px] w-[800px] flex-col rounded-lg border bg-card shadow-sm">
                    {/* Header - Compact and informational */}
                    <div className="flex items-center gap-3 border-b bg-background/95 px-8 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <h1 className="text-xl font-semibold tracking-tight">
                            {ticket.subject}
                        </h1>
                        <TicketStatusBadge status={ticket.status} />
                    </div>

                    {/* Conversation - centered and narrower */}
                    <div className="min-h-0 flex-1">
                        <CustomerConversation
                            ticketId={ticket.id}
                            customer={{
                                id: ticket.customer_id,
                                email: ticket.customer.email,
                                full_name: ticket.customer.full_name,
                            }}
                            initialMessages={ticket.messages}
                            status={ticket.status || 'new'}
                            token={token}
                        />
                    </div>
                </div>

                {/* Right side sections */}
                <div className="mt-10 flex w-[280px] flex-col gap-4">
                    {/* Customer Info Section */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.customer.email}`}
                                    alt={ticket.customer.email}
                                />
                                <AvatarFallback>
                                    {ticket.customer.email
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">
                                    {ticket.customer.full_name ||
                                        'Unknown Customer'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {ticket.customer.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Details Section */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 className="mb-3 text-sm font-medium">
                            Ticket Details
                        </h3>
                        <div className="space-y-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
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
                                    Created
                                </span>
                                <span className="font-medium">
                                    {ticket.created_at
                                        ? formatConversationalDate(
                                              ticket.created_at,
                                          )
                                        : 'Unknown date'}
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
                        </div>
                    </div>

                    {/* Ticket History Section */}
                    <div className="rounded-lg border bg-card shadow-sm">
                        <h3 className="border-b px-6 py-3 text-sm font-medium">
                            Status History
                        </h3>
                        <TicketHistory
                            ticketId={ticket.id}
                            history={history}
                            createdAt={ticket.created_at!}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

import { TicketRow } from '@/lib/schemas/ticket.schemas'

interface AgentReplyNotificationProps {
    ticket: TicketRow
    messageContent: string
    accessToken: string
}

export function AgentReplyNotification({
    ticket,
    messageContent,
    accessToken,
}: AgentReplyNotificationProps) {
    return (
        <div>
            <h2>New reply to your ticket</h2>
            <p>An agent has replied to your ticket: {ticket.subject}</p>

            <div
                style={{
                    margin: '20px 0',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                }}
            >
                {messageContent}
            </div>

            <p>
                You can reply to this email to continue the conversation, or
                visit your ticket at:{' '}
                <a
                    href={`${process.env.NEXT_PUBLIC_SITE_URL}/tickets/${ticket.id}/${accessToken}`}
                >
                    View Ticket
                </a>
            </p>

            <hr
                style={{
                    margin: '20px 0',
                    border: 'none',
                    borderTop: '1px solid #eaeaea',
                }}
            />

            <p style={{ color: '#666', fontSize: '14px' }}>
                Ticket ID: #{ticket.id}
                <br />
                Priority: {ticket.priority}
                <br />
                Status: {ticket.status}
            </p>
        </div>
    )
}

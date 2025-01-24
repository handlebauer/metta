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
        <div
            style={{
                fontFamily: 'system-ui, sans-serif',
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
            }}
        >
            <h2
                style={{
                    color: '#111827',
                    fontSize: '24px',
                    marginBottom: '16px',
                }}
            >
                New reply to your ticket
            </h2>

            <p
                style={{
                    color: '#374151',
                    fontSize: '16px',
                    marginBottom: '20px',
                }}
            >
                An agent has replied to your ticket:{' '}
                <strong>{ticket.subject}</strong>
            </p>

            <div
                style={{
                    margin: '24px 0',
                    padding: '16px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    color: '#374151',
                    fontSize: '16px',
                    lineHeight: '1.5',
                }}
            >
                {messageContent}
            </div>

            <div>
                <p
                    style={{
                        color: '#374151',
                        fontSize: '16px',
                        marginBottom: '16px',
                    }}
                >
                    You can reply to this email to continue the conversation, or
                    visit your ticket here:
                </p>
                <table
                    role="presentation"
                    border={0}
                    cellPadding="0"
                    cellSpacing="0"
                    style={{
                        width: 'auto',
                    }}
                >
                    <tr>
                        <td>
                            <a
                                href={`${process.env.NEXT_PUBLIC_SITE_URL}/tickets/${ticket.id}/${accessToken}`}
                                target="_blank"
                                style={{
                                    backgroundColor: '#2563eb',
                                    border: '1px solid #2563eb',
                                    borderRadius: '6px',
                                    color: '#ffffff',
                                    display: 'inline-block',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    padding: '12px 24px',
                                    textDecoration: 'none',
                                }}
                            >
                                View Ticket
                            </a>
                        </td>
                    </tr>
                </table>
            </div>

            <hr
                style={{
                    margin: '24px 0',
                    border: 'none',
                    borderTop: '1px solid #e5e7eb',
                }}
            />

            <div
                style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    lineHeight: '1.5',
                }}
            >
                <p style={{ margin: '0 0 4px 0' }}>
                    <strong style={{ color: '#374151' }}>Ticket ID:</strong> #
                    {ticket.id}
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                    <strong style={{ color: '#374151' }}>Priority:</strong>{' '}
                    {ticket.priority}
                </p>
                <p style={{ margin: '0' }}>
                    <strong style={{ color: '#374151' }}>Status:</strong>{' '}
                    {ticket.status}
                </p>
            </div>
        </div>
    )
}

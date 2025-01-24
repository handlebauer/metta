import { TicketRow } from '@/lib/schemas/ticket.schemas'
import { UserRow } from '@/lib/schemas/user.schemas'

interface CustomerReplyNotificationProps {
    ticket: TicketRow
    customer: UserRow
    messageContent: string
}

export function CustomerReplyNotification({
    ticket,
    customer,
    messageContent,
}: CustomerReplyNotificationProps) {
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
                New customer reply
            </h2>

            <p
                style={{
                    color: '#374151',
                    fontSize: '16px',
                    marginBottom: '20px',
                }}
            >
                <strong>{customer.email}</strong> has replied to ticket:{' '}
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

            <div style={{ marginBottom: '24px' }}>
                <p
                    style={{
                        color: '#374151',
                        fontSize: '16px',
                        marginBottom: '16px',
                    }}
                >
                    You can reply to this email to continue the conversation, or
                    handle this ticket here:
                </p>
                <table
                    role="presentation"
                    cellPadding={0}
                    cellSpacing={0}
                    style={{ margin: '0 auto' }}
                >
                    <tbody>
                        <tr>
                            <td
                                style={{
                                    backgroundColor: '#0284c7',
                                    borderRadius: '6px',
                                    padding: 0,
                                }}
                            >
                                <a
                                    href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/tickets/${ticket.id}`}
                                    style={{
                                        display: 'inline-block',
                                        padding: '12px 24px',
                                        color: '#ffffff',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                        textAlign: 'center',
                                        minWidth: '160px',
                                    }}
                                >
                                    View in Dashboard
                                </a>
                            </td>
                        </tr>
                    </tbody>
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
                <p style={{ margin: '0 0 2px 0' }}>
                    <strong style={{ color: '#374151' }}>Ticket ID:</strong> #
                    {ticket.id}
                </p>
                <p style={{ margin: '0 0 2px 0' }}>
                    <strong style={{ color: '#374151' }}>Priority:</strong>{' '}
                    {ticket.priority}
                </p>
                <p style={{ margin: '0 0 2px 0' }}>
                    <strong style={{ color: '#374151' }}>Status:</strong>{' '}
                    {ticket.status}
                </p>
            </div>
        </div>
    )
}

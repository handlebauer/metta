import { TicketRow } from '@/lib/schemas/ticket.schemas'

interface TicketResolutionNotificationProps {
    ticket: TicketRow
    accessToken: string
}

export function TicketResolutionNotification({
    ticket,
    accessToken,
}: TicketResolutionNotificationProps) {
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
                Your ticket has been resolved
            </h2>

            <p
                style={{
                    color: '#374151',
                    fontSize: '16px',
                    marginBottom: '20px',
                }}
            >
                We&apos;re pleased to inform you that your ticket has been
                marked as resolved: <strong>{ticket.subject}</strong>
            </p>

            <div style={{ marginBottom: '24px' }}>
                <p
                    style={{
                        color: '#374151',
                        fontSize: '16px',
                        marginBottom: '16px',
                    }}
                >
                    We value your feedback! Please let us know about your
                    experience by replying to this email or visiting your ticket
                    here:
                </p>
                <table
                    role="presentation"
                    border={0}
                    cellPadding={0}
                    cellSpacing={0}
                    style={{
                        width: '100%',
                        textAlign: 'center',
                        marginBottom: '16px',
                    }}
                >
                    <tr>
                        <td align="center">
                            <a
                                href={`${process.env.NEXT_PUBLIC_SITE_URL}/tickets/${ticket.id}/${accessToken}`}
                                target="_blank"
                                style={{
                                    backgroundColor: '#0284c7',
                                    borderRadius: '4px',
                                    color: '#ffffff',
                                    display: 'inline-block',
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

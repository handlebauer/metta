import { TicketRow } from '@/lib/schemas/ticket.schemas'

interface TicketReopenedNotificationProps {
    ticket: TicketRow
    reopenReason: string
}

export function TicketReopenedNotification({
    ticket,
    reopenReason,
}: TicketReopenedNotificationProps) {
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
                Your ticket has been reopened
            </h2>

            <p
                style={{
                    color: '#374151',
                    fontSize: '16px',
                    marginBottom: '20px',
                }}
            >
                We&apos;re writing to inform you that your ticket has been
                reopened for further attention:{' '}
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
                <p style={{ margin: '0', fontStyle: 'italic' }}>
                    Reason for reopening: {reopenReason}
                </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <p
                    style={{
                        color: '#374151',
                        fontSize: '16px',
                        marginBottom: '16px',
                    }}
                >
                    Our support team will review your case and get back to you
                    shortly. You can view the latest updates here:
                </p>

                <table
                    border={0}
                    cellPadding="0"
                    cellSpacing="0"
                    role="presentation"
                >
                    <tr>
                        <td align="left">
                            <table
                                border={0}
                                cellPadding="0"
                                cellSpacing="0"
                                role="presentation"
                            >
                                <tr>
                                    <td
                                        style={{
                                            backgroundColor: '#2563EB',
                                            borderRadius: '6px',
                                            padding: '10px 20px',
                                        }}
                                    >
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_SITE_URL}/tickets/${ticket.id}`}
                                            style={{
                                                color: '#ffffff',
                                                fontSize: '16px',
                                                textDecoration: 'none',
                                                display: 'inline-block',
                                            }}
                                        >
                                            View Ticket
                                        </a>
                                    </td>
                                </tr>
                            </table>
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

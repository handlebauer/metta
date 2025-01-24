import * as React from 'react'

import type { TicketRow } from '@/lib/schemas/ticket.schemas'

interface NewAgentTicketNotificationProps {
    ticket: TicketRow
}

export const NewAgentTicketNotification: React.FC<
    Readonly<NewAgentTicketNotificationProps>
> = ({ ticket }) => (
    <div
        style={{
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
        }}
    >
        <h2
            style={{ color: '#111827', fontSize: '24px', marginBottom: '16px' }}
        >
            New ticket assigned to you
        </h2>

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
            <p style={{ margin: '0 0 12px 0' }}>
                <strong>Description:</strong>
            </p>
            <p style={{ margin: '0', whiteSpace: 'pre-wrap' }}>
                {ticket.description}
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
                Please review and handle this ticket as soon as possible:
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
                                View Ticket
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

        <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
            <p style={{ margin: '0 0 4px 0' }}>
                <strong style={{ color: '#374151' }}>Ticket ID:</strong> #
                {ticket.id}
            </p>
            <p style={{ margin: '0 0 4px 0' }}>
                <strong style={{ color: '#374151' }}>Subject:</strong>{' '}
                {ticket.subject}
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

        <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '24px' }}>
            Please keep the ticket ID (#{ticket.id}) in the subject line when
            replying to this email.
        </p>
    </div>
)

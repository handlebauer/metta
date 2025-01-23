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
        <div>
            <h2>Your ticket has been reopened</h2>
            <p>
                We&apos;re writing to inform you that your ticket has been
                reopened for further attention: {ticket.subject}
            </p>

            <div
                style={{
                    margin: '20px 0',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                }}
            >
                <p style={{ margin: '0', fontStyle: 'italic' }}>
                    Reason for reopening: {reopenReason}
                </p>
            </div>

            <p>
                Our support team will review your case and get back to you
                shortly. You can view the latest updates on your ticket at:{' '}
                <a
                    href={`${process.env.NEXT_PUBLIC_SITE_URL}/tickets/${ticket.id}`}
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

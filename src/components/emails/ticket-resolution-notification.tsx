import { TicketRow } from '@/lib/schemas/ticket.schemas'

interface TicketResolutionNotificationProps {
    ticket: TicketRow
}

export function TicketResolutionNotification({
    ticket,
}: TicketResolutionNotificationProps) {
    return (
        <div>
            <h2>Your ticket has been resolved</h2>
            <p>
                We&apos;re pleased to inform you that your ticket has been
                marked as resolved:
                {ticket.subject}
            </p>

            <p>
                We value your feedback! Please let us know about your experience
                by replying to this email or visiting your ticket at:{' '}
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

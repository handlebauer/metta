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
        <div>
            <h2>New customer reply</h2>
            <p>
                {customer.email} has replied to ticket: {ticket.subject}
            </p>

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
                handle this ticket at:{' '}
                <a
                    href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/tickets/${ticket.id}`}
                >
                    View in Dashboard
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
                <br />
                Customer: {customer.email}
            </p>
        </div>
    )
}

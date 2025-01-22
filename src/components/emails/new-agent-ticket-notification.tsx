import * as React from 'react'

import type { TicketRow } from '@/lib/schemas/ticket.schemas'

interface NewAgentTicketNotificationProps {
    ticket: TicketRow
}

export const NewAgentTicketNotification: React.FC<
    Readonly<NewAgentTicketNotificationProps>
> = ({ ticket }) => (
    <div>
        <h2>A new ticket has been assigned to you:</h2>
        <ul>
            <li>
                <strong>Ticket ID:</strong> {ticket.id}
            </li>
            <li>
                <strong>Subject:</strong> {ticket.subject}
            </li>
            <li>
                <strong>Priority:</strong> {ticket.priority}
            </li>
            <li>
                <strong>Status:</strong> {ticket.status}
            </li>
        </ul>
        <p>
            <strong>Description:</strong>
        </p>
        <p>{ticket.description}</p>
        <p>
            <a
                href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/tickets/${ticket.id}`}
                style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#0284c7',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                }}
            >
                View Ticket
            </a>
        </p>
        <p style={{ fontSize: '12px', color: '#666' }}>
            Please keep the ticket ID (#{ticket.id}) in the subject line when
            replying to this email.
        </p>
    </div>
)

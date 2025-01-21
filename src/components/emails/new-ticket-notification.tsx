import * as React from 'react'

import type { TicketRow } from '@/lib/schemas/ticket.schemas'

interface NewTicketNotificationProps {
    ticket: TicketRow
}

export const NewTicketNotification: React.FC<
    Readonly<NewTicketNotificationProps>
> = ({ ticket }) => (
    <div>
        <h2>New Support Ticket Assigned</h2>
        <p>A new ticket has been assigned to you:</p>
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
    </div>
)

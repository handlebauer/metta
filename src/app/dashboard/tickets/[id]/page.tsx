import { notFound, redirect } from 'next/navigation'

import { TicketView } from '@/components/tickets/ticket-view'
import { getTicket } from '@/actions/ticket.actions'
import { getAuthenticatedUserWithProfile } from '@/actions/user-with-profile.actions'

interface TicketPageProps {
    params: Promise<{ id: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
    const { id } = await params

    // Get authenticated user with profile
    const { data: user, error } = await getAuthenticatedUserWithProfile()

    if (error || !user) {
        redirect('/login')
    }

    // Get ticket
    const { data: ticket, error: ticketError } = await getTicket(id)

    if (!ticket || ticketError) {
        notFound()
    }

    return <TicketView ticket={ticket} user={user} />
}

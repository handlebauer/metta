import { notFound, redirect } from 'next/navigation'

import { TicketView } from '@/components/tickets/ticket-view'
import { TicketService } from '@/services/ticket.services'
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
    const ticketService = new TicketService()
    const ticket = await ticketService.findById(id)

    if (!ticket) {
        notFound()
    }

    return <TicketView ticket={ticket} user={user} />
}

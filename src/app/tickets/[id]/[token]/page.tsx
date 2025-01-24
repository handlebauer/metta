import { notFound } from 'next/navigation'

import { CustomerTicketView } from '@/components/tickets/public/public-ticket-view'
import { getTicketWithToken } from '@/services/ticket-access.services'
import { getPublicTicketHistory } from '@/actions/ticket.actions'

interface TokenAccessPageProps {
    params: Promise<{
        id: string
        token: string
    }>
}

export default async function TokenAccessPage({
    params,
}: TokenAccessPageProps) {
    const { id, token } = await params

    /**
     * XXX: Need to refactor this to use an action, not a service
     */
    const ticket = await getTicketWithToken(id, token)

    const { data: history } = await getPublicTicketHistory(id, token)

    if (!ticket) {
        notFound()
    }

    return (
        <CustomerTicketView
            ticket={ticket}
            token={token}
            history={history || []}
        />
    )
}

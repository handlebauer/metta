import { notFound } from 'next/navigation'

import { CustomerTicketView } from '@/components/tickets/public/public-ticket-view'
import { getTicketWithToken } from '@/services/ticket-access.services'

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
    const ticket = await getTicketWithToken(id, token)

    if (!ticket) {
        notFound()
    }

    return <CustomerTicketView ticket={ticket} token={token} />
}

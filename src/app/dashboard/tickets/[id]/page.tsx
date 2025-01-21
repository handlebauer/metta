import { notFound, redirect } from 'next/navigation'

import { TicketView } from '@/components/tickets/ticket-view'
import { createClient } from '@/lib/supabase/server'
import { TicketService } from '@/services/ticket.services'
import { getProfile } from '@/actions/user.actions'

interface TicketPageProps {
    params: Promise<{ id: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
    const service = new TicketService()
    const { id } = await params

    // Get user data
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email || !user.id) {
        redirect('/login')
    }

    // Get user profile
    const profileResult = await getProfile(user.id)
    if (!profileResult.data) {
        throw new Error('Profile not found')
    }

    // Get ticket
    const ticket = await service.findById(id)
    if (!ticket) {
        notFound()
    }

    return (
        <div className="container py-8 space-y-8">
            <TicketView
                ticket={ticket}
                user={{
                    id: user.id,
                    name: profileResult.data.full_name || user.email,
                    email: user.email,
                    role: profileResult.data.role,
                }}
            />
        </div>
    )
}

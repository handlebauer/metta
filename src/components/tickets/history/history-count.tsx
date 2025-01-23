import { getTicketHistory } from '@/actions/ticket.actions'

interface HistoryCountProps {
    ticketId: string
}

export async function HistoryCount({ ticketId }: HistoryCountProps) {
    const { data } = await getTicketHistory(ticketId)

    if (!data?.length) {
        return null
    }

    return (
        <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] text-primary">
            {data.length}
        </span>
    )
}

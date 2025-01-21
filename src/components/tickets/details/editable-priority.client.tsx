'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ticketPriorityEnum } from '@/lib/schemas/ticket.schemas'
import { updateTicket } from '@/actions/ticket.actions'

import type { TicketPriority } from '@/lib/schemas/ticket.schemas'
import type { Tables } from '@/lib/supabase/types'

interface EditablePriorityProps {
    ticketId: string
    initialPriority: Tables<'tickets'>['priority']
}

export function EditablePriority({
    ticketId,
    initialPriority,
}: EditablePriorityProps) {
    const [priority, setPriority] = useState<TicketPriority | null>(
        initialPriority || null,
    )
    const [isUpdating, setIsUpdating] = useState(false)

    async function handlePriorityChange(newPriority: string) {
        try {
            setIsUpdating(true)
            const result = await updateTicket(ticketId, {
                priority: newPriority as TicketPriority,
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            setPriority(newPriority as TicketPriority)
            toast.success('Priority updated successfully')
        } catch (error) {
            toast.error('Failed to update priority')
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <Select
            value={priority || undefined}
            onValueChange={handlePriorityChange}
            disabled={isUpdating}
        >
            <SelectTrigger className="h-auto w-[90px] text-xs py-0.5 font-medium">
                <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
                {Object.values(ticketPriorityEnum.enum).map(value => (
                    <SelectItem key={value} value={value} className="text-xs">
                        {value}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

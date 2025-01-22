'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Textarea } from '@/components/ui/textarea'
import { formatTimeAgo } from '@/lib/utils/dates'
import { addInternalNote } from '@/actions/ticket.actions'

import type { TicketInternalNoteRow } from '@/lib/schemas/ticket.schemas'

interface TicketInternalNotesProps {
    ticketId: string
    userId: string
    initialNotes: TicketInternalNoteRow[]
}

/**
 * Internal notes component for tickets
 */
export function TicketInternalNotes({
    ticketId,
    userId,
    initialNotes,
}: TicketInternalNotesProps) {
    const [notes, setNotes] = useState(initialNotes)
    const [newNote, setNewNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit() {
        if (!newNote.trim()) return

        try {
            setIsSubmitting(true)
            const result = await addInternalNote({
                content: newNote.trim(),
                ticket_id: ticketId,
                created_by: userId,
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            if (result.data) {
                setNotes(prev => [result.data!, ...prev])
                setNewNote('')
                toast.success('Note added successfully')
            }
        } catch (error) {
            toast.error('Failed to add note')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!isSubmitting && newNote.trim()) {
                handleSubmit()
            }
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Add new note */}
            <div className="px-6 pb-2 pt-1">
                <div className="relative">
                    <Textarea
                        placeholder="Add an internal note..."
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[60px] resize-none text-xs"
                    />
                    <div className="absolute bottom-0.5 right-2">
                        <span className="text-[10px] text-muted-foreground">
                            Press Enter
                        </span>
                    </div>
                </div>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto min-h-0 px-6">
                <div className="space-y-2">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            className="rounded border bg-muted/30 px-2 py-1.5 text-xs"
                        >
                            <div className="whitespace-pre-wrap text-foreground/90">
                                {note.content}
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground">
                                {note.created_at &&
                                    formatTimeAgo(note.created_at)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

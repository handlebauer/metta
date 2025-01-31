'use client'

import { useEffect } from 'react'

import { AIIncidentNotification } from '@/components/notifications/ai-incident-notification.client'
import { toast } from '@/hooks/use-toast'

interface FirebreakIncident {
    id: string
    title: string
    description: string
    pattern_name: string
    linked_ticket_ids: string[]
}

interface FirebreakEvent {
    type: 'firebreak_incident'
    incidents: FirebreakIncident[]
}

interface ConnectionEvent {
    type: 'connection_status'
    status: 'connected' | 'disconnected'
}

type SSEEvent = FirebreakEvent | ConnectionEvent

export function useSSE() {
    useEffect(() => {
        console.log('[SSE Hook] Setting up EventSource connection')
        const eventSource = new EventSource('/api/sse')

        eventSource.onopen = () => {
            console.log('[SSE Hook] Connection opened')
        }

        eventSource.onmessage = event => {
            console.log('[SSE Hook] Received message:', event.data)
            try {
                const data = JSON.parse(event.data) as SSEEvent
                console.log('[SSE Hook] Parsed data:', data)

                switch (data.type) {
                    case 'firebreak_incident':
                        console.log('[SSE Hook] Processing firebreak incident')
                        data.incidents.forEach(incident => {
                            console.log(
                                '[SSE Hook] Creating notification for incident:',
                                incident.id,
                            )
                            const toastId = `toast-${incident.id}`
                            toast({
                                description: (
                                    <AIIncidentNotification
                                        id={toastId}
                                        incidentId={incident.id}
                                        numRelatedTickets={
                                            incident.linked_ticket_ids.length
                                        }
                                        description={incident.pattern_name}
                                        onOpenChange={() => {
                                            const toastEl =
                                                document.getElementById(toastId)
                                            if (toastEl?.parentElement) {
                                                toastEl.parentElement.remove()
                                            }
                                        }}
                                    />
                                ),
                                className: 'p-0',
                                duration: 24 * 60 * 60 * 1000, // 24 hours
                            })
                        })
                        break

                    case 'connection_status':
                        console.log(
                            '[SSE Hook] Connection status:',
                            data.status,
                        )
                        break
                }
            } catch (error) {
                console.error('[SSE Hook] Failed to parse SSE message:', error)
            }
        }

        eventSource.onerror = error => {
            console.error('[SSE Hook] Connection error:', error)
        }

        return () => {
            console.log('[SSE Hook] Cleaning up connection')
            eventSource.close()
        }
    }, [])
}

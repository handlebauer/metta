'use client'

import { useEffect } from 'react'

import { createClient } from '@/lib/supabase/client'
import { AIIncidentNotification } from '@/components/notifications/ai-incident-notification.client'
import { toast } from '@/hooks/use-toast'

import type { Incident } from '@/lib/schemas/incident.schemas'

// Helper function to show a test notification (development only)
export function showTestIncidentNotification() {
    const testIncident: Incident = {
        id: `test-${Date.now()}`,
        title: 'Test Incident',
        description:
            'This is a test incident notification to verify the notification system is working correctly.',
        pattern_name: 'test-pattern',
        severity: 'high',
        status: 'open',
        linked_ticket_ids: ['ticket-1', 'ticket-2', 'ticket-3'],
        created_at: new Date().toISOString(),
        analysis_id: 'test-analysis-id',
    }

    const toastId = `toast-${testIncident.id}`

    toast({
        description: (
            <AIIncidentNotification
                id={toastId}
                incidentId={testIncident.id}
                numRelatedTickets={testIncident.linked_ticket_ids.length}
                description={testIncident.pattern_name}
                analysisId={testIncident.analysis_id}
                onOpenChange={() => {
                    const toastEl = document.getElementById(toastId)
                    if (toastEl?.parentElement) {
                        toastEl.parentElement.remove()
                    }
                }}
            />
        ),
        className: 'p-0 bg-background border toast-important',
        duration: Infinity,
    })
}

export function useIncidentListener() {
    useEffect(() => {
        console.log('[IncidentListener] Initializing...')
        const supabase = createClient()

        // Subscribe to new incidents
        const channel = supabase
            .channel('incident-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'incidents',
                },
                payload => {
                    const incident = payload.new as Incident
                    const toastId = `toast-${incident.id}`

                    console.log(
                        '[IncidentListener] New incident:',
                        incident.title,
                    )

                    try {
                        toast({
                            description: (
                                <AIIncidentNotification
                                    id={toastId}
                                    incidentId={incident.id}
                                    numRelatedTickets={
                                        incident.linked_ticket_ids.length
                                    }
                                    description={incident.pattern_name}
                                    analysisId={incident.analysis_id}
                                    onOpenChange={() => {
                                        try {
                                            const toastEl =
                                                document.getElementById(toastId)
                                            if (toastEl?.parentElement) {
                                                toastEl.parentElement.remove()
                                            }
                                        } catch (error) {
                                            console.error(
                                                '[IncidentListener] Failed to cleanup toast:',
                                                error,
                                            )
                                        }
                                    }}
                                />
                            ),
                            className:
                                'p-0 bg-background border toast-important',
                            duration: Infinity,
                        })
                    } catch (error) {
                        console.error(
                            '[IncidentListener] Failed to show notification:',
                            error,
                        )
                    }
                },
            )
            .subscribe()

        return () => {
            console.log('[IncidentListener] Cleaning up...')
            channel.unsubscribe()
        }
    }, [])
}

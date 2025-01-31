'use client'

import { create } from 'zustand'

interface IncidentQueueItem {
    id: string
    analysisId: string
    description: string
    numRelatedTickets: number
    timestamp: string
}

interface IncidentQueueStore {
    queue: IncidentQueueItem[]
    addToQueue: (incident: IncidentQueueItem) => void
    removeFromQueue: (id: string) => void
}

const useIncidentQueueStore = create<IncidentQueueStore>(set => ({
    queue: [],
    addToQueue: incident =>
        set(state => ({
            queue: [...state.queue, incident],
        })),
    removeFromQueue: id =>
        set(state => ({
            queue: state.queue.filter(item => item.id !== id),
        })),
}))

export function useIncidentQueue() {
    const { queue, addToQueue, removeFromQueue } = useIncidentQueueStore()
    return { queue, addToQueue, removeFromQueue }
}

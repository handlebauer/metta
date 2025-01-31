import type { TicketRow } from './ticket.schemas'

export interface AnalysisState {
    total_tickets: number
    time_window: string
    status: 'analyzing' | 'completed' | 'no_tickets'
}

export interface Pattern {
    name: string
    description: string
    affected_systems: string[]
    severity: 'low' | 'medium' | 'high' | 'urgent'
    related_ticket_ids: string[]
}

export interface Incident {
    id: string
    title: string
    description: string
    pattern_name: string
    linked_ticket_ids: string[]
}

export interface FirebreakResponse {
    analysis_state: AnalysisState
    found_tickets: TicketRow[]
    identified_patterns: Pattern[]
    created_incidents: Incident[]
}

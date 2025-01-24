import { createClient } from '@/lib/supabase/server'

import type { Database } from '@/lib/supabase/types'

interface TicketVolumeData {
    date: string
    created: number
    resolved: number
}

interface ResolutionTimeData {
    agent_id: string | null
    agent_email: string | null
    avg_resolution_time: number // in hours
    total_resolved: number
}

interface TicketCountsData {
    total: number
    open: number
    urgent_open: number
    month_over_month_change: number
    resolution_rate: number
    resolution_rate_change: number
}

interface StatusDistributionData {
    status: 'new' | 'open' | 'closed'
    count: number
    color: string
}

type Ticket = Database['public']['Tables']['tickets']['Row']
type TicketStatusHistory =
    Database['public']['Tables']['ticket_status_history']['Row']

export async function getResolutionTimeStats(): Promise<{
    data: ResolutionTimeData[]
    error: Error | null
}> {
    try {
        const supabase = await createClient()

        // Get all status changes to 'closed' with their tickets and agents
        const { data: resolutionData, error: resolutionError } = await supabase
            .from('ticket_status_history')
            .select(
                `
                created_at,
                new_status,
                ticket_id,
                tickets (
                    created_at,
                    agent_id,
                    agents:users!tickets_agent_id_fkey (
                        email
                    )
                )
            `,
            )
            .eq('new_status', 'closed')

        if (resolutionError) throw resolutionError

        // Group resolution times by agent
        const agentStats = new Map<
            string,
            { total_time: number; count: number; email: string | null }
        >()

        resolutionData.forEach(record => {
            if (!record.tickets?.created_at || !record.created_at) return

            const agentId = record.tickets.agent_id || 'unassigned'
            const agentEmail = record.tickets.agents?.email || null
            const createdAt = new Date(record.tickets.created_at)
            const resolvedAt = new Date(record.created_at)
            const resolutionTime =
                (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60) // Convert to hours

            const current = agentStats.get(agentId) || {
                total_time: 0,
                count: 0,
                email: agentEmail,
            }
            agentStats.set(agentId, {
                total_time: current.total_time + resolutionTime,
                count: current.count + 1,
                email: agentEmail,
            })
        })

        // Convert to array and calculate averages
        const resolutionStats = Array.from(agentStats.entries()).map(
            ([agentId, stats]) => ({
                agent_id: agentId === 'unassigned' ? null : agentId,
                agent_email: stats.email,
                avg_resolution_time:
                    Math.round((stats.total_time / stats.count) * 10) / 10, // Round to 1 decimal place
                total_resolved: stats.count,
            }),
        )

        return { data: resolutionStats, error: null }
    } catch (error) {
        console.error('Error fetching resolution time stats:', error)
        return { data: [], error: error as Error }
    }
}

export async function getTicketVolumeStats(days: number = 30): Promise<{
    data: TicketVolumeData[]
    error: Error | null
}> {
    try {
        const supabase = await createClient()

        // Get ticket creation counts
        const { data: createdData, error: createdError } = await supabase
            .from('tickets')
            .select('created_at')
            .gte(
                'created_at',
                new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
            )

        if (createdError) throw createdError

        // Get ticket resolution counts using status history
        const { data: resolvedData, error: resolvedError } = await supabase
            .from('ticket_status_history')
            .select('created_at')
            .eq('new_status', 'closed')
            .gte(
                'created_at',
                new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
            )

        if (resolvedError) throw resolvedError

        // Create a map of weeks to counts
        const volumeMap = new Map<
            string,
            { created: number; resolved: number }
        >()

        // Initialize weeks for the past N days
        const now = new Date()
        const startDate = new Date(now)
        startDate.setDate(now.getDate() - days)

        // Get to the start of the week (Sunday)
        startDate.setDate(startDate.getDate() - startDate.getDay())
        startDate.setHours(0, 0, 0, 0)

        // Initialize all weeks
        while (startDate <= now) {
            const weekKey = startDate.toISOString().split('T')[0]
            volumeMap.set(weekKey, { created: 0, resolved: 0 })
            startDate.setDate(startDate.getDate() + 7)
        }

        // Count created tickets by week
        createdData.forEach((ticket: Pick<Ticket, 'created_at'>) => {
            if (!ticket.created_at) return
            const date = new Date(ticket.created_at)
            // Get to the start of the week (Sunday)
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            weekStart.setHours(0, 0, 0, 0)
            const weekKey = weekStart.toISOString().split('T')[0]
            const current = volumeMap.get(weekKey)
            if (current) {
                volumeMap.set(weekKey, {
                    ...current,
                    created: current.created + 1,
                })
            }
        })

        // Count resolved tickets by week
        resolvedData.forEach(
            (history: Pick<TicketStatusHistory, 'created_at'>) => {
                if (!history.created_at) return
                const date = new Date(history.created_at)
                // Get to the start of the week (Sunday)
                const weekStart = new Date(date)
                weekStart.setDate(date.getDate() - date.getDay())
                weekStart.setHours(0, 0, 0, 0)
                const weekKey = weekStart.toISOString().split('T')[0]
                const current = volumeMap.get(weekKey)
                if (current) {
                    volumeMap.set(weekKey, {
                        ...current,
                        resolved: current.resolved + 1,
                    })
                }
            },
        )

        // Convert map to array and sort by date
        const volumeData = Array.from(volumeMap.entries())
            .map(([date, counts]) => ({
                date,
                ...counts,
            }))
            .sort((a, b) => a.date.localeCompare(b.date))

        return { data: volumeData, error: null }
    } catch (error) {
        console.error('Error fetching ticket volume stats:', error)
        return { data: [], error: error as Error }
    }
}

export async function getTicketCounts(): Promise<{
    data: TicketCountsData
    error: Error | null
}> {
    try {
        const supabase = await createClient()
        const now = new Date()
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Get total tickets
        const { count: total, error: totalError } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })

        if (totalError) throw totalError

        // Get open tickets and urgent open tickets
        const { data: openData, error: openError } = await supabase
            .from('tickets')
            .select('priority, status')
            .or('status.eq.open,status.eq.new')

        if (openError) throw openError

        // Get closed tickets for this month
        const { count: closedThisMonth, error: closedThisMonthError } =
            await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'closed')
                .gte('created_at', thisMonth.toISOString())

        if (closedThisMonthError) throw closedThisMonthError

        // Get total tickets created this month
        const { count: createdThisMonth, error: createdThisMonthError } =
            await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', thisMonth.toISOString())

        if (createdThisMonthError) throw createdThisMonthError

        // Get last month's resolution rate for comparison
        const { count: closedLastMonth, error: closedLastMonthError } =
            await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'closed')
                .gte('created_at', lastMonth.toISOString())
                .lt('created_at', thisMonth.toISOString())

        if (closedLastMonthError) throw closedLastMonthError

        const { count: createdLastMonth, error: createdLastMonthError } =
            await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', lastMonth.toISOString())
                .lt('created_at', thisMonth.toISOString())

        if (createdLastMonthError) throw createdLastMonthError

        // Calculate month-over-month change for total tickets
        const monthOverMonthChange =
            createdLastMonth && createdThisMonth
                ? ((createdThisMonth - createdLastMonth) / createdLastMonth) *
                  100
                : 0

        // Calculate resolution rates
        const thisMonthRate = createdThisMonth
            ? ((closedThisMonth || 0) / createdThisMonth) * 100
            : 0
        const lastMonthRate = createdLastMonth
            ? ((closedLastMonth || 0) / createdLastMonth) * 100
            : 0
        const rateChange = lastMonthRate
            ? ((thisMonthRate - lastMonthRate) / lastMonthRate) * 100
            : 0

        return {
            data: {
                total: total || 0,
                open: openData.length,
                urgent_open:
                    openData.filter(ticket => ticket.priority === 'urgent')
                        .length || 0,
                month_over_month_change: Math.round(monthOverMonthChange),
                resolution_rate: Math.round(thisMonthRate),
                resolution_rate_change: Math.round(rateChange),
            },
            error: null,
        }
    } catch (error) {
        console.error('Error fetching ticket counts:', error)
        return {
            data: {
                total: 0,
                open: 0,
                urgent_open: 0,
                month_over_month_change: 0,
                resolution_rate: 0,
                resolution_rate_change: 0,
            },
            error: error as Error,
        }
    }
}

export async function getStatusDistribution(): Promise<{
    data: StatusDistributionData[]
    error: Error | null
}> {
    try {
        const supabase = await createClient()

        // Get counts for each status
        const { data, error } = await supabase.from('tickets').select('status')

        if (error) throw error

        // Count tickets by status
        const counts = data.reduce(
            (acc, ticket) => {
                const status = ticket.status || 'new' // Default to new if null
                acc[status] = (acc[status] || 0) + 1
                return acc
            },
            {} as Record<string, number>,
        )

        // Map to our response format with colors
        const statusData: StatusDistributionData[] = [
            {
                status: 'new',
                count: counts['new'] || 0,
                color: '#f97316', // Orange (same as volume chart)
            },
            {
                status: 'open',
                count: counts['open'] || 0,
                color: '#3b82f6', // Blue
            },
            {
                status: 'closed',
                count: counts['closed'] || 0,
                color: '#22c55e', // Green (same as volume chart)
            },
        ]

        return { data: statusData, error: null }
    } catch (error) {
        console.error('Error fetching status distribution:', error)
        return { data: [], error: error as Error }
    }
}

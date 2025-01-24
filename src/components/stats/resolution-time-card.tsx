'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ResolutionTimeData {
    agent_id: string | null
    agent_email: string | null
    avg_resolution_time: number // in hours
    total_resolved: number
}

interface ResolutionTimeCardProps {
    data: ResolutionTimeData[]
}

function formatDuration(hours: number): string {
    if (hours >= 24) {
        const days = Math.round((hours / 24) * 10) / 10
        return `${days} days`
    }
    return `${Math.round(hours * 10) / 10} hours`
}

export function ResolutionTimeCard({ data }: ResolutionTimeCardProps) {
    // Calculate overall average
    const overallStats = data.reduce(
        (acc, curr) => {
            return {
                total_time:
                    acc.total_time +
                    curr.avg_resolution_time * curr.total_resolved,
                total_resolved: acc.total_resolved + curr.total_resolved,
            }
        },
        { total_time: 0, total_resolved: 0 },
    )

    const overallAverage =
        Math.round(
            (overallStats.total_time / overallStats.total_resolved) * 10,
        ) / 10

    // Find the fastest agent
    const fastestAgent = data.reduce(
        (fastest, curr) =>
            curr.total_resolved >= 3 && // Only consider agents with at least 3 resolutions
            curr.avg_resolution_time < fastest.avg_resolution_time
                ? curr
                : fastest,
        { avg_resolution_time: Infinity } as ResolutionTimeData,
    )

    const trendIndicator =
        fastestAgent.avg_resolution_time < overallAverage ? 'down' : 'up'
    const trendPercentage = Math.round(
        ((fastestAgent.avg_resolution_time - overallAverage) / overallAverage) *
            100,
    )

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Avg. Resolution Time
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {formatDuration(overallAverage)}
                </div>
                {fastestAgent.agent_email && (
                    <p className="text-xs text-muted-foreground">
                        {fastestAgent.agent_email.split('@')[0]} is slowest at{' '}
                        {formatDuration(fastestAgent.avg_resolution_time)} (
                        {trendIndicator === 'down' ? '-' : '+'}
                        {Math.abs(trendPercentage)}% vs avg)
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

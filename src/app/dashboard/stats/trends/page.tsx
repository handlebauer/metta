import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    getResolutionTimeStats,
    getTicketVolumeStats,
} from '@/actions/stats.actions'

export default async function TrendsPage() {
    // Get 90 days of data for trends
    const { data: volumeData } = await getTicketVolumeStats(90)
    const { data: resolutionData } = await getResolutionTimeStats()

    // Initialize weekly data for the last 4 weeks
    const weeklyData: Record<string, { created: number; resolved: number }> = {}

    // Get the most recent Sunday as our anchor point
    const now = new Date()
    const lastSunday = new Date(now)
    lastSunday.setDate(now.getDate() - now.getDay())
    lastSunday.setHours(0, 0, 0, 0)

    // Initialize the last 4 weeks starting from last Sunday
    for (let i = 0; i < 4; i++) {
        const weekStart = new Date(lastSunday)
        weekStart.setDate(lastSunday.getDate() - i * 7)
        const weekKey = weekStart.toISOString().split('T')[0]
        weeklyData[weekKey] = { created: 0, resolved: 0 }
    }

    // Aggregate daily data into weeks
    volumeData.forEach(day => {
        const date = new Date(day.date)
        date.setHours(0, 0, 0, 0)
        const dayOfWeek = date.getDay()
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - dayOfWeek) // Get Sunday of this week
        const weekKey = weekStart.toISOString().split('T')[0]

        if (weeklyData[weekKey]) {
            weeklyData[weekKey].created += day.created
            weeklyData[weekKey].resolved += day.resolved
        }
    })

    // Sort weeks in ascending order
    const sortedWeeks = Object.entries(weeklyData).sort((a, b) =>
        a[0].localeCompare(b[0]),
    )

    // Calculate agent performance metrics
    const agentMetrics = resolutionData
        .filter(agent => agent.total_resolved >= 5)
        .map(agent => ({
            name: agent.agent_email?.split('@')[0] || 'Unassigned',
            resolution_time: agent.avg_resolution_time,
            tickets_resolved: agent.total_resolved,
        }))
        .sort((a, b) => a.resolution_time - b.resolution_time)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Trends</h2>
                <p className="text-muted-foreground">
                    Long-term patterns and performance metrics
                </p>
            </div>

            <Tabs defaultValue="weekly" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="weekly">Weekly Patterns</TabsTrigger>
                    <TabsTrigger value="performance">
                        Agent Performance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="weekly" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    Weekly Ticket Volume
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {sortedWeeks.map(([week, data]) => (
                                        <div
                                            key={week}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="text-sm text-muted-foreground">
                                                Week of {week}
                                            </span>
                                            <span className="text-sm font-medium">
                                                {data.created} new tickets
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    Ticket Resolution Efficiency
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {sortedWeeks.map(([week, data]) => (
                                        <div
                                            key={week}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="text-sm text-muted-foreground">
                                                Week of {week}
                                            </span>
                                            <span className="text-sm font-medium">
                                                {data.created === 0
                                                    ? '0'
                                                    : Math.round(
                                                          (data.resolved /
                                                              data.created) *
                                                              100,
                                                      )}
                                                % resolved
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    Weekly Backlog Indicator
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {sortedWeeks.map(([week, data]) => {
                                        const backlog =
                                            data.created - data.resolved
                                        return (
                                            <div
                                                key={week}
                                                className="flex items-center justify-between"
                                            >
                                                <span className="text-sm text-muted-foreground">
                                                    Week of {week}
                                                </span>
                                                <span
                                                    className={
                                                        backlog > 0
                                                            ? 'text-sm font-medium text-orange-500'
                                                            : 'text-sm font-medium text-green-500'
                                                    }
                                                >
                                                    {backlog > 0
                                                        ? `+${backlog} backlog`
                                                        : 'No backlog'}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {agentMetrics.map(agent => (
                            <Card key={agent.name}>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">
                                        {agent.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Avg. Resolution Time
                                            </span>
                                            <span className="text-sm font-medium">
                                                {agent.resolution_time.toFixed(
                                                    1,
                                                )}{' '}
                                                hours
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Tickets Resolved
                                            </span>
                                            <span className="text-sm font-medium">
                                                {agent.tickets_resolved}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

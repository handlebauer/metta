import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResolutionTimeCard } from '@/components/stats/resolution-time-card'
import { StatusDistributionChart } from '@/components/stats/status-distribution-chart'
import { TicketVolumeChart } from '@/components/stats/ticket-volume-chart'
import {
    getResolutionTimeStats,
    getStatusDistribution,
    getTicketCounts,
    getTicketVolumeStats,
} from '@/actions/stats.actions'

export default async function OverviewPage() {
    const { data: volumeData, error: volumeError } =
        await getTicketVolumeStats()
    const { data: resolutionData, error: resolutionError } =
        await getResolutionTimeStats()
    const { data: ticketCounts, error: countsError } = await getTicketCounts()
    const { data: statusData, error: statusError } =
        await getStatusDistribution()

    if (volumeError) {
        console.error('Error fetching ticket volume stats:', volumeError)
    }

    if (resolutionError) {
        console.error('Error fetching resolution time stats:', resolutionError)
    }

    if (countsError) {
        console.error('Error fetching ticket counts:', countsError)
    }

    if (statusError) {
        console.error('Error fetching status distribution:', statusError)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Stats</h2>
                <p className="text-muted-foreground">
                    Monitor support operations and track key metrics
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Tickets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {ticketCounts.total}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {ticketCounts.month_over_month_change > 0 &&
                                    '+'}
                                {ticketCounts.month_over_month_change}% from
                                last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Open Tickets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {ticketCounts.open}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {ticketCounts.urgent_open} urgent
                            </p>
                        </CardContent>
                    </Card>
                    <ResolutionTimeCard data={resolutionData || []} />
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Resolution Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {ticketCounts.resolution_rate}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {ticketCounts.resolution_rate_change > 0 && '+'}
                                {ticketCounts.resolution_rate_change}% from last
                                month
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                    <TicketVolumeChart data={volumeData || []} />
                    <StatusDistributionChart data={statusData || []} />
                </div>
            </div>
        </div>
    )
}

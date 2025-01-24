'use client'

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TicketVolumeData {
    date: string
    created: number
    resolved: number
}

interface TicketVolumeChartProps {
    data: TicketVolumeData[]
}

export function TicketVolumeChart({ data }: TicketVolumeChartProps) {
    // Format the date to show "Week of MM/DD"
    const formattedData = data.map(item => ({
        ...item,
        week: `${new Date(item.date).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
        })}`,
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ticket Volume</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] pl-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={formattedData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                        />
                        <XAxis
                            dataKey="week"
                            className="text-xs text-muted-foreground"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            className="text-xs text-muted-foreground"
                            allowDecimals={false}
                            domain={[0, 'auto']}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Created
                                                    </span>
                                                    <span className="font-bold text-orange-500">
                                                        {
                                                            payload[0]
                                                                .value as number
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Resolved
                                                    </span>
                                                    <span className="font-bold text-green-500">
                                                        {
                                                            payload[1]
                                                                .value as number
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="created"
                            stroke="#f97316"
                            strokeWidth={2}
                            strokeOpacity={0.2}
                            dot={{
                                r: 4,
                                strokeWidth: 2,
                                strokeOpacity: 1,
                                fill: '#f97316',
                                fillOpacity: 0.2,
                            }}
                            activeDot={{
                                r: 6,
                                strokeWidth: 0,
                                fill: '#f97316',
                                fillOpacity: 0.2,
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="resolved"
                            stroke="#22c55e"
                            strokeWidth={2}
                            strokeOpacity={0.2}
                            dot={{
                                r: 4,
                                strokeWidth: 2,
                                strokeOpacity: 1,
                                fill: '#22c55e',
                                fillOpacity: 0.2,
                            }}
                            activeDot={{
                                r: 6,
                                strokeWidth: 0,
                                fill: '#22c55e',
                                fillOpacity: 0.2,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

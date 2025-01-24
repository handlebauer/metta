'use client'

import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatusDistributionData {
    status: 'new' | 'open' | 'closed'
    count: number
    color: string
}

interface StatusDistributionChartProps {
    data: StatusDistributionData[]
}

const STATUS_LABELS = {
    new: 'New',
    open: 'In Progress',
    closed: 'Resolved',
}

export function StatusDistributionChart({
    data,
}: StatusDistributionChartProps) {
    const total = data.reduce((sum, item) => sum + item.count, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <XAxis
                            dataKey="status"
                            tickFormatter={status =>
                                STATUS_LABELS[
                                    status as keyof typeof STATUS_LABELS
                                ]
                            }
                            className="text-xs text-muted-foreground"
                        />
                        <YAxis className="text-xs text-muted-foreground" />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        {
                                                            STATUS_LABELS[
                                                                data.status as keyof typeof STATUS_LABELS
                                                            ]
                                                        }
                                                    </span>
                                                    <span
                                                        className="font-bold"
                                                        style={{
                                                            color: data.color,
                                                        }}
                                                    >
                                                        {data.count} tickets (
                                                        {Math.round(
                                                            (data.count /
                                                                total) *
                                                                100,
                                                        )}
                                                        %)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={entry.color}
                                    fillOpacity={0.2}
                                    stroke={entry.color}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

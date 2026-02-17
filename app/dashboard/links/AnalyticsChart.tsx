"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

interface Props {
    data: { date: string; revenue: number }[];
}

export function AnalyticsChart({ data }: Props) {
    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 0,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C8FF00" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#C8FF00" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#999' }}
                        minTickGap={30}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#999' }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#000', fontWeight: 'bold' }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, "Revenue"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#A3D900"
                        strokeWidth={3}
                        fill="url(#colorRevenue)"
                        animationDuration={800}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

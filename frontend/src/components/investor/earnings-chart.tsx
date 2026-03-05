'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { TrendingUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { format, subDays } from 'date-fns';

type TimeRange = '7D' | '30D' | '90D' | 'All';

interface EarningsDataPoint {
    date: string;
    value: number;
    displayDate: string;
}

interface EarningsChartProps {
    className?: string;
}

// Generate mock earnings data for demonstration
function generateEarningsData(days: number): EarningsDataPoint[] {
    const data: EarningsDataPoint[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = subDays(today, i);
        // Generate realistic earnings curve with some volatility
        const baseValue = 1000 + (days - i) * 50;
        const volatility = Math.sin(i / 5) * 100 + Math.random() * 50;
        const value = Math.max(0, baseValue + volatility);

        data.push({
            date: date.toISOString(),
            value: Math.round(value * 100) / 100,
            displayDate: format(date, 'MMM dd'),
        });
    }

    return data;
}

// Custom tooltip component
function CustomTooltip({ active, payload }: any) {
    if (!active || !payload || !payload.length) {
        return null;
    }

    const data = payload[0].payload;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border border-border rounded-lg shadow-lg p-3"
        >
            <p className="text-sm font-medium text-foreground mb-1">
                {format(new Date(data.date), 'MMM dd, yyyy')}
            </p>
            <p className="text-lg font-bold text-primary">
                {data.value.toFixed(2)} CTC
            </p>
        </motion.div>
    );
}

export function EarningsChart({ className }: EarningsChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('30D');
    const [isLoading] = useState(false);

    // Generate data based on selected time range
    const chartData = useMemo(() => {
        const daysMap: Record<TimeRange, number> = {
            '7D': 7,
            '30D': 30,
            '90D': 90,
            'All': 365, // Using 1 year for "All"
        };

        return generateEarningsData(daysMap[timeRange]);
    }, [timeRange]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (chartData.length === 0) {
            return { current: 0, change: 0, changePercent: 0 };
        }

        const current = chartData[chartData.length - 1].value;
        const previous = chartData[0].value;
        const change = current - previous;
        const changePercent = previous > 0 ? (change / previous) * 100 : 0;

        return { current, change, changePercent };
    }, [chartData]);

    const hasData = chartData.length > 0;

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    if (!hasData) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Earnings Over Time
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Earnings Data</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Start investing in invoices to see your earnings performance over time.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className={className}
        >
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Earnings Over Time
                        </CardTitle>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-2xl font-bold">
                                {stats.current.toFixed(2)} CTC
                            </span>
                            <span
                                className={`text-sm font-medium ${stats.changePercent >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                            >
                                {stats.changePercent >= 0 ? '+' : ''}
                                {stats.changePercent.toFixed(2)}%
                            </span>
                        </div>
                    </div>

                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={(value) => {
                            if (value) setTimeRange(value as TimeRange);
                        }}
                        className="bg-muted"
                    >
                        <ToggleGroupItem value="7D" aria-label="7 days">
                            7D
                        </ToggleGroupItem>
                        <ToggleGroupItem value="30D" aria-label="30 days">
                            30D
                        </ToggleGroupItem>
                        <ToggleGroupItem value="90D" aria-label="90 days">
                            90D
                        </ToggleGroupItem>
                        <ToggleGroupItem value="All" aria-label="All time">
                            All
                        </ToggleGroupItem>
                    </ToggleGroup>
                </CardHeader>

                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="hsl(var(--primary))"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="hsl(var(--primary))"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="hsl(var(--border))"
                                    opacity={0.3}
                                />

                                <XAxis
                                    dataKey="displayDate"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />

                                <Tooltip content={<CustomTooltip />} />

                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    fill="url(#earningsGradient)"
                                    animationDuration={1000}
                                    animationEasing="ease-in-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

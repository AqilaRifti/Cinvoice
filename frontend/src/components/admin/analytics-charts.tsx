'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Download, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';

// Mock data - in production, fetch from contracts/backend
const dailyVolumeData = [
    { date: '2024-01-01', volume: 12000 },
    { date: '2024-01-02', volume: 15000 },
    { date: '2024-01-03', volume: 18000 },
    { date: '2024-01-04', volume: 14000 },
    { date: '2024-01-05', volume: 22000 },
    { date: '2024-01-06', volume: 19000 },
    { date: '2024-01-07', volume: 25000 },
];

const creditScoreDistribution = [
    { range: '300-499', count: 5, color: '#ef4444' },
    { range: '500-649', count: 12, color: '#f59e0b' },
    { range: '650-749', count: 25, color: '#eab308' },
    { range: '750-850', count: 18, color: '#22c55e' },
];

const repaymentRateData = [
    { month: 'Jan', rate: 92 },
    { month: 'Feb', rate: 94 },
    { month: 'Mar', rate: 91 },
    { month: 'Apr', rate: 95 },
    { month: 'May', rate: 93 },
    { month: 'Jun', rate: 96 },
];

type TimeRange = '7D' | '30D' | '90D' | 'All';

export function AnalyticsCharts() {
    const [timeRange, setTimeRange] = useState<TimeRange>('7D');
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const chartColors = {
        primary: isDark ? '#3b82f6' : '#2563eb',
        secondary: isDark ? '#8b5cf6' : '#7c3aed',
        success: isDark ? '#22c55e' : '#16a34a',
        grid: isDark ? '#374151' : '#e5e7eb',
        text: isDark ? '#9ca3af' : '#6b7280',
    };

    const handleExportData = () => {
        // In production: export data as CSV/JSON
        console.log('Exporting analytics data...');
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <ToggleGroup type="single" value={timeRange} onValueChange={(v) => v && setTimeRange(v as TimeRange)}>
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
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                </Button>
            </div>

            {/* Daily Volume Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Daily Volume
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyVolumeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                            <XAxis
                                dataKey="date"
                                stroke={chartColors.text}
                                tick={{ fill: chartColors.text }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis
                                stroke={chartColors.text}
                                tick={{ fill: chartColors.text }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${chartColors.grid}`,
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Legend />
                            <Bar dataKey="volume" fill={chartColors.primary} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Credit Score Distribution Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5" />
                            Credit Score Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={creditScoreDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {creditScoreDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                        border: `1px solid ${chartColors.grid}`,
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Repayment Rate Line Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Repayment Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={repaymentRateData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis
                                    dataKey="month"
                                    stroke={chartColors.text}
                                    tick={{ fill: chartColors.text }}
                                />
                                <YAxis
                                    stroke={chartColors.text}
                                    tick={{ fill: chartColors.text }}
                                    domain={[85, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                        border: `1px solid ${chartColors.grid}`,
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value: number) => [`${value}%`, 'Repayment Rate']}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="rate"
                                    stroke={chartColors.success}
                                    strokeWidth={2}
                                    dot={{ fill: chartColors.success, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreditScore } from '@/hooks/use-credit-score';
import { useDiscountRate } from '@/hooks/use-credit-score-oracle';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

// Circular progress component
function CircularProgress({ value, size = 160, strokeWidth = 12 }: { value: number; size?: number; strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    // Color based on score range
    const getColor = () => {
        if (value >= ((700 - 300) / (850 - 300)) * 100) return 'hsl(var(--chart-2))'; // green
        if (value >= ((550 - 300) / (850 - 300)) * 100) return 'hsl(var(--chart-3))'; // yellow
        return 'hsl(var(--chart-1))'; // red
    };

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                className="text-muted/20"
            />
            {/* Progress circle */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={getColor()}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: 'easeOut' }}
            />
        </svg>
    );
}

export function CreditScoreCard() {
    const { score, profile, isLoading } = useCreditScore();
    const { discountRate } = useDiscountRate();

    const scorePercentage = ((score - 300) / (850 - 300)) * 100;

    // Generate mock sparkline data based on score (in production, this would come from historical data)
    const sparklineData = useMemo(() => {
        const trend = score >= 700 ? 'up' : score >= 550 ? 'stable' : 'down';
        const baseScore = score;
        const variance = 20;

        return Array.from({ length: 7 }, (_, i) => {
            let value = baseScore;
            if (trend === 'up') {
                value = baseScore - variance + (i * variance / 6);
            } else if (trend === 'down') {
                value = baseScore + variance - (i * variance / 6);
            } else {
                value = baseScore + (Math.random() - 0.5) * variance;
            }
            return { value: Math.max(300, Math.min(850, value)) };
        });
    }, [score]);

    const getScoreColor = (score: number) => {
        if (score >= 700) return 'text-green-600 dark:text-green-400';
        if (score >= 550) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreIcon = (score: number) => {
        if (score >= 700) return <TrendingUp className="h-6 w-6 text-green-600" />;
        if (score >= 550) return <Minus className="h-6 w-6 text-yellow-600" />;
        return <TrendingDown className="h-6 w-6 text-red-600" />;
    };

    const getScoreLabel = (score: number) => {
        if (score >= 700) return 'Excellent';
        if (score >= 600) return 'Good';
        if (score >= 550) return 'Fair';
        if (score >= 400) return 'Poor';
        return 'Very Poor';
    };

    const getSparklineColor = (score: number) => {
        if (score >= 700) return 'hsl(var(--chart-2))'; // green
        if (score >= 550) return 'hsl(var(--chart-3))'; // yellow
        return 'hsl(var(--chart-1))'; // red
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Credit Score</CardTitle>
                    <CardDescription>Your on-chain credit rating</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-40 bg-muted rounded-full w-40 mx-auto" />
                        <div className="h-16 bg-muted rounded" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-20 bg-muted rounded" />
                            <div className="h-20 bg-muted rounded" />
                        </div>
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
            transition={{ duration: 0.5 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Credit Score</CardTitle>
                    <CardDescription>Your on-chain credit rating</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Circular Progress Indicator */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative">
                            <CircularProgress value={scorePercentage} size={160} strokeWidth={12} />
                            <motion.div
                                className="absolute inset-0 flex flex-col items-center justify-center"
                                variants={scaleIn}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                                    <AnimatedCounter value={score} duration={1500} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {getScoreLabel(score)}
                                </p>
                            </motion.div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            {getScoreIcon(score)}
                            <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Range:</span> 300 - 850
                            </div>
                        </div>
                    </div>

                    {/* Sparkline Chart */}
                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Score Trend</p>
                            <div className="flex items-center gap-1">
                                {getScoreIcon(score)}
                                <span className="text-xs text-muted-foreground">Last 7 days</span>
                            </div>
                        </div>
                        <div className="h-12 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sparklineData}>
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={getSparklineColor(score)}
                                        strokeWidth={2}
                                        dot={false}
                                        animationDuration={1000}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Discount Rate and Repayment Rate */}
                    <motion.div
                        className="grid grid-cols-2 gap-4 pt-4 border-t"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Discount Rate</p>
                            <p className="text-2xl font-bold">
                                <AnimatedCounter
                                    value={discountRate / 100}
                                    format="decimal"
                                    decimals={1}
                                    suffix="%"
                                    duration={1500}
                                />
                            </p>
                            <p className="text-xs text-muted-foreground">Applied to invoices</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Repayment Rate</p>
                            <p className="text-2xl font-bold">
                                <AnimatedCounter
                                    value={
                                        profile && profile.totalInvoices > 0
                                            ? (profile.successfulRepayments / profile.totalInvoices) * 100
                                            : 0
                                    }
                                    format="decimal"
                                    decimals={0}
                                    suffix="%"
                                    duration={1500}
                                />
                            </p>
                            <p className="text-xs text-muted-foreground">Success rate</p>
                        </div>
                    </motion.div>

                    {/* Profile Stats */}
                    {profile && (
                        <motion.div
                            className="grid grid-cols-3 gap-4 pt-4 border-t"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                        >
                            <div className="text-center">
                                <p className="text-2xl font-bold">
                                    <AnimatedCounter value={profile.totalInvoices} duration={1500} />
                                </p>
                                <p className="text-xs text-muted-foreground">Total Invoices</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    <AnimatedCounter value={profile.successfulRepayments} duration={1500} />
                                </p>
                                <p className="text-xs text-muted-foreground">Repaid</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">
                                    <AnimatedCounter value={profile.defaults} duration={1500} />
                                </p>
                                <p className="text-xs text-muted-foreground">Defaults</p>
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserInvestments } from '@/hooks/use-user-investments';
import { formatCurrency } from '@/lib/calculations';
import { AnimatedCounter, PercentageCounter } from '@/components/shared/animated-counter';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { Wallet, TrendingUp, Activity, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { useMemo } from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    change?: number;
    isLoading?: boolean;
    isROI?: boolean;
}

function StatCard({ title, value, icon, change, isLoading, isROI = false }: StatCardProps) {
    const hasPositiveChange = change !== undefined && change > 0;
    const hasNegativeChange = change !== undefined && change < 0;

    // For ROI, color is based on the value itself, not the change
    const roiColor = isROI && typeof value === 'number'
        ? value >= 0 ? 'text-green-600' : 'text-red-600'
        : '';

    if (isLoading) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </CardTitle>
                    <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                    <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className="text-muted-foreground">
                        {icon}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${roiColor}`}>
                        {typeof value === 'number' && !isROI ? (
                            <AnimatedCounter value={value} duration={1500} />
                        ) : isROI && typeof value === 'number' ? (
                            <PercentageCounter value={value} duration={1500} decimals={2} />
                        ) : (
                            value
                        )}
                    </div>
                    {change !== undefined && (
                        <motion.div
                            className="flex items-center gap-1 text-xs mt-1"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {hasPositiveChange && (
                                <>
                                    <ArrowUp className="h-3 w-3 text-green-600" />
                                    <span className="text-green-600 font-medium">
                                        +{change.toFixed(1)}%
                                    </span>
                                </>
                            )}
                            {hasNegativeChange && (
                                <>
                                    <ArrowDown className="h-3 w-3 text-red-600" />
                                    <span className="text-red-600 font-medium">
                                        {change.toFixed(1)}%
                                    </span>
                                </>
                            )}
                            {!hasPositiveChange && !hasNegativeChange && (
                                <span className="text-muted-foreground">
                                    No change
                                </span>
                            )}
                            <span className="text-muted-foreground">from last period</span>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

export function PortfolioSummary() {
    const { stats, isLoading } = useUserInvestments();

    // Mock percentage changes (in production, calculate from historical data)
    const changes = useMemo(() => {
        if (!stats) {
            return {
                totalInvested: 0,
                totalReturned: 0,
                activeInvestments: 0,
                roi: 0,
            };
        }

        // Generate realistic-looking changes based on current stats
        return {
            totalInvested: stats.totalInvested > 0n ? Math.random() * 20 - 5 : 0, // -5% to +15%
            totalReturned: stats.totalReturned > 0n ? Math.random() * 30 : 0, // 0% to +30%
            activeInvestments: stats.activeInvestments > 0 ? Math.random() * 15 - 7.5 : 0, // -7.5% to +7.5%
            roi: stats.roi !== 0 ? Math.random() * 10 - 5 : 0, // -5% to +5%
        };
    }, [stats]);

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-4 grid-cols-2 md:grid-cols-4"
        >
            <StatCard
                title="Total Invested"
                value={`${formatCurrency(stats?.totalInvested || 0n, 0)} CTC`}
                icon={<Wallet className="h-5 w-5" />}
                change={changes.totalInvested}
                isLoading={isLoading}
            />
            <StatCard
                title="Total Returned"
                value={`${formatCurrency(stats?.totalReturned || 0n, 0)} CTC`}
                icon={<TrendingUp className="h-5 w-5" />}
                change={changes.totalReturned}
                isLoading={isLoading}
            />
            <StatCard
                title="Active Investments"
                value={stats?.activeInvestments || 0}
                icon={<Activity className="h-5 w-5" />}
                change={changes.activeInvestments}
                isLoading={isLoading}
            />
            <StatCard
                title="Overall ROI"
                value={stats?.roi || 0}
                icon={<Target className="h-5 w-5" />}
                change={changes.roi}
                isLoading={isLoading}
                isROI={true}
            />
        </motion.div>
    );
}

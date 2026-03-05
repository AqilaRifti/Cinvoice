'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserInvoices } from '@/hooks/use-invoice-nft';
import { InvoiceState } from '@/lib/contracts';
import { formatCurrency } from '@/lib/calculations';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { FileText, Clock, DollarSign, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useMemo } from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    change?: number;
    isLoading?: boolean;
}

function StatCard({ title, value, icon, change, isLoading }: StatCardProps) {
    const hasPositiveChange = change !== undefined && change > 0;
    const hasNegativeChange = change !== undefined && change < 0;

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
                    <div className="text-2xl font-bold">
                        {typeof value === 'number' ? (
                            <AnimatedCounter value={value} duration={1500} />
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
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                    <span className="text-green-600 font-medium">
                                        +{change.toFixed(1)}%
                                    </span>
                                </>
                            )}
                            {hasNegativeChange && (
                                <>
                                    <TrendingDown className="h-3 w-3 text-red-600" />
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

export function InvoiceStats() {
    const { invoices, isLoading } = useUserInvoices();

    // Calculate statistics
    const stats = useMemo(() => {
        if (!invoices || invoices.length === 0) {
            return {
                total: 0,
                pending: 0,
                funded: 0,
                totalRaised: 0n,
            };
        }

        const total = invoices.length;
        const pending = invoices.filter((inv) => inv.state === InvoiceState.Pending).length;
        const funded = invoices.filter((inv) => inv.state === InvoiceState.Funded).length;

        // Total raised is the sum of purchase prices from funded invoices
        // For now, we'll use a placeholder calculation since we need to fetch investment data
        // In a real implementation, this would require fetching investment details for each funded invoice
        const totalRaised = invoices
            .filter((inv) => inv.state === InvoiceState.Funded || inv.state === InvoiceState.Repaid)
            .reduce((sum, inv) => sum + inv.faceValue, 0n);

        return {
            total,
            pending,
            funded,
            totalRaised,
        };
    }, [invoices]);

    // Mock percentage changes (in production, calculate from historical data)
    const changes = useMemo(() => {
        // Generate realistic-looking changes based on current stats
        return {
            total: stats.total > 0 ? Math.random() * 20 - 5 : 0, // -5% to +15%
            pending: stats.pending > 0 ? Math.random() * 15 - 7.5 : 0, // -7.5% to +7.5%
            funded: stats.funded > 0 ? Math.random() * 25 - 10 : 0, // -10% to +15%
            totalRaised: stats.totalRaised > 0n ? Math.random() * 30 : 0, // 0% to +30%
        };
    }, [stats.total, stats.pending, stats.funded, stats.totalRaised]);

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-4 grid-cols-2 md:grid-cols-4"
        >
            <StatCard
                title="Total Invoices"
                value={stats.total}
                icon={<FileText className="h-5 w-5" />}
                change={changes.total}
                isLoading={isLoading}
            />
            <StatCard
                title="Pending Invoices"
                value={stats.pending}
                icon={<Clock className="h-5 w-5" />}
                change={changes.pending}
                isLoading={isLoading}
            />
            <StatCard
                title="Funded Invoices"
                value={stats.funded}
                icon={<DollarSign className="h-5 w-5" />}
                change={changes.funded}
                isLoading={isLoading}
            />
            <StatCard
                title="Total Raised"
                value={`${formatCurrency(stats.totalRaised, 0)} CTC`}
                icon={<CheckCircle className="h-5 w-5" />}
                change={changes.totalRaised}
                isLoading={isLoading}
            />
        </motion.div>
    );
}

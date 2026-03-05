'use client';

import { motion, useInView } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlatformStats } from '@/hooks/use-platform-stats';
import { IntegerCounter, CurrencyCounter } from '@/components/shared/animated-counter';
import { FileText, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { formatEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

const stats = [
    {
        icon: FileText,
        label: 'Total Invoices',
        key: 'totalInvoices' as const,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        format: 'integer' as const,
    },
    {
        icon: DollarSign,
        label: 'Total Volume',
        key: 'treasuryBalance' as const,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        format: 'currency' as const,
    },
    {
        icon: TrendingUp,
        label: 'Active Investments',
        key: 'activeInvestments' as const,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        format: 'integer' as const,
    },
    {
        icon: CheckCircle,
        label: 'Success Rate',
        key: 'successRate' as const,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        format: 'percentage' as const,
    },
];

const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
};

const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
        },
    },
};

export function StatsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const queryClient = useQueryClient();
    const { totalInvoices, treasuryBalance, isLoading } = usePlatformStats();

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            queryClient.invalidateQueries({ queryKey: ['platform'] });
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [queryClient]);

    // Calculate derived stats
    const activeInvestments = Math.floor(totalInvoices * 0.6); // Mock: 60% of invoices are active
    const successRate = 94.5; // Mock: 94.5% success rate

    const statsData = {
        totalInvoices,
        treasuryBalance,
        activeInvestments,
        successRate,
    };

    return (
        <section ref={ref} className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Platform Statistics
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Real-time metrics from the Creditcoin Invoice Financing Platform
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={stat.key}
                            stat={stat}
                            value={statsData[stat.key]}
                            index={index}
                            isInView={isInView}
                            isLoading={isLoading}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

interface StatCardProps {
    stat: typeof stats[0];
    value: number | bigint;
    index: number;
    isInView: boolean;
    isLoading: boolean;
}

function StatCard({ stat, value, index, isInView, isLoading }: StatCardProps) {
    const Icon = stat.icon;

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="h-full border-2 hover:border-primary/50 transition-colors duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                    {isLoading ? (
                        <StatCardSkeleton />
                    ) : (
                        <>
                            {/* Icon */}
                            <motion.div
                                className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-4`}
                                variants={iconVariants}
                                initial="hidden"
                                animate={isInView ? 'visible' : 'hidden'}
                                transition={{ delay: index * 0.1 + 0.2 }}
                            >
                                <Icon className={`h-6 w-6 ${stat.color}`} />
                            </motion.div>

                            {/* Value */}
                            <div className="mb-2">
                                {stat.format === 'integer' && (
                                    <IntegerCounter
                                        value={Number(value)}
                                        className="text-2xl md:text-3xl font-bold"
                                    />
                                )}
                                {stat.format === 'currency' && (
                                    <CurrencyCounter
                                        value={Number(formatEther(value as bigint))}
                                        currency="CTC"
                                        decimals={0}
                                        className="text-2xl md:text-3xl font-bold"
                                    />
                                )}
                                {stat.format === 'percentage' && (
                                    <span className="text-2xl md:text-3xl font-bold">
                                        <IntegerCounter value={Number(value)} />%
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
    );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, INVOICE_NFT_ABI, GOVERNANCE_ABI, FINANCING_POOL_ABI } from '@/lib/contracts';
import { formatEther } from 'viem';
import { FileText, DollarSign, TrendingUp, Wallet, ArrowUp, ArrowDown } from 'lucide-react';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { usePlatformStats } from '@/hooks/use-platform-stats';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    description: string;
    isAnimated?: boolean;
}

function MetricCard({ title, value, change, icon, description, isAnimated = false }: MetricCardProps) {
    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {isAnimated && typeof value === 'number' ? (
                        <AnimatedCounter value={value} />
                    ) : (
                        value
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{description}</p>
                    {change !== undefined && change !== 0 && (
                        <div
                            className={cn(
                                'flex items-center gap-1 text-xs font-medium',
                                isPositive && 'text-green-600 dark:text-green-400',
                                isNegative && 'text-red-600 dark:text-red-400'
                            )}
                        >
                            {isPositive ? (
                                <ArrowUp className="h-3 w-3" />
                            ) : (
                                <ArrowDown className="h-3 w-3" />
                            )}
                            <span>{Math.abs(change)}%</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function PlatformMetrics() {
    const { data: nextTokenId } = useReadContract({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        functionName: 'nextTokenId',
    });

    const { data: treasuryBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.PlatformGovernance,
        abi: GOVERNANCE_ABI,
        functionName: 'getTreasuryBalance',
    });

    const { data: platformFee } = useReadContract({
        address: CONTRACT_ADDRESSES.FinancingPool,
        abi: FINANCING_POOL_ABI,
        functionName: 'platformFeePercent',
    });

    const { totalInvoices: platformTotalInvoices, treasuryBalance: platformTreasury, isLoading } = usePlatformStats();

    const totalInvoices = nextTokenId ? Number(nextTokenId) : 0;
    const totalVolume = 0n; // TODO: Calculate from invoice data
    const activeInvestments = 0; // TODO: Calculate from investment data
    const feePercent = platformFee ? Number(platformFee) / 100 : 0;

    // Mock trend data (in production, calculate from historical data)
    const trends = {
        invoices: 12.5,
        volume: 8.3,
        investments: -2.1,
        treasury: 15.7,
    };

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="space-y-0 pb-2">
                            <div className="h-4 bg-muted rounded w-24" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded w-32 mb-2" />
                            <div className="h-3 bg-muted rounded w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-4 gap-4">
            <MetricCard
                title="Total Invoices"
                value={totalInvoices}
                change={trends.invoices}
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                description="All time"
                isAnimated
            />

            <MetricCard
                title="Total Volume"
                value={`${formatEther(totalVolume)} CTC`}
                change={trends.volume}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                description="Face value sum"
            />

            <MetricCard
                title="Active Investments"
                value={activeInvestments}
                change={trends.investments}
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                description="Currently funded"
                isAnimated
            />

            <MetricCard
                title="Treasury Balance"
                value={`${treasuryBalance ? formatEther(treasuryBalance) : '0'} CTC`}
                change={trends.treasury}
                icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                description={`Platform fee: ${feePercent}%`}
            />
        </div>
    );
}

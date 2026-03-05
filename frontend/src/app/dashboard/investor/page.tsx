'use client';

import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { PortfolioSummary } from '@/components/investor/portfolio-summary';
import { EarningsChart } from '@/components/investor/earnings-chart';
import { MarketplaceGrid } from '@/components/investor/marketplace-grid';
import { MarketplaceFilters, MarketplaceFiltersState } from '@/components/investor/marketplace-filters';
import { PortfolioTable } from '@/components/investor/portfolio-table';
import { useMarketplaceInvoices } from '@/hooks/use-invoices';
import { useUserInvestments } from '@/hooks/use-user-investments';
import { useUserRole } from '@/hooks/use-user-role';
import { Invoice, InvoiceState } from '@/types';
import { Wallet, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { formatEther } from 'viem';
import { formatCurrency } from '@/lib/format';

export default function InvestorDashboard() {
    const { address, isConnected } = useAccount();
    const { role } = useUserRole();
    const { invoices: marketplaceInvoices, isLoading: marketplaceLoading } = useMarketplaceInvoices();
    const { investments, isLoading: investmentsLoading } = useUserInvestments();

    const [filters, setFilters] = useState<MarketplaceFiltersState>({
        creditScoreMin: 300,
        creditScoreMax: 850,
        faceValueMin: 0,
        faceValueMax: 10000,
        states: [],
        sortBy: 'roi-desc',
    });

    // Filter and sort marketplace invoices
    const filteredInvoices = useMemo(() => {
        let filtered = marketplaceInvoices.filter((invoice) => {
            // Credit score filter
            if (invoice.creditScoreAtMinting < filters.creditScoreMin ||
                invoice.creditScoreAtMinting > filters.creditScoreMax) {
                return false;
            }

            // Face value filter
            const faceValue = Number(formatEther(invoice.faceValue));
            if (faceValue < filters.faceValueMin || faceValue > filters.faceValueMax) {
                return false;
            }

            // Date range filter
            const repaymentDate = new Date(invoice.repaymentDate * 1000);
            if (filters.dateFrom && repaymentDate < filters.dateFrom) {
                return false;
            }
            if (filters.dateTo && repaymentDate > filters.dateTo) {
                return false;
            }

            // State filter
            if (filters.states.length > 0 && !filters.states.includes(invoice.state)) {
                return false;
            }

            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'roi-desc':
                    // Would need purchase price to calculate ROI - for now sort by discount rate
                    return b.creditScoreAtMinting - a.creditScoreAtMinting;
                case 'risk-asc':
                    return b.creditScoreAtMinting - a.creditScoreAtMinting;
                case 'date-asc':
                    return a.repaymentDate - b.repaymentDate;
                case 'value-desc':
                    return Number(b.faceValue - a.faceValue);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [marketplaceInvoices, filters]);

    // Calculate marketplace stats
    const marketplaceStats = useMemo(() => {
        const totalVolume = marketplaceInvoices.reduce(
            (sum, inv) => sum + inv.faceValue,
            0n
        );

        const avgCreditScore = marketplaceInvoices.length > 0
            ? marketplaceInvoices.reduce((sum, inv) => sum + inv.creditScoreAtMinting, 0) / marketplaceInvoices.length
            : 0;

        // Mock average ROI calculation
        const avgROI = 12.5;

        return {
            totalInvoices: marketplaceInvoices.length,
            totalVolume,
            avgCreditScore,
            avgROI,
        };
    }, [marketplaceInvoices]);

    // Calculate max face value for filters
    const maxFaceValue = useMemo(() => {
        if (marketplaceInvoices.length === 0) return 10000;
        const max = marketplaceInvoices.reduce(
            (max, inv) => (inv.faceValue > max ? inv.faceValue : max),
            0n
        );
        return Math.ceil(Number(formatEther(max)));
    }, [marketplaceInvoices]);

    if (!isConnected) {
        return (
            <div className="container mx-auto p-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Connect Your Wallet</CardTitle>
                        <CardDescription>
                            Connect your wallet to access the investor dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Wallet className="h-16 w-16 text-muted-foreground" />
                        <WalletConnectButton />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Role-based access control
    if (role && role !== 'investor' && role !== 'guest') {
        return (
            <div className="container mx-auto p-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            This dashboard is only accessible to investors
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Your wallet is registered as a {role}. Please use the appropriate dashboard.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Investor Dashboard</h1>
                    <p className="text-muted-foreground">
                        Browse invoices and manage your portfolio
                    </p>
                </div>
                <WalletConnectButton />
            </div>

            <Tabs defaultValue="marketplace" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                </TabsList>

                <TabsContent value="marketplace" className="space-y-6">
                    {/* Marketplace Stats */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Available Invoices
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{marketplaceStats.totalInvoices}</div>
                                <p className="text-xs text-muted-foreground">
                                    Ready for investment
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Volume
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(formatEther(marketplaceStats.totalVolume))} CTC
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Available to invest
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg. ROI
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {marketplaceStats.avgROI.toFixed(1)}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across all invoices
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg. Credit Score
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {marketplaceStats.avgCreditScore.toFixed(0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Platform average
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <MarketplaceFilters
                        onFiltersChange={setFilters}
                        maxFaceValue={maxFaceValue}
                    />

                    {/* Marketplace Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">Available Invoices</h2>
                            <p className="text-sm text-muted-foreground">
                                Showing {filteredInvoices.length} of {marketplaceStats.totalInvoices} invoices
                            </p>
                        </div>
                        <MarketplaceGrid
                            invoices={filteredInvoices}
                            isLoading={marketplaceLoading}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="portfolio" className="space-y-6">
                    {/* Portfolio Summary */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <PortfolioSummary address={address} />
                        </div>
                        <div>
                            <EarningsChart address={address} />
                        </div>
                    </div>

                    {/* Portfolio Table */}
                    <PortfolioTable
                        invoices={investments}
                        isLoading={investmentsLoading}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

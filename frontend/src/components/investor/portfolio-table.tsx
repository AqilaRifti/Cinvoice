'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { InvoiceState } from '@/lib/contracts';
import { InvoiceStateBadge } from '@/components/badges';
import { EmptyState } from '@/components/shared/empty-state';
import { formatEther } from 'viem';
import { TrendingUp, TrendingDown, ArrowUpDown, Briefcase } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface PortfolioInvoice {
    tokenId: number;
    faceValue: bigint;
    purchasePrice: bigint;
    repaymentDate: number;
    state: InvoiceState;
    smb: `0x${string}`;
}

interface PortfolioTableProps {
    invoices: PortfolioInvoice[];
    isLoading: boolean;
}

type SortField = 'tokenId' | 'invested' | 'faceValue' | 'roi' | 'daysRemaining';
type SortDirection = 'asc' | 'desc';

export function PortfolioTable({ invoices, isLoading }: PortfolioTableProps) {
    const [sortField, setSortField] = useState<SortField>('tokenId');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const calculateROI = (faceValue: bigint, purchasePrice: bigint) => {
        const profit = Number(faceValue - purchasePrice);
        const roi = (profit / Number(purchasePrice)) * 100;
        return roi;
    };

    const getDaysRemaining = (timestamp: number) => {
        const now = Math.floor(Date.now() / 1000);
        const diff = timestamp - now;
        const days = Math.floor(diff / 86400);
        return days;
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedInvoices = [...invoices].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
            case 'tokenId':
                comparison = a.tokenId - b.tokenId;
                break;
            case 'invested':
                comparison = Number(a.purchasePrice - b.purchasePrice);
                break;
            case 'faceValue':
                comparison = Number(a.faceValue - b.faceValue);
                break;
            case 'roi':
                comparison = calculateROI(a.purchasePrice, a.faceValue) - calculateROI(b.purchasePrice, b.faceValue);
                break;
            case 'daysRemaining':
                comparison = getDaysRemaining(a.repaymentDate) - getDaysRemaining(b.repaymentDate);
                break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const totalInvested = invoices.reduce((sum, inv) => sum + inv.purchasePrice, 0n);
    const totalValue = invoices.reduce((sum, inv) => sum + inv.faceValue, 0n);
    const totalProfit = totalValue - totalInvested;
    const overallROI = totalInvested > 0n ? (Number(totalProfit) / Number(totalInvested)) * 100 : 0;

    // Calculate comparison to previous period (mock for now)
    const previousROI = overallROI * 0.9; // Mock: 10% improvement
    const roiChange = overallROI - previousROI;

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Portfolio</CardTitle>
                    <CardDescription>Your active investments</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (invoices.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Portfolio</CardTitle>
                    <CardDescription>Your active investments</CardDescription>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={Briefcase}
                        title="No investments yet"
                        description="Browse the marketplace to start investing in invoices"
                        action={
                            <Button>Browse Marketplace</Button>
                        }
                    />
                </CardContent>
            </Card>
        );
    }

    const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 -ml-3"
            onClick={() => handleSort(field)}
        >
            {children}
            <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Your Portfolio</CardTitle>
                        <CardDescription>
                            {invoices.length} investment{invoices.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Total Invested</p>
                        <p className="text-2xl font-bold">{formatCurrency(formatEther(totalInvested))} CTC</p>
                        <div className="flex items-center justify-end gap-2">
                            <p className="text-sm text-green-600 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +{formatCurrency(formatEther(totalProfit))} CTC expected
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs">
                            <span className="text-muted-foreground">ROI:</span>
                            <span className="font-bold text-green-600">{overallROI.toFixed(2)}%</span>
                            {roiChange !== 0 && (
                                <span className={`flex items-center ${roiChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {roiChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {Math.abs(roiChange).toFixed(2)}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <SortButton field="tokenId">Invoice</SortButton>
                                </TableHead>
                                <TableHead>
                                    <SortButton field="invested">Invested</SortButton>
                                </TableHead>
                                <TableHead>
                                    <SortButton field="faceValue">Face Value</SortButton>
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <SortButton field="daysRemaining">Days Until Repayment</SortButton>
                                </TableHead>
                                <TableHead className="text-right">
                                    <SortButton field="roi">Expected Return</SortButton>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedInvoices.map((invoice) => {
                                const days = getDaysRemaining(invoice.repaymentDate);
                                const roi = calculateROI(invoice.purchasePrice, invoice.faceValue);
                                const expectedReturn = invoice.faceValue - invoice.purchasePrice;

                                return (
                                    <TableRow key={invoice.tokenId}>
                                        <TableCell className="font-mono">#{invoice.tokenId}</TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(formatEther(invoice.purchasePrice))} CTC
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {formatCurrency(formatEther(invoice.faceValue))} CTC
                                        </TableCell>
                                        <TableCell>
                                            <InvoiceStateBadge state={invoice.state} />
                                        </TableCell>
                                        <TableCell>
                                            {days < 0 ? (
                                                <span className="text-red-600 font-medium">Overdue</span>
                                            ) : days === 0 ? (
                                                <span className="text-yellow-600 font-medium">Today</span>
                                            ) : (
                                                <span>{days} days</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="space-y-1">
                                                <p className="font-bold text-green-600">
                                                    +{formatCurrency(formatEther(expectedReturn))} CTC
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {roi.toFixed(2)}% ROI
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

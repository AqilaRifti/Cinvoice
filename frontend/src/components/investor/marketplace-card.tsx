'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditScoreBadge } from '@/components/badges';
import { TrendingUp, Calendar, User, DollarSign } from 'lucide-react';
import { formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';

interface MarketplaceCardProps {
    tokenId: number;
    faceValue: bigint;
    repaymentDate: number;
    smb: `0x${string}`;
    creditScore: number;
    discountRate: number;
    onInvest: () => void;
}

export function MarketplaceCard({
    tokenId,
    faceValue,
    repaymentDate,
    smb,
    creditScore,
    discountRate,
    onInvest,
}: MarketplaceCardProps) {
    const purchasePrice = (faceValue * BigInt(1000 - discountRate)) / 1000n;
    const roi = ((Number(faceValue - purchasePrice) / Number(purchasePrice)) * 100).toFixed(2);
    const daysUntilRepayment = Math.floor((repaymentDate - Date.now() / 1000) / 86400);

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">Invoice #{tokenId}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            {smb.slice(0, 6)}...{smb.slice(-4)}
                        </CardDescription>
                    </div>
                    <CreditScoreBadge score={creditScore} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Face Value</p>
                        <p className="text-xl font-bold">{formatEther(faceValue)} CTC</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Purchase Price</p>
                        <p className="text-xl font-bold text-green-600">
                            {formatEther(purchasePrice)} CTC
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <div>
                            <p className="text-xs text-muted-foreground">Expected ROI</p>
                            <p className="font-bold text-green-600">{roi}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div>
                            <p className="text-xs text-muted-foreground">Repayment</p>
                            <p className="font-bold">{daysUntilRepayment}d</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Discount Rate</span>
                        <span className="font-medium">{(discountRate / 10).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Profit</span>
                        <span className="font-bold text-green-600">
                            {formatEther(faceValue - purchasePrice)} CTC
                        </span>
                    </div>
                </div>

                <Button onClick={onInvest} className="w-full" size="lg">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Invest {formatEther(purchasePrice)} CTC
                </Button>
            </CardContent>
        </Card>
    );
}

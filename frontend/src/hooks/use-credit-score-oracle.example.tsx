/**
 * Example usage of CreditScoreOracle hooks
 * 
 * This file demonstrates how to use the useCreditScore, useCreditProfile,
 * and useDiscountRate hooks in various scenarios.
 */

import { useCreditScore, useCreditProfile, useDiscountRate } from './use-credit-score-oracle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// Example 1: Simple Credit Score Display
// ============================================================================

export function SimpleCreditScoreDisplay() {
    const { score, isLoading } = useCreditScore();

    if (isLoading) {
        return <Skeleton className="h-8 w-24" />;
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{score}</span>
            <span className="text-muted-foreground">/ 850</span>
        </div>
    );
}

// ============================================================================
// Example 2: Credit Score Card with Visual Indicator
// ============================================================================

export function CreditScoreCard() {
    const { score, isLoading } = useCreditScore();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        );
    }

    // Calculate score percentage (300-850 range)
    const percentage = ((score - 300) / 550) * 100;

    // Determine score category and color
    const getScoreCategory = (score: number) => {
        if (score >= 750) return { label: 'Excellent', color: 'bg-green-500' };
        if (score >= 650) return { label: 'Good', color: 'bg-blue-500' };
        if (score >= 550) return { label: 'Fair', color: 'bg-yellow-500' };
        return { label: 'Poor', color: 'bg-red-500' };
    };

    const category = getScoreCategory(score);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Credit Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold">{score}</span>
                    <Badge className={category.color}>{category.label}</Badge>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                    Score range: 300 - 850
                </p>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// Example 3: Detailed Credit Profile
// ============================================================================

export function CreditProfileCard() {
    const { profile, isLoading } = useCreditProfile();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!profile) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Credit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No credit history yet</p>
                </CardContent>
            </Card>
        );
    }

    const repaymentRate = profile.totalInvoices > 0
        ? (profile.successfulRepayments / profile.totalInvoices) * 100
        : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Credit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Credit Score</p>
                        <p className="text-2xl font-bold">{profile.score}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Invoices</p>
                        <p className="text-2xl font-bold">{profile.totalInvoices}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Successful Repayments</p>
                        <p className="text-2xl font-bold text-green-600">
                            {profile.successfulRepayments}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Defaults</p>
                        <p className="text-2xl font-bold text-red-600">
                            {profile.defaults}
                        </p>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground mb-2">
                        Repayment Rate: {repaymentRate.toFixed(1)}%
                    </p>
                    <Progress value={repaymentRate} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(profile.lastUpdated * 1000).toLocaleDateString()}
                </p>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// Example 4: Discount Rate Display
// ============================================================================

export function DiscountRateDisplay() {
    const { discountRate, isLoading } = useDiscountRate();

    if (isLoading) {
        return <Skeleton className="h-6 w-16" />;
    }

    const percentage = discountRate / 100; // Convert basis points to percentage

    return (
        <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{percentage}%</span>
            <span className="text-sm text-muted-foreground">discount rate</span>
        </div>
    );
}

// ============================================================================
// Example 5: Combined Credit Info Dashboard
// ============================================================================

export function CreditDashboard() {
    const { score, isLoading: scoreLoading } = useCreditScore();
    const { profile, isLoading: profileLoading } = useCreditProfile();
    const { discountRate, isLoading: rateLoading } = useDiscountRate();

    const isLoading = scoreLoading || profileLoading || rateLoading;

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Credit Score</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{score}</p>
                    <p className="text-xs text-muted-foreground">out of 850</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Discount Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{discountRate / 100}%</p>
                    <p className="text-xs text-muted-foreground">on invoice purchases</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Repayment History</CardTitle>
                </CardHeader>
                <CardContent>
                    {profile ? (
                        <>
                            <p className="text-3xl font-bold">
                                {profile.successfulRepayments}/{profile.totalInvoices}
                            </p>
                            <p className="text-xs text-muted-foreground">successful repayments</p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">No history yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================================================
// Example 6: Credit Score for Another User
// ============================================================================

export function UserCreditScoreBadge({ address }: { address: `0x${string}` }) {
    const { score, isLoading } = useCreditScore(address);

    if (isLoading) {
        return <Skeleton className="h-6 w-20" />;
    }

    const getScoreColor = (score: number) => {
        if (score >= 750) return 'bg-green-500';
        if (score >= 650) return 'bg-blue-500';
        if (score >= 550) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Badge className={getScoreColor(score)}>
            Score: {score}
        </Badge>
    );
}

// ============================================================================
// Example 7: Invoice Purchase Price Calculator with Discount
// ============================================================================

export function InvoicePriceCalculator({
    faceValue,
    smbAddress,
}: {
    faceValue: bigint;
    smbAddress: `0x${string}`;
}) {
    const { discountRate, isLoading } = useDiscountRate(smbAddress);

    if (isLoading) {
        return <Skeleton className="h-20 w-full" />;
    }

    // Calculate purchase price: faceValue * (1 - discountRate/10000)
    const purchasePrice = (faceValue * BigInt(10000 - discountRate)) / BigInt(10000);
    const discount = faceValue - purchasePrice;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Purchase Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Face Value:</span>
                    <span className="font-medium">{faceValue.toString()} CTC</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Discount Rate:</span>
                    <span className="font-medium">{discountRate / 100}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Discount Amount:</span>
                    <span className="font-medium text-green-600">-{discount.toString()} CTC</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Purchase Price:</span>
                    <span className="text-lg font-bold">{purchasePrice.toString()} CTC</span>
                </div>
            </CardContent>
        </Card>
    );
}

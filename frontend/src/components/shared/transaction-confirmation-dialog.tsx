'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Fuel, AlertTriangle, Info } from 'lucide-react';
import { formatEther } from 'viem';
import { useAccount, useEstimateGas, useGasPrice } from 'wagmi';

export interface TransactionConfirmationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    isPending?: boolean;
    isConfirming?: boolean;
    error?: Error | null;

    // Transaction details
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;

    // Display information
    transactionSummary: React.ReactNode;
    warningMessage?: string;

    // Optional ETH price for USD conversion
    ethPriceUSD?: number;
}

export function TransactionConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    isPending = false,
    isConfirming = false,
    error,
    to,
    data,
    value = 0n,
    transactionSummary,
    warningMessage,
    ethPriceUSD,
}: TransactionConfirmationProps) {
    const { address } = useAccount();
    const [showDetails, setShowDetails] = useState(false);

    // Estimate gas for the transaction
    const { data: gasEstimate, isLoading: isEstimatingGas, error: gasError } = useEstimateGas({
        to,
        data,
        value,
        account: address,
        query: {
            enabled: open && !!address,
        },
    });

    // Log gas estimation errors for debugging
    useEffect(() => {
        if (gasError) {
            console.error('Gas estimation error:', gasError);
        }
    }, [gasError]);

    // Get current gas price
    const { data: gasPrice } = useGasPrice({
        query: {
            enabled: open,
        },
    });

    // Calculate costs
    const estimatedGasCost = gasEstimate && gasPrice ? gasEstimate * gasPrice : 0n;
    const totalCost = value + estimatedGasCost;

    // USD conversions
    const gasCostUSD = ethPriceUSD ? Number(formatEther(estimatedGasCost)) * ethPriceUSD : null;
    const valueCostUSD = ethPriceUSD ? Number(formatEther(value)) * ethPriceUSD : null;
    const totalCostUSD = ethPriceUSD ? Number(formatEther(totalCost)) * ethPriceUSD : null;

    // Reset details view when dialog closes
    useEffect(() => {
        if (!open) {
            setShowDetails(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Transaction Summary */}
                    <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                        <h4 className="text-sm font-semibold mb-2">Transaction Summary</h4>
                        {transactionSummary}
                    </div>

                    {/* Gas Cost Estimation */}
                    <div className="rounded-lg border p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Fuel className="h-4 w-4 text-blue-600" />
                                <h4 className="text-sm font-semibold">Estimated Gas Cost</h4>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDetails(!showDetails)}
                                className="h-auto p-0 text-xs"
                            >
                                {showDetails ? 'Hide' : 'Show'} details
                            </Button>
                        </div>

                        {isEstimatingGas ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ) : gasEstimate ? (
                            <div className="space-y-2">
                                {showDetails && (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Estimated Gas Units</span>
                                            <span className="font-medium">{gasEstimate.toString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Gas Price</span>
                                            <span className="font-medium">
                                                {gasPrice ? formatEther(gasPrice) : '...'} CTC
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between items-center text-sm pt-2 border-t">
                                    <span className="text-muted-foreground">Gas Cost</span>
                                    <div className="text-right">
                                        <span className="font-medium">~{formatEther(estimatedGasCost)} CTC</span>
                                        {gasCostUSD !== null && (
                                            <p className="text-xs text-muted-foreground">
                                                ≈ ${gasCostUSD.toFixed(2)} USD
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">
                                    Unable to estimate gas. Transaction will use network defaults.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Total Cost */}
                    <div className="rounded-lg border-2 border-primary/20 p-4 bg-primary/5">
                        <div className="space-y-2">
                            {value > 0n && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Transaction Value</span>
                                    <div className="text-right">
                                        <span className="font-medium">{formatEther(value)} CTC</span>
                                        {valueCostUSD !== null && (
                                            <p className="text-xs text-muted-foreground">
                                                ≈ ${valueCostUSD.toFixed(2)} USD
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="font-semibold">Total Cost</span>
                                <div className="text-right">
                                    <span className="font-bold text-lg">
                                        {isEstimatingGas ? '...' : formatEther(totalCost)} CTC
                                    </span>
                                    {totalCostUSD !== null && !isEstimatingGas && (
                                        <p className="text-sm text-muted-foreground">
                                            ≈ ${totalCostUSD.toFixed(2)} USD
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    {warningMessage && (
                        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                                {warningMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription className="text-sm">
                                {error.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending || isConfirming}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isPending || isConfirming}
                        className="w-full sm:w-auto"
                    >
                        {isPending || isConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isPending ? 'Confirm in wallet...' : 'Processing...'}
                            </>
                        ) : (
                            'Confirm Transaction'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

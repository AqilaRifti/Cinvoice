'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, FINANCING_POOL_ABI } from '@/lib/contracts';
import { formatEther, encodeFunctionData } from 'viem';
import { toast } from 'sonner';
import { parseContractError, isUserRejection } from '@/lib/errors';
import { TransactionConfirmationDialog } from '@/components/shared/transaction-confirmation-dialog';
import { TransactionDialog, TransactionStatus } from '@/components/shared/transaction-dialog';

interface RepayInvoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tokenId: number;
    faceValue: bigint;
    platformFeePercent?: number;
}

export function RepayInvoiceDialog({
    open,
    onOpenChange,
    tokenId,
    faceValue,
    platformFeePercent = 200, // 2% default
}: RepayInvoiceDialogProps) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [txDialogOpen, setTxDialogOpen] = useState(false);
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');

    const platformFee = (faceValue * BigInt(platformFeePercent)) / 10000n;
    const investorAmount = faceValue - platformFee;

    const handleContinue = () => {
        setShowConfirmation(true);
    };

    const handleConfirm = async () => {
        try {
            setTxStatus('pending');
            setTxDialogOpen(true);
            setShowConfirmation(false);

            writeContract({
                address: CONTRACT_ADDRESSES.FinancingPool,
                abi: FINANCING_POOL_ABI,
                functionName: 'repayInvoice',
                args: [BigInt(tokenId)],
                value: faceValue,
            });
        } catch (error: any) {
            // Don't show toast for user rejections
            if (!isUserRejection(error)) {
                const message = parseContractError(error);
                toast.error(message);
            }
        }
    };

    // Handle transaction status changes
    useEffect(() => {
        if (isSuccess && txStatus !== 'success') {
            setTxStatus('success');
            toast.success('Invoice repaid successfully! Your credit score has increased.');
            // Close dialogs after success
            setTimeout(() => {
                setTxDialogOpen(false);
                onOpenChange(false);
            }, 3000);
        }

        if (error && txStatus !== 'error') {
            setTxStatus('error');
        }
    }, [isSuccess, error, txStatus, onOpenChange]);

    // Reset confirmation when dialog closes
    useEffect(() => {
        if (!open) {
            setShowConfirmation(false);
            setTxStatus('idle');
        }
    }, [open]);

    const handleRetry = () => {
        setTxDialogOpen(false);
        setTxStatus('idle');
        setShowConfirmation(true);
    };

    if (isSuccess) {
        toast.success('Invoice repaid successfully! Your credit score has increased.');
        setShowConfirmation(false);
        onOpenChange(false);
    }

    if (isSuccess) {
        toast.success('Invoice repaid successfully! Your credit score has increased.');
        setShowConfirmation(false);
        onOpenChange(false);
    }

    // Transaction summary for confirmation dialog
    const transactionSummary = (
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice #</span>
                <span className="font-medium">{tokenId}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Face Value</span>
                <span className="font-medium">{formatEther(faceValue)} CTC</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee ({platformFeePercent / 100}%)</span>
                <span className="font-medium text-red-600">-{formatEther(platformFee)} CTC</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Investor Receives</span>
                <span className="font-medium text-green-600">{formatEther(investorAmount)} CTC</span>
            </div>
        </div>
    );

    return (
        <>
            <Dialog open={open && !showConfirmation} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Repay Invoice #{tokenId}</DialogTitle>
                        <DialogDescription>
                            Repay your invoice to complete the financing cycle
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Amount Breakdown */}
                        <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Face Value</span>
                                <span className="font-bold text-lg">{formatEther(faceValue)} CTC</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Platform Fee ({platformFeePercent / 100}%)</span>
                                <span className="font-medium text-red-600">-{formatEther(platformFee)} CTC</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-sm text-muted-foreground">Investor Receives</span>
                                <span className="font-bold text-lg text-green-600">{formatEther(investorAmount)} CTC</span>
                            </div>
                        </div>

                        {/* Credit Score Boost Info */}
                        <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/20">
                            <div className="flex gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Credit Score Boost</p>
                                    <p className="text-xs text-muted-foreground">
                                        Repaying on time will increase your credit score by +50 points,
                                        reducing your discount rate on future invoices.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-950/20">
                                <div className="flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-red-600">Transaction Failed</p>
                                        <p className="text-xs text-muted-foreground">
                                            {parseContractError(error)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Button
                                onClick={handleContinue}
                                disabled={isPending || isConfirming}
                                className="w-full"
                                size="lg"
                            >
                                Continue to Confirmation
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                Review gas costs before confirming
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <TransactionConfirmationDialog
                open={showConfirmation}
                onOpenChange={setShowConfirmation}
                onConfirm={handleConfirm}
                title="Confirm Repayment"
                description="Review the transaction details and estimated gas costs"
                isPending={isPending}
                isConfirming={isConfirming}
                error={error}
                to={CONTRACT_ADDRESSES.FinancingPool}
                data={encodeFunctionData({
                    abi: FINANCING_POOL_ABI,
                    functionName: 'repayInvoice',
                    args: [BigInt(tokenId)],
                })}
                value={faceValue}
                transactionSummary={transactionSummary}
                warningMessage="Make sure you have enough CTC in your wallet to cover the repayment amount and gas fees."
            />

            {/* Transaction Status Dialog */}
            <TransactionDialog
                open={txDialogOpen}
                onOpenChange={setTxDialogOpen}
                status={txStatus}
                txHash={hash}
                receipt={receipt ? {
                    transactionHash: receipt.transactionHash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed,
                    effectiveGasPrice: receipt.effectiveGasPrice,
                    status: receipt.status === 'success' ? 'success' : 'reverted',
                } : undefined}
                error={error}
                onRetry={handleRetry}
                title="Repaying Invoice"
                pendingMessage="Processing your repayment..."
                successMessage="Invoice repaid successfully! Your credit score has increased."
            />
        </>
    );
}

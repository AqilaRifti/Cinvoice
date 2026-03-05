'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp, Calendar, Shield, AlertTriangle } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, FINANCING_POOL_ABI } from '@/lib/contracts';
import { formatEther, encodeFunctionData } from 'viem';
import { toast } from 'sonner';
import { parseContractError, isUserRejection } from '@/lib/errors';
import { Invoice } from '@/types';
import { calculateROI } from '@/lib/calculations';
import { TransactionConfirmationDialog } from '@/components/shared/transaction-confirmation-dialog';
import { TransactionDialog, TransactionStatus } from '@/components/shared/transaction-dialog';

interface InvestDialogProps {
    invoice: Invoice;
    purchasePrice: bigint;
    open: boolean;
    onClose: () => void;
}

export function InvestDialog({ invoice, purchasePrice, open, onClose }: InvestDialogProps) {
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [txDialogOpen, setTxDialogOpen] = useState(false);
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

    const repaymentDate = new Date(invoice.repaymentDate * 1000);
    const daysUntilRepayment = Math.floor((repaymentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const expectedProfit = invoice.faceValue - purchasePrice;
    const roi = calculateROI(purchasePrice, invoice.faceValue);

    const handleContinue = () => {
        if (!acceptTerms) {
            toast.error('Please accept the terms and conditions');
            return;
        }
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
                functionName: 'purchaseInvoice',
                args: [BigInt(invoice.tokenId)],
                value: purchasePrice,
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
            toast.success('Invoice purchased successfully!');
            // Close dialogs after success
            setTimeout(() => {
                setTxDialogOpen(false);
                onClose();
            }, 3000);
        }

        if (error && txStatus !== 'error') {
            setTxStatus('error');
        }
    }, [isSuccess, error, txStatus, onClose]);

    const handleRetry = () => {
        setTxDialogOpen(false);
        setTxStatus('idle');
        setShowConfirmation(true);
    };

    const getRiskLevel = (score: number) => {
        if (score >= 700) return { label: 'Low Risk', color: 'text-green-600' };
        if (score >= 600) return { label: 'Medium Risk', color: 'text-yellow-600' };
        if (score >= 500) return { label: 'Moderate Risk', color: 'text-orange-600' };
        return { label: 'High Risk', color: 'text-red-600' };
    };

    const risk = getRiskLevel(invoice.creditScoreAtMinting);

    // Transaction summary for confirmation dialog
    const transactionSummary = (
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice #</span>
                <span className="font-medium">{invoice.tokenId}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Purchase Price</span>
                <span className="font-medium">{formatEther(purchasePrice)} CTC</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Face Value</span>
                <span className="font-medium">{formatEther(invoice.faceValue)} CTC</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Profit</span>
                <span className="font-medium text-green-600">+{formatEther(expectedProfit)} CTC</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">ROI</span>
                <span className="font-medium text-green-600">{roi.toFixed(2)}%</span>
            </div>
        </div>
    );

    return (
        <>
            <Dialog open={open && !showConfirmation} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Invest in Invoice #{invoice.tokenId}</DialogTitle>
                        <DialogDescription>
                            Review the investment details and accept terms before confirming
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Purchase Price</span>
                                <span className="font-bold text-xl">{formatEther(purchasePrice)} CTC</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Face Value</span>
                                <span className="font-medium">{formatEther(invoice.faceValue)} CTC</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-sm text-muted-foreground">Expected Profit</span>
                                <span className="font-bold text-lg text-green-600">
                                    +{formatEther(expectedProfit)} CTC
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border p-3 space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-xs">ROI</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">{roi.toFixed(2)}%</p>
                            </div>
                            <div className="rounded-lg border p-3 space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">Repayment</span>
                                </div>
                                <p className="text-2xl font-bold">{daysUntilRepayment} days</p>
                            </div>
                        </div>

                        <div className="rounded-lg border p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                <h4 className="font-medium">Risk Assessment</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">SMB Credit Score</p>
                                    <p className="font-bold text-lg">{invoice.creditScoreAtMinting}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Risk Level</p>
                                    <p className={`font-bold text-lg ${risk.color}`}>{risk.label}</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground">
                                    SMB Address: {invoice.smb.slice(0, 10)}...{invoice.smb.slice(-8)}
                                </p>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-medium text-sm">Investment Terms</h4>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                        <li>• This is a non-refundable investment</li>
                                        <li>• Returns depend on SMB repayment</li>
                                        <li>• Default risk exists based on credit score</li>
                                        <li>• No guarantee of profit</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-2 border-t">
                                <Checkbox
                                    id="accept-terms"
                                    checked={acceptTerms}
                                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                                />
                                <Label
                                    htmlFor="accept-terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    I understand and accept the investment terms
                                </Label>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleContinue}
                                disabled={!acceptTerms}
                                className="flex-1"
                                size="lg"
                            >
                                Continue to Confirmation
                            </Button>
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <TransactionConfirmationDialog
                open={showConfirmation}
                onOpenChange={setShowConfirmation}
                onConfirm={handleConfirm}
                title="Confirm Investment"
                description="Review the transaction details and estimated gas costs"
                isPending={isPending}
                isConfirming={isConfirming}
                error={error}
                to={CONTRACT_ADDRESSES.FinancingPool}
                data={encodeFunctionData({
                    abi: FINANCING_POOL_ABI,
                    functionName: 'purchaseInvoice',
                    args: [BigInt(invoice.tokenId)],
                })}
                value={purchasePrice}
                transactionSummary={transactionSummary}
                warningMessage="This investment is non-refundable. Returns depend on SMB repayment."
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
                title="Purchasing Invoice"
                pendingMessage="Processing your investment..."
                successMessage="Invoice purchased successfully!"
            />
        </>
    );
}

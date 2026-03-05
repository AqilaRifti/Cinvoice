'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InvoiceStateBadge } from '@/components/badges/invoice-state-badge';
import { CreditScoreBadge } from '@/components/badges/credit-score-badge';
import { InvestDialog } from './invest-dialog';
import { Invoice, InvoiceState } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { calculateROI, calculatePurchasePrice } from '@/lib/calculations';
import { formatEther, parseEther } from 'viem';
import { usePurchasePrice, usePlatformFee } from '@/hooks/use-financing-pool';
import { Calendar, TrendingUp, FileText, ExternalLink, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface InvoiceDetailDialogProps {
    invoice: Invoice;
    open: boolean;
    onClose: () => void;
}

export function InvoiceDetailDialog({ invoice, open, onClose }: InvoiceDetailDialogProps) {
    const [investmentAmount, setInvestmentAmount] = useState('');
    const [showInvestDialog, setShowInvestDialog] = useState(false);

    const { purchasePrice, isLoading: loadingPrice } = usePurchasePrice(invoice.tokenId);
    const { platformFee } = usePlatformFee();

    const repaymentDate = new Date(invoice.repaymentDate * 1000);
    const daysUntilRepayment = Math.ceil((repaymentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // Calculate ROI based on investment amount or purchase price
    const amount = investmentAmount ? parseEther(investmentAmount) : purchasePrice;
    const roi = amount ? calculateROI(amount, invoice.faceValue) : 0;
    const expectedReturn = amount ? invoice.faceValue - amount : 0n;

    // Calculate transaction costs
    const transactionCost = platformFee && amount
        ? (amount * BigInt(platformFee)) / 10000n
        : 0n;

    const handleInvest = () => {
        setShowInvestDialog(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle>Invoice #{invoice.tokenId}</DialogTitle>
                                <DialogDescription>
                                    Detailed information and investment calculator
                                </DialogDescription>
                            </div>
                            <InvoiceStateBadge state={invoice.state} />
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Face Value</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(formatEther(invoice.faceValue))} CTC
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Purchase Price</p>
                                {loadingPrice ? (
                                    <p className="text-2xl font-bold text-muted-foreground">Loading...</p>
                                ) : purchasePrice ? (
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(formatEther(purchasePrice))} CTC
                                    </p>
                                ) : (
                                    <p className="text-2xl font-bold text-muted-foreground">N/A</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Invoice Details */}
                        <div className="space-y-3">
                            <h3 className="font-semibold">Invoice Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Repayment Date</p>
                                        <p className="text-sm font-medium">{formatDate(repaymentDate)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {daysUntilRepayment} days from now
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Credit Score</p>
                                        <CreditScoreBadge score={invoice.creditScoreAtMinting} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">IPFS Metadata</p>
                                    <a
                                        href={`https://ipfs.io/ipfs/${invoice.metadataURI}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                    >
                                        View on IPFS
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* ROI Calculator */}
                        <div className="space-y-3">
                            <h3 className="font-semibold">Investment Calculator</h3>
                            <div className="space-y-2">
                                <Label htmlFor="investment-amount">Investment Amount (CTC)</Label>
                                <Input
                                    id="investment-amount"
                                    type="number"
                                    step="0.01"
                                    placeholder={purchasePrice ? formatEther(purchasePrice) : '0.00'}
                                    value={investmentAmount}
                                    onChange={(e) => setInvestmentAmount(e.target.value)}
                                />
                            </div>

                            {amount && amount > 0n && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3 p-4 bg-muted rounded-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Expected Return</span>
                                        <span className="text-sm font-bold">
                                            {formatCurrency(formatEther(expectedReturn))} CTC
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Expected ROI</span>
                                        <span className={`text-sm font-bold ${roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {roi.toFixed(2)}%
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            Transaction Cost
                                        </span>
                                        <span className="text-sm font-medium">
                                            {formatCurrency(formatEther(transactionCost))} CTC
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="text-sm font-semibold">Total Cost</span>
                                        <span className="text-sm font-bold">
                                            {formatCurrency(formatEther(amount + transactionCost))} CTC
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                className="flex-1"
                                onClick={handleInvest}
                                disabled={invoice.state !== InvoiceState.Pending || !purchasePrice}
                            >
                                Invest Now
                            </Button>
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Invest Dialog */}
            {showInvestDialog && purchasePrice && (
                <InvestDialog
                    invoice={invoice}
                    purchasePrice={purchasePrice}
                    open={showInvestDialog}
                    onClose={() => setShowInvestDialog(false)}
                />
            )}
        </>
    );
}

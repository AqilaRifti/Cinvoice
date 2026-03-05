'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvoiceStateBadge } from '@/components/badges/invoice-state-badge';
import { CreditScoreBadge } from '@/components/badges/credit-score-badge';
import { formatCurrency, formatRelativeTime } from '@/lib/format';
import { calculateROI } from '@/lib/calculations';
import { Invoice } from '@/types';
import { formatEther } from 'viem';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';

interface InvoiceCardProps {
    invoice: Invoice;
    purchasePrice?: bigint;
    onClick?: () => void;
}

export function InvoiceCard({ invoice, purchasePrice, onClick }: InvoiceCardProps) {
    const repaymentDate = new Date(invoice.repaymentDate * 1000);
    const roi = purchasePrice ? calculateROI(purchasePrice, invoice.faceValue) : 0;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
                onClick={onClick}
            >
                {/* State badge in top-right corner */}
                <div className="absolute top-3 right-3 z-10">
                    <InvoiceStateBadge state={invoice.state} />
                </div>

                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Invoice #{invoice.tokenId}</p>
                            <h3 className="text-2xl font-bold mt-1">
                                {formatCurrency(formatEther(invoice.faceValue))} CTC
                            </h3>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Credit Score */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Credit Score</span>
                        <CreditScoreBadge score={invoice.creditScoreAtMinting} />
                    </div>

                    {/* Discount Rate */}
                    {purchasePrice && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Discount Rate</span>
                            <Badge variant="secondary" className="font-semibold">
                                {((1 - Number(formatEther(purchasePrice)) / Number(formatEther(invoice.faceValue))) * 100).toFixed(2)}%
                            </Badge>
                        </div>
                    )}

                    {/* Repayment Date */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Repayment
                        </span>
                        <span className="text-sm font-medium">
                            {formatRelativeTime(repaymentDate)}
                        </span>
                    </div>

                    {/* Expected ROI */}
                    {purchasePrice && (
                        <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Expected ROI
                            </span>
                            <span className={`text-sm font-bold ${roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {roi.toFixed(2)}%
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

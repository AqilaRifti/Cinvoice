'use client';

import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { getBlockExplorerUrl } from '@/lib/wagmi';
import { formatEther } from 'viem';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

export interface TransactionReceiptData {
    transactionHash: string;
    blockNumber: bigint;
    gasUsed: bigint;
    effectiveGasPrice: bigint;
    timestamp?: number;
    status: 'success' | 'reverted';
}

interface TransactionReceiptProps {
    receipt: TransactionReceiptData;
    title?: string;
    description?: string;
}

export function TransactionReceipt({
    receipt,
    title = 'Transaction Receipt',
    description = 'Your transaction has been confirmed on the blockchain',
}: TransactionReceiptProps) {
    const [copiedHash, setCopiedHash] = useState(false);

    const handleCopyHash = async () => {
        try {
            await navigator.clipboard.writeText(receipt.transactionHash);
            setCopiedHash(true);
            toast.success('Transaction hash copied to clipboard');
            setTimeout(() => setCopiedHash(false), 2000);
        } catch (error) {
            toast.error('Failed to copy transaction hash');
        }
    };

    const totalGasCost = receipt.gasUsed * receipt.effectiveGasPrice;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg">{title}</CardTitle>
                    </div>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Transaction Hash */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                            Transaction Hash
                        </label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded-md truncate">
                                {receipt.transactionHash}
                            </code>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopyHash}
                                className="flex-shrink-0"
                            >
                                {copiedHash ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Block Number */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">
                                Block Number
                            </label>
                            <p className="text-sm font-mono">{receipt.blockNumber.toString()}</p>
                        </div>

                        {/* Timestamp */}
                        {receipt.timestamp && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Timestamp
                                </label>
                                <p className="text-sm">
                                    {format(new Date(receipt.timestamp * 1000), 'PPp')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Gas Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">
                                Gas Used
                            </label>
                            <p className="text-sm font-mono">{receipt.gasUsed.toString()}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">
                                Total Gas Cost
                            </label>
                            <p className="text-sm font-mono">
                                {formatEther(totalGasCost)} CTC
                            </p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                            Status
                        </label>
                        <div className="flex items-center gap-2">
                            <div
                                className={`h-2 w-2 rounded-full ${receipt.status === 'success'
                                        ? 'bg-green-600'
                                        : 'bg-red-600'
                                    }`}
                            />
                            <span className="text-sm capitalize">{receipt.status}</span>
                        </div>
                    </div>

                    {/* Block Explorer Link */}
                    <Button
                        variant="outline"
                        className="w-full"
                        asChild
                    >
                        <a
                            href={getBlockExplorerUrl(receipt.transactionHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                        >
                            View on Block Explorer
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

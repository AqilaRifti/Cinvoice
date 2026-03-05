'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, ExternalLink, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getBlockExplorerUrl } from '@/lib/wagmi';
import { parseContractError } from '@/lib/errors';
import { TransactionReceipt, TransactionReceiptData } from './transaction-receipt';

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

interface TransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    status: TransactionStatus;
    txHash?: string;
    receipt?: TransactionReceiptData;
    error?: Error | null;
    onRetry?: () => void;
    title?: string;
    pendingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
}

export function TransactionDialog({
    open,
    onOpenChange,
    status,
    txHash,
    receipt,
    error,
    onRetry,
    title = 'Transaction',
    pendingMessage = 'Processing your transaction...',
    successMessage = 'Transaction completed successfully!',
    errorMessage,
}: TransactionDialogProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (status === 'success') {
            setShowConfetti(true);
            // Auto-hide confetti after animation
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const getStatusIcon = () => {
        switch (status) {
            case 'pending':
                return <Loader2 className="h-12 w-12 animate-spin text-blue-600" />;
            case 'success':
                return (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </motion.div>
                );
            case 'error':
                return (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                        <XCircle className="h-12 w-12 text-red-600" />
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'pending':
                return pendingMessage;
            case 'success':
                return successMessage;
            case 'error':
                return errorMessage || (error ? parseContractError(error) : 'Transaction failed');
            default:
                return '';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'pending':
                return 'text-blue-600';
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {status === 'pending' && 'Please wait while we process your transaction'}
                        {status === 'success' && 'Your transaction has been confirmed'}
                        {status === 'error' && 'There was an issue with your transaction'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Status Icon */}
                    <div className="flex justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={status}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {getStatusIcon()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Confetti Animation */}
                    <AnimatePresence>
                        {showConfetti && status === 'success' && (
                            <motion.div
                                className="absolute inset-0 pointer-events-none overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {Array.from({ length: 50 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 rounded-full"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: '-10px',
                                            backgroundColor: [
                                                '#10b981',
                                                '#3b82f6',
                                                '#f59e0b',
                                                '#ef4444',
                                                '#8b5cf6',
                                            ][Math.floor(Math.random() * 5)],
                                        }}
                                        initial={{ y: 0, opacity: 1, rotate: 0 }}
                                        animate={{
                                            y: 500,
                                            opacity: 0,
                                            rotate: Math.random() * 360,
                                        }}
                                        transition={{
                                            duration: 2 + Math.random(),
                                            ease: 'easeOut',
                                            delay: Math.random() * 0.5,
                                        }}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Status Message */}
                    <div className="text-center">
                        <p className={`text-lg font-medium ${getStatusColor()}`}>
                            {getStatusMessage()}
                        </p>
                    </div>

                    {/* Transaction Receipt (Success State) */}
                    {status === 'success' && receipt && (
                        <TransactionReceipt receipt={receipt} />
                    )}

                    {/* Transaction Hash Link (Pending State) */}
                    {status === 'pending' && txHash && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Alert>
                                <AlertDescription className="flex items-center justify-between">
                                    <span className="text-sm font-mono truncate mr-2">
                                        {txHash.slice(0, 10)}...{txHash.slice(-8)}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="flex-shrink-0"
                                    >
                                        <a
                                            href={getBlockExplorerUrl(txHash)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1"
                                        >
                                            View on Explorer
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    {/* Error Details */}
                    {status === 'error' && error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Alert variant="destructive">
                                <AlertDescription className="text-sm">
                                    {parseContractError(error)}
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {status === 'error' && onRetry && (
                            <Button
                                onClick={onRetry}
                                variant="default"
                                className="flex-1"
                                size="lg"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Retry
                            </Button>
                        )}
                        {(status === 'success' || status === 'error') && (
                            <Button
                                onClick={() => onOpenChange(false)}
                                variant={status === 'error' && onRetry ? 'outline' : 'default'}
                                className="flex-1"
                                size="lg"
                            >
                                Close
                            </Button>
                        )}
                    </div>

                    {/* Pending State Info */}
                    {status === 'pending' && (
                        <motion.p
                            className="text-xs text-center text-muted-foreground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            This may take a few moments. Please don't close this window.
                        </motion.p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

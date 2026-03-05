'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionDialog, TransactionStatus } from './transaction-dialog';

/**
 * Example component demonstrating TransactionDialog usage
 * This shows all possible states and transitions
 */
export function TransactionDialogExample() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [status, setStatus] = useState<TransactionStatus>('idle');
    const [txHash, setTxHash] = useState<string>();
    const [error, setError] = useState<Error | null>(null);

    // Simulate a successful transaction
    const simulateSuccess = () => {
        setDialogOpen(true);
        setStatus('pending');
        setError(null);
        setTxHash(undefined);

        // Simulate pending state
        setTimeout(() => {
            const mockHash = '0x' + Array.from({ length: 64 }, () =>
                Math.floor(Math.random() * 16).toString(16)
            ).join('');
            setTxHash(mockHash);
            setStatus('success');
        }, 2000);
    };

    // Simulate a failed transaction
    const simulateError = () => {
        setDialogOpen(true);
        setStatus('pending');
        setError(null);
        setTxHash(undefined);

        // Simulate pending state
        setTimeout(() => {
            setError(new Error('Insufficient funds for transaction'));
            setStatus('error');
        }, 2000);
    };

    // Simulate a transaction with hash but error
    const simulateErrorWithHash = () => {
        setDialogOpen(true);
        setStatus('pending');
        setError(null);
        setTxHash(undefined);

        // Simulate pending state
        setTimeout(() => {
            const mockHash = '0x' + Array.from({ length: 64 }, () =>
                Math.floor(Math.random() * 16).toString(16)
            ).join('');
            setTxHash(mockHash);
            setError(new Error('Transaction reverted: InvalidFaceValue()'));
            setStatus('error');
        }, 2000);
    };

    const handleRetry = () => {
        setDialogOpen(false);
        setTimeout(() => simulateSuccess(), 500);
    };

    return (
        <div className="container max-w-4xl py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Transaction Dialog Examples</h1>
                <p className="text-muted-foreground">
                    Interactive examples showing different transaction states
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Success Flow</CardTitle>
                        <CardDescription>
                            Simulates a successful transaction with confetti animation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={simulateSuccess} className="w-full">
                            Simulate Success
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Error Flow</CardTitle>
                        <CardDescription>
                            Simulates a failed transaction with error message
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={simulateError} variant="destructive" className="w-full">
                            Simulate Error
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Error with Hash</CardTitle>
                        <CardDescription>
                            Transaction submitted but reverted on-chain
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={simulateErrorWithHash} variant="outline" className="w-full">
                            Simulate Revert
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Current State</CardTitle>
                        <CardDescription>
                            View the current dialog state
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-sm">
                            <span className="font-medium">Status:</span>{' '}
                            <span className="font-mono">{status}</span>
                        </div>
                        <div className="text-sm">
                            <span className="font-medium">Dialog Open:</span>{' '}
                            <span className="font-mono">{dialogOpen ? 'true' : 'false'}</span>
                        </div>
                        {txHash && (
                            <div className="text-sm">
                                <span className="font-medium">TX Hash:</span>{' '}
                                <span className="font-mono text-xs">
                                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Custom Messages Example</CardTitle>
                    <CardDescription>
                        Transaction dialog with custom title and messages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => {
                            setDialogOpen(true);
                            setStatus('pending');
                            setTimeout(() => {
                                const mockHash = '0x' + Array.from({ length: 64 }, () =>
                                    Math.floor(Math.random() * 16).toString(16)
                                ).join('');
                                setTxHash(mockHash);
                                setStatus('success');
                            }, 2000);
                        }}
                        className="w-full"
                    >
                        Mint Invoice (Custom Messages)
                    </Button>
                </CardContent>
            </Card>

            <TransactionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                status={status}
                txHash={txHash}
                error={error}
                onRetry={handleRetry}
                title="Transaction Example"
                pendingMessage="Processing your example transaction..."
                successMessage="Example transaction completed successfully!"
            />
        </div>
    );
}

'use client';

import { useAccount, useBalance } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatEther } from 'viem';

export function BalanceChecker() {
    const { address, isConnected, chain } = useAccount();
    const { data: balance, isLoading } = useBalance({
        address: address,
    });

    if (!isConnected) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Please connect your wallet to check balance
                </AlertDescription>
            </Alert>
        );
    }

    const hasBalance = balance && balance.value > 0n;
    const isCorrectNetwork = chain?.id === 102031;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Wallet Diagnostics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-mono text-sm">{address}</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Network</p>
                    <p className="text-sm">{chain?.name || 'Unknown'} (Chain ID: {chain?.id})</p>
                    {!isCorrectNetwork && (
                        <Alert className="mt-2" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Wrong network! Please switch to Creditcoin Testnet (Chain ID: 102031)
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    {isLoading ? (
                        <p className="text-sm">Loading...</p>
                    ) : (
                        <>
                            <p className="text-lg font-bold">
                                {balance ? formatEther(balance.value) : '0'} {balance?.symbol || 'CTC'}
                            </p>
                            {!hasBalance && (
                                <Alert className="mt-2" variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Insufficient balance! You need CTC tokens to pay for gas fees.
                                        <br />
                                        <br />
                                        <strong>How to get testnet tokens:</strong>
                                        <br />
                                        1. Visit the Creditcoin testnet faucet
                                        <br />
                                        2. Or ask in the Creditcoin Discord/Telegram for testnet tokens
                                    </AlertDescription>
                                </Alert>
                            )}
                            {hasBalance && (
                                <Alert className="mt-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        You have sufficient balance to make transactions
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

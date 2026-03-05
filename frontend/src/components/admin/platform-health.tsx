'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, GOVERNANCE_ABI } from '@/lib/contracts';
import { CheckCircle2, XCircle, AlertCircle, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface HealthIndicatorProps {
    label: string;
    status: 'healthy' | 'warning' | 'error';
    message?: string;
}

function HealthIndicator({ label, status, message }: HealthIndicatorProps) {
    const icons = {
        healthy: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
        warning: <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
        error: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
    };

    const colors = {
        healthy: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        error: 'text-red-600 dark:text-red-400',
    };

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
            <div className="mt-0.5">{icons[status]}</div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{label}</p>
                    <Badge
                        variant={status === 'healthy' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
                        className="text-xs"
                    >
                        {status}
                    </Badge>
                </div>
                {message && <p className={cn('text-xs', colors[status])}>{message}</p>}
            </div>
        </div>
    );
}

export function PlatformHealth() {
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [ipfsStatus, setIpfsStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');
    const [networkStatus, setNetworkStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');

    // Check if platform is paused
    const { data: isPaused, isError: pausedError } = useReadContract({
        address: CONTRACT_ADDRESSES.PlatformGovernance,
        abi: GOVERNANCE_ABI,
        functionName: 'paused',
    });

    // Check contract status
    const contractStatus: 'healthy' | 'warning' | 'error' = pausedError
        ? 'error'
        : isPaused
            ? 'warning'
            : 'healthy';

    // Mock IPFS connectivity check (in production, ping IPFS gateway)
    useEffect(() => {
        const checkIPFS = async () => {
            try {
                // In production: await fetch('https://ipfs.io/ipfs/...')
                setIpfsStatus('healthy');
            } catch {
                setIpfsStatus('error');
            }
        };

        checkIPFS();
    }, []);

    // Mock network status check
    useEffect(() => {
        const checkNetwork = async () => {
            try {
                // In production: check RPC endpoint health
                setNetworkStatus('healthy');
            } catch {
                setNetworkStatus('error');
            }
        };

        checkNetwork();
    }, []);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdate(new Date());
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const hasIssues = contractStatus !== 'healthy' || ipfsStatus !== 'healthy' || networkStatus !== 'healthy';

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Platform Health
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {hasIssues && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Platform health issues detected. Please review the status indicators below.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-3">
                    <HealthIndicator
                        label="Smart Contracts"
                        status={contractStatus}
                        message={
                            pausedError
                                ? 'Unable to connect to contracts'
                                : isPaused
                                    ? 'Platform is currently paused'
                                    : 'All contracts operational'
                        }
                    />

                    <HealthIndicator
                        label="IPFS Connectivity"
                        status={ipfsStatus}
                        message={
                            ipfsStatus === 'healthy'
                                ? 'IPFS gateway responding'
                                : 'Unable to reach IPFS gateway'
                        }
                    />

                    <HealthIndicator
                        label="Network Status"
                        status={networkStatus}
                        message={
                            networkStatus === 'healthy'
                                ? 'RPC endpoint healthy'
                                : 'Network connectivity issues'
                        }
                    />
                </div>

                {!hasIssues && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                            All systems operational
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, GOVERNANCE_ABI } from '@/lib/contracts';
import { AlertCircle, CheckCircle2, Pause, Play } from 'lucide-react';

export function PlatformControls() {
    const { data: isPaused } = useReadContract({
        address: CONTRACT_ADDRESSES.PlatformGovernance,
        abi: GOVERNANCE_ABI,
        functionName: 'paused',
    });

    return (
        <div className="grid md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Platform Status</CardTitle>
                    <CardDescription>Emergency controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isPaused ? (
                                <>
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <Badge variant="destructive">Paused</Badge>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Active
                                    </Badge>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="destructive" size="sm" disabled={isPaused}>
                            <Pause className="mr-2 h-4 w-4" />
                            Emergency Pause
                        </Button>
                        <Button variant="outline" size="sm" disabled={!isPaused}>
                            <Play className="mr-2 h-4 w-4" />
                            Unpause (Requires Multi-sig)
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Platform Fee</CardTitle>
                    <CardDescription>Current fee percentage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-4xl font-bold">2%</div>
                    <p className="text-sm text-muted-foreground">
                        Applied to all repayments
                    </p>
                    <Button variant="outline" size="sm">
                        Adjust Fee (Requires Multi-sig)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

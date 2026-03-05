'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { useAccount } from 'wagmi';
import { useUserRole } from '@/hooks/use-user-role';
import { Shield, Wallet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlatformMetrics } from '@/components/admin/platform-metrics';
import { PlatformHealth } from '@/components/admin/platform-health';
import { AnalyticsCharts } from '@/components/admin/analytics-charts';
import { GovernancePanel } from '@/components/admin/governance-panel';
import { DisputesPanel } from '@/components/admin/disputes-panel';
import { WhitelistManagement } from '@/components/admin/whitelist-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
    const { isConnected } = useAccount();
    const { isAdmin } = useUserRole();

    if (!isConnected) {
        return (
            <div className="container mx-auto p-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Connect Your Wallet</CardTitle>
                        <CardDescription>
                            Connect your wallet to access the admin dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Wallet className="h-16 w-16 text-muted-foreground" />
                        <WalletConnectButton />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container mx-auto p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have admin privileges. Only platform administrators can access this dashboard.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="h-8 w-8" />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Platform governance and management
                    </p>
                </div>
                <WalletConnectButton />
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="governance">Governance</TabsTrigger>
                    <TabsTrigger value="disputes">Disputes</TabsTrigger>
                    <TabsTrigger value="access">Access Control</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <PlatformMetrics />

                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <PlatformHealth />
                        </div>
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                    <CardDescription>Common administrative tasks</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Use the tabs above to access different sections of the admin dashboard.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <AnalyticsCharts />
                </TabsContent>

                <TabsContent value="governance" className="space-y-6">
                    <GovernancePanel />
                </TabsContent>

                <TabsContent value="disputes" className="space-y-6">
                    <DisputesPanel />
                </TabsContent>

                <TabsContent value="access" className="space-y-6">
                    <WhitelistManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}

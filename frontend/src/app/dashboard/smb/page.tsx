'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { useAccount } from 'wagmi';
import { Wallet, AlertCircle } from 'lucide-react';
import { CreditScoreCard } from '@/components/smb/credit-score-card';
import { InvoiceStats } from '@/components/smb/invoice-stats';
import { MintInvoiceDialog } from '@/components/smb/mint-invoice-dialog';
import { InvoicesTable } from '@/components/smb/invoices-table';
import { RepayInvoiceDialog } from '@/components/smb/repay-invoice-dialog';
import { useUserInvoices } from '@/hooks/use-invoices';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/hooks/use-user-role';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function SMBDashboard() {
    const { isConnected } = useAccount();
    const { role, isSMB } = useUserRole();
    const router = useRouter();
    const { invoices, balance, isLoading } = useUserInvoices();
    const [repayDialogOpen, setRepayDialogOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<{ tokenId: number; faceValue: bigint } | null>(null);

    const handleRepay = (tokenId: number, faceValue: bigint) => {
        setSelectedInvoice({ tokenId, faceValue });
        setRepayDialogOpen(true);
    };

    // Wallet not connected
    if (!isConnected) {
        return (
            <div className="container mx-auto p-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Connect Your Wallet</CardTitle>
                        <CardDescription>
                            Connect your wallet to access the SMB dashboard
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

    // Role-based access control: Only SMBs and Admins can access this dashboard
    if (isConnected && !isSMB && role !== 'admin') {
        return (
            <div className="container mx-auto p-8">
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription className="space-y-4">
                        <p>
                            This dashboard is only accessible to SMBs (Small and Medium Businesses) who have minted invoices.
                        </p>
                        <p>
                            To access this dashboard, you need to mint your first invoice. Once you mint an invoice, you'll automatically be recognized as an SMB.
                        </p>
                        <div className="flex gap-2 mt-4">
                            <WalletConnectButton />
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">SMB Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your invoices and track your credit score
                    </p>
                </div>
                <WalletConnectButton />
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="mint">Mint New</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Credit Score Card */}
                    <CreditScoreCard />

                    {/* Invoice Statistics */}
                    <InvoiceStats />
                </TabsContent>

                <TabsContent value="invoices">
                    {/* Invoices Table with Repay functionality */}
                    <InvoicesTable
                        invoices={invoices}
                        isLoading={isLoading}
                        onRepay={handleRepay}
                    />
                </TabsContent>

                <TabsContent value="mint" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mint New Invoice</CardTitle>
                            <CardDescription>
                                Create a new invoice NFT to receive instant financing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Mint Invoice Dialog */}
                            <MintInvoiceDialog />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Repay Invoice Dialog */}
            {selectedInvoice && (
                <RepayInvoiceDialog
                    open={repayDialogOpen}
                    onOpenChange={setRepayDialogOpen}
                    tokenId={selectedInvoice.tokenId}
                    faceValue={selectedInvoice.faceValue}
                />
            )}
        </div>
    );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, Clock, CheckCircle } from 'lucide-react';
import { CreateProposalForm } from './create-proposal-form';
import { PendingProposals } from './pending-proposals';
import { ExecutionHistory } from './execution-history';

export function GovernancePanel() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Platform Governance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="create" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Create Proposal
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending Approvals
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Execution History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="create" className="mt-6">
                        <CreateProposalForm />
                    </TabsContent>

                    <TabsContent value="pending" className="mt-6">
                        <PendingProposals />
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <ExecutionHistory />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

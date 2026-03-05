'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface Proposal {
    id: number;
    type: string;
    description: string;
    approvals: number;
    required: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}

export function GovernanceProposals() {
    const proposals: Proposal[] = [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Rejected
                    </Badge>
                );
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Governance Proposals</CardTitle>
                <CardDescription>Multi-sig proposals requiring approval</CardDescription>
            </CardHeader>
            <CardContent>
                {proposals.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No pending proposals</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Approvals</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {proposals.map((proposal) => (
                                <TableRow key={proposal.id}>
                                    <TableCell className="font-mono">#{proposal.id}</TableCell>
                                    <TableCell>{proposal.type}</TableCell>
                                    <TableCell>{proposal.description}</TableCell>
                                    <TableCell>
                                        {proposal.approvals}/{proposal.required}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {proposal.status === 'pending' && (
                                            <Button size="sm">Approve</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

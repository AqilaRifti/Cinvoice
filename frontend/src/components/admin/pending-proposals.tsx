'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApproveProposal } from '@/hooks/use-platform-governance';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { CheckCircle, Clock, User, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

// Mock data - in production, fetch from contract
const mockProposals = [
    {
        id: 1,
        type: 'Fee Adjustment',
        proposer: '0x1234...5678',
        description: 'Adjust platform fee from 2.5% to 2.0% to increase competitiveness',
        approvals: ['0x1234...5678'],
        requiredApprovals: 2,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        executed: false,
    },
    {
        id: 2,
        type: 'Whitelist',
        proposer: '0xabcd...efgh',
        description: 'Add verified institutional investor to whitelist',
        approvals: ['0xabcd...efgh', '0x9876...5432'],
        requiredApprovals: 2,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        executed: false,
    },
];

const adminAddresses = [
    '0x1234...5678',
    '0xabcd...efgh',
    '0x9876...5432',
];

interface ProposalCardProps {
    proposal: typeof mockProposals[0];
    currentAddress?: string;
}

function ProposalCard({ proposal, currentAddress }: ProposalCardProps) {
    const [isApproving, setIsApproving] = useState(false);
    const { mutateAsync: approveProposal } = useApproveProposal();

    const hasApproved = currentAddress && proposal.approvals.includes(currentAddress);
    const canApprove = currentAddress && !hasApproved && !proposal.executed;
    const isFullyApproved = proposal.approvals.length >= proposal.requiredApprovals;

    const handleApprove = async () => {
        if (!canApprove) return;

        setIsApproving(true);
        try {
            await approveProposal(proposal.id);
            toast.success('Proposal approved successfully');

            // Check if this approval triggers execution
            if (proposal.approvals.length + 1 >= proposal.requiredApprovals) {
                toast.success('Proposal executed automatically');
            }
        } catch (error) {
            toast.error('Failed to approve proposal');
            console.error(error);
        } finally {
            setIsApproving(false);
        }
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Fee Adjustment': 'bg-blue-500',
            'Whitelist': 'bg-green-500',
            'Blacklist': 'bg-red-500',
            'Pause': 'bg-yellow-500',
            'Unpause': 'bg-green-500',
            'Treasury Withdrawal': 'bg-purple-500',
            'Dispute Resolution': 'bg-orange-500',
        };
        return colors[type] || 'bg-gray-500';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(proposal.type)}>
                                {proposal.type}
                            </Badge>
                            {isFullyApproved && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Ready to Execute
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg">Proposal #{proposal.id}</CardTitle>
                        <CardDescription>
                            Proposed by {proposal.proposer} •{' '}
                            {formatDistanceToNow(proposal.createdAt, { addSuffix: true })}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            {proposal.approvals.length}/{proposal.requiredApprovals}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{proposal.description}</p>

                {/* Admin Approval Indicators */}
                <div className="space-y-2">
                    <p className="text-sm font-medium">Admin Approvals</p>
                    <div className="flex items-center gap-2">
                        {adminAddresses.map((address, index) => {
                            const hasApproved = proposal.approvals.includes(address);
                            const isCurrent = address === currentAddress;

                            return (
                                <div key={address} className="relative">
                                    <Avatar
                                        className={`h-10 w-10 ${hasApproved
                                                ? 'ring-2 ring-green-500'
                                                : 'ring-2 ring-gray-300 dark:ring-gray-700'
                                            }`}
                                    >
                                        <AvatarFallback>
                                            <User className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    {hasApproved && (
                                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                            <CheckCircle className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                    {isCurrent && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                            <Badge variant="secondary" className="text-xs px-1 py-0">
                                                You
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Approve Button */}
                {canApprove && (
                    <Button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="w-full"
                    >
                        {isApproving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Approve Proposal
                    </Button>
                )}

                {hasApproved && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                            You have approved this proposal
                        </p>
                    </div>
                )}

                {isFullyApproved && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            This proposal will be executed automatically
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function PendingProposals() {
    const { address } = useAccount();

    if (mockProposals.length === 0) {
        return (
            <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Proposals</h3>
                <p className="text-sm text-muted-foreground">
                    All proposals have been executed or there are no active proposals.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {mockProposals.map((proposal) => (
                <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    currentAddress={address}
                />
            ))}
        </div>
    );
}

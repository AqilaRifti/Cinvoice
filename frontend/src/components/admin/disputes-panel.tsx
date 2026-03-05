'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

// Mock data - in production, fetch from contract
const mockDisputes = [
    {
        id: 1,
        invoiceId: 42,
        status: 'open',
        submittedBy: '0x1234...5678',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reason: 'Invoice not paid despite repayment date passing',
        evidenceLinks: [
            { label: 'Original Invoice', ipfsHash: 'QmX...abc' },
            { label: 'Payment Proof', ipfsHash: 'QmY...def' },
        ],
        timeline: [
            {
                event: 'Dispute Opened',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                actor: '0x1234...5678',
            },
            {
                event: 'Evidence Submitted',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                actor: '0xabcd...efgh',
            },
        ],
    },
    {
        id: 2,
        invoiceId: 38,
        status: 'under_review',
        submittedBy: '0xabcd...efgh',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reason: 'Fraudulent invoice detected',
        evidenceLinks: [
            { label: 'Fraud Report', ipfsHash: 'QmZ...ghi' },
        ],
        timeline: [
            {
                event: 'Dispute Opened',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                actor: '0xabcd...efgh',
            },
            {
                event: 'Under Admin Review',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                actor: 'Admin',
            },
        ],
    },
];

const statusConfig = {
    open: {
        label: 'Open',
        color: 'bg-yellow-500',
        icon: AlertTriangle,
    },
    under_review: {
        label: 'Under Review',
        color: 'bg-blue-500',
        icon: FileText,
    },
    resolved: {
        label: 'Resolved',
        color: 'bg-green-500',
        icon: CheckCircle,
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-red-500',
        icon: XCircle,
    },
};

interface DisputeItemProps {
    dispute: typeof mockDisputes[0];
}

function DisputeItem({ dispute }: DisputeItemProps) {
    const [isResolving, setIsResolving] = useState(false);
    const statusInfo = statusConfig[dispute.status as keyof typeof statusConfig];
    const StatusIcon = statusInfo.icon;

    const handleResolve = async (resolution: 'approve' | 'reject') => {
        setIsResolving(true);
        try {
            // In production: call contract to resolve dispute
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`Dispute ${resolution === 'approve' ? 'approved' : 'rejected'} successfully`);
        } catch (error) {
            toast.error('Failed to resolve dispute');
            console.error(error);
        } finally {
            setIsResolving(false);
        }
    };

    return (
        <AccordionItem value={`dispute-${dispute.id}`}>
            <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Dispute #{dispute.id}</span>
                                <Badge className={statusInfo.color}>
                                    {statusInfo.label}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Invoice #{dispute.invoiceId} • {formatDistanceToNow(dispute.submittedAt, { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 pt-4">
                    {/* Dispute Details */}
                    <div className="space-y-2">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Submitted By</p>
                            <p className="font-mono text-sm">{dispute.submittedBy}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Reason</p>
                            <p className="text-sm">{dispute.reason}</p>
                        </div>
                    </div>

                    {/* Evidence Links */}
                    {dispute.evidenceLinks.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Evidence (IPFS)</p>
                            <div className="space-y-2">
                                {dispute.evidenceLinks.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-between"
                                        asChild
                                    >
                                        <a
                                            href={`https://ipfs.io/ipfs/${link.ipfsHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                {link.label}
                                            </span>
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                        <div className="space-y-2 pl-4 border-l-2 border-border">
                            {dispute.timeline.map((event, index) => (
                                <div key={index} className="relative pl-4 pb-2">
                                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-border" />
                                    <div>
                                        <p className="text-sm font-medium">{event.event}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {event.actor} • {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resolution Actions */}
                    {dispute.status === 'open' || dispute.status === 'under_review' ? (
                        <div className="space-y-3 pt-2">
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    Resolving this dispute will require a governance proposal with admin approval.
                                </AlertDescription>
                            </Alert>
                            <div className="flex gap-2">
                                <Button
                                    variant="default"
                                    className="flex-1"
                                    onClick={() => handleResolve('approve')}
                                    disabled={isResolving}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Claim
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => handleResolve('reject')}
                                    disabled={isResolving}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Claim
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                            <StatusIcon className="h-4 w-4" />
                            <p className="text-sm font-medium">
                                This dispute has been {dispute.status}
                            </p>
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export function DisputesPanel() {
    if (mockDisputes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Disputes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Active Disputes</h3>
                        <p className="text-sm text-muted-foreground">
                            All disputes have been resolved or there are no open disputes.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Disputes ({mockDisputes.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {mockDisputes.map((dispute) => (
                        <DisputeItem key={dispute.id} dispute={dispute} />
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}

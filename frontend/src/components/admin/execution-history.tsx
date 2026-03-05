'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mock data - in production, fetch from contract events
const mockHistory = [
    {
        id: 5,
        type: 'Fee Adjustment',
        description: 'Adjusted platform fee from 3% to 2.5%',
        executedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        executedBy: '0x1234...5678',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    },
    {
        id: 4,
        type: 'Whitelist',
        description: 'Added institutional investor to whitelist',
        executedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        executedBy: '0xabcd...efgh',
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
    {
        id: 3,
        type: 'Unpause',
        description: 'Resumed platform operations after maintenance',
        executedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        executedBy: '0x9876...5432',
        txHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
    },
    {
        id: 2,
        type: 'Pause',
        description: 'Paused platform for scheduled maintenance',
        executedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        executedBy: '0x1234...5678',
        txHash: '0x0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
    },
    {
        id: 1,
        type: 'Treasury Withdrawal',
        description: 'Withdrew 1000 CTC for operational expenses',
        executedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        executedBy: '0xabcd...efgh',
        txHash: '0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123',
    },
];

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

export function ExecutionHistory() {
    if (mockHistory.length === 0) {
        return (
            <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Execution History</h3>
                <p className="text-sm text-muted-foreground">
                    Executed proposals will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Timeline */}
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                {/* Timeline items */}
                <div className="space-y-6">
                    {mockHistory.map((item, index) => (
                        <div key={item.id} className="relative pl-10">
                            {/* Timeline dot */}
                            <div className="absolute left-0 top-1 flex items-center justify-center">
                                <div className="h-8 w-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="bg-card border rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className={getTypeColor(item.type)}>
                                                {item.type}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                Proposal #{item.id}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium">{item.description}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                    >
                                        <a
                                            href={`https://etherscan.io/tx/${item.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>
                                        Executed by {item.executedBy}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {formatDistanceToNow(item.executedAt, { addSuffix: true })}
                                    </span>
                                </div>

                                <div className="pt-2 border-t">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Transaction:</span>
                                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                            {item.txHash.slice(0, 10)}...{item.txHash.slice(-8)}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

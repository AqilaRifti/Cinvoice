'use client';

import { Badge } from '@/components/ui/badge';
import { useAccount, useChainId } from 'wagmi';
import { creditcoinTestnet } from '@/lib/wagmi';
import { IconCircleCheckFilled, IconAlertCircle } from '@tabler/icons-react';

export function NetworkStatusBadge() {
    const { isConnected } = useAccount();
    const chainId = useChainId();

    if (!isConnected) {
        return null;
    }

    const isCorrectNetwork = chainId === creditcoinTestnet.id;

    return (
        <Badge
            variant={isCorrectNetwork ? 'default' : 'destructive'}
            className="flex items-center gap-1.5 px-2.5 py-1"
        >
            {isCorrectNetwork ? (
                <>
                    <IconCircleCheckFilled className="h-3 w-3" />
                    <span className="hidden sm:inline">{creditcoinTestnet.name}</span>
                    <span className="sm:hidden">CTC</span>
                </>
            ) : (
                <>
                    <IconAlertCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">Wrong Network</span>
                    <span className="sm:hidden">Wrong</span>
                </>
            )}
        </Badge>
    );
}

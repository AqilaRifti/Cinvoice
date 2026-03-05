'use client';

import { Badge } from '@/components/ui/badge';
import { InvoiceState } from '@/types';
import { cn } from '@/lib/utils';

interface InvoiceStateBadgeProps {
    state: InvoiceState;
    className?: string;
}

const stateConfig = {
    [InvoiceState.Pending]: {
        label: 'Pending',
        className: 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600',
    },
    [InvoiceState.Funded]: {
        label: 'Funded',
        className: 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600',
    },
    [InvoiceState.Repaid]: {
        label: 'Repaid',
        className: 'bg-green-500 text-white border-green-600 hover:bg-green-600',
    },
    [InvoiceState.Defaulted]: {
        label: 'Defaulted',
        className: 'bg-red-500 text-white border-red-600 hover:bg-red-600',
    },
} as const;

export function InvoiceStateBadge({ state, className }: InvoiceStateBadgeProps) {
    const config = stateConfig[state];

    return (
        <Badge
            className={cn(
                'transition-all duration-200 ease-in-out',
                config.className,
                className
            )}
        >
            {config.label}
        </Badge>
    );
}

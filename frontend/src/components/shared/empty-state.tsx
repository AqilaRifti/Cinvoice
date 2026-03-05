import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    IconFileText,
    IconShoppingBag,
    IconSearch,
    IconInbox,
    IconAlertCircle,
    IconWallet
} from '@tabler/icons-react';

export interface EmptyStateProps {
    /**
     * Icon to display (uses Tabler icons)
     */
    icon?: React.ComponentType<{ className?: string }>;
    /**
     * Title text
     */
    title: string;
    /**
     * Description text
     */
    description?: string;
    /**
     * Primary action button
     */
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'default' | 'outline' | 'secondary';
    };
    /**
     * Secondary action button
     */
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Whether to show as a card or plain content
     */
    variant?: 'card' | 'plain';
}

/**
 * Empty state component with illustration and CTAs
 * Used when no data is available in tables, grids, or lists
 */
export function EmptyState({
    icon: Icon = IconInbox,
    title,
    description,
    action,
    secondaryAction,
    className,
    variant = 'plain'
}: EmptyStateProps) {
    const content = (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center',
                variant === 'card' ? 'py-12' : 'py-16',
                className
            )}
        >
            {/* Icon */}
            <div className='mb-4 rounded-full bg-muted p-4'>
                <Icon className='h-10 w-10 text-muted-foreground' />
            </div>

            {/* Title */}
            <h3 className='mb-2 text-lg font-semibold'>{title}</h3>

            {/* Description */}
            {description && (
                <p className='mb-6 max-w-sm text-sm text-muted-foreground'>{description}</p>
            )}

            {/* Actions */}
            {(action || secondaryAction) && (
                <div className='flex flex-col gap-2 sm:flex-row'>
                    {action && (
                        <Button
                            onClick={action.onClick}
                            variant={action.variant || 'default'}
                            size='sm'
                        >
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button onClick={secondaryAction.onClick} variant='outline' size='sm'>
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );

    if (variant === 'card') {
        return (
            <Card>
                <CardContent className='p-0'>{content}</CardContent>
            </Card>
        );
    }

    return content;
}

/**
 * Empty state for invoices table (SMB dashboard)
 */
export function EmptyInvoicesState({ onCreateInvoice }: { onCreateInvoice: () => void }) {
    return (
        <EmptyState
            icon={IconFileText}
            title='No invoices yet'
            description='Create your first invoice to start tokenizing and accessing financing.'
            action={{
                label: 'Create Invoice',
                onClick: onCreateInvoice
            }}
            variant='card'
        />
    );
}

/**
 * Empty state for marketplace (Investor dashboard)
 */
export function EmptyMarketplaceState() {
    return (
        <EmptyState
            icon={IconShoppingBag}
            title='No invoices available'
            description='There are currently no invoices available for investment. Check back soon for new opportunities.'
            variant='card'
        />
    );
}

/**
 * Empty state for portfolio (Investor dashboard)
 */
export function EmptyPortfolioState({ onBrowseMarketplace }: { onBrowseMarketplace: () => void }) {
    return (
        <EmptyState
            icon={IconInbox}
            title='Your portfolio is empty'
            description='Start investing in invoices to build your portfolio and earn returns.'
            action={{
                label: 'Browse Marketplace',
                onClick: onBrowseMarketplace
            }}
            variant='card'
        />
    );
}

/**
 * Empty state for search/filter results
 */
export function EmptySearchState({ onClearFilters }: { onClearFilters?: () => void }) {
    return (
        <EmptyState
            icon={IconSearch}
            title='No results found'
            description="Try adjusting your search or filters to find what you're looking for."
            action={
                onClearFilters
                    ? {
                        label: 'Clear Filters',
                        onClick: onClearFilters,
                        variant: 'outline'
                    }
                    : undefined
            }
        />
    );
}

/**
 * Empty state for charts with no data
 */
export function EmptyChartState() {
    return (
        <EmptyState
            icon={IconAlertCircle}
            title='No data available'
            description='There is no data to display for the selected time period.'
            className='py-12'
        />
    );
}

/**
 * Empty state for wallet not connected
 */
export function WalletNotConnectedState({ onConnect }: { onConnect: () => void }) {
    return (
        <EmptyState
            icon={IconWallet}
            title='Wallet not connected'
            description='Connect your wallet to access the platform and start using its features.'
            action={{
                label: 'Connect Wallet',
                onClick: onConnect
            }}
            variant='card'
        />
    );
}

/**
 * Empty state for table with no data
 */
export function EmptyTableState({
    title = 'No items found',
    description = 'There are no items to display.',
    onAction
}: {
    title?: string;
    description?: string;
    onAction?: () => void;
}) {
    return (
        <EmptyState
            icon={IconInbox}
            title={title}
            description={description}
            action={
                onAction
                    ? {
                        label: 'Add Item',
                        onClick: onAction
                    }
                    : undefined
            }
        />
    );
}

/**
 * Usage Examples for Loading and Empty State Components
 * 
 * This file demonstrates how to use the shared loading and empty state components
 * in various scenarios throughout the application.
 */

import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    CardSkeleton,
    InvoiceCardSkeleton,
    MetricCardSkeleton,
    TableSkeleton,
    ChartSkeleton,
    DashboardSkeleton,
    MarketplaceGridSkeleton,
    Spinner,
    EmptyState,
    EmptyInvoicesState,
    EmptyMarketplaceState,
    EmptyPortfolioState,
    EmptySearchState,
    EmptyChartState,
    WalletNotConnectedState,
    EmptyTableState,
    ButtonWithLoading,
    IconButtonWithLoading
} from './index';
import { IconTrash, IconEdit } from '@tabler/icons-react';

/**
 * Example 1: Loading state for a data table
 */
export function InvoicesTableExample() {
    const { data: invoices, isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            // Fetch invoices from API
            return [];
        }
    });

    if (isLoading) {
        return <TableSkeleton rows={5} columns={6} />;
    }

    if (!invoices || invoices.length === 0) {
        return (
            <EmptyInvoicesState
                onCreateInvoice={() => {
                    console.log('Create invoice clicked');
                }}
            />
        );
    }

    return <div>{/* Render table with invoices */}</div>;
}

/**
 * Example 2: Loading state for marketplace grid
 */
export function MarketplaceExample() {
    const { data: invoices, isLoading } = useQuery({
        queryKey: ['marketplace'],
        queryFn: async () => {
            // Fetch marketplace invoices
            return [];
        }
    });

    if (isLoading) {
        return <MarketplaceGridSkeleton count={6} />;
    }

    if (!invoices || invoices.length === 0) {
        return <EmptyMarketplaceState />;
    }

    return (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {invoices.map((invoice: any) => (
                <div key={invoice.id}>{/* Invoice card */}</div>
            ))}
        </div>
    );
}

/**
 * Example 3: Loading state for dashboard
 */
export function DashboardExample() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            // Fetch dashboard data
            return null;
        }
    });

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className='space-y-6'>
            {/* Dashboard content */}
            <div className='grid gap-4 md:grid-cols-4'>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
            </div>
        </div>
    );
}

/**
 * Example 4: Button with loading state
 */
export function MintInvoiceFormExample() {
    const { mutate, isPending } = useMutation({
        mutationFn: async (data: any) => {
            // Mint invoice
            return null;
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate({});
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <ButtonWithLoading
                type='submit'
                loading={isPending}
                loadingText='Minting Invoice...'
            >
                Mint Invoice
            </ButtonWithLoading>
        </form>
    );
}

/**
 * Example 5: Icon button with loading state
 */
export function DeleteButtonExample() {
    const { mutate, isPending } = useMutation({
        mutationFn: async (id: string) => {
            // Delete item
            return null;
        }
    });

    return (
        <IconButtonWithLoading
            icon={IconTrash}
            loading={isPending}
            onClick={() => mutate('item-id')}
            variant='destructive'
            aria-label='Delete item'
        />
    );
}

/**
 * Example 6: Search results with empty state
 */
export function SearchResultsExample() {
    const [filters, setFilters] = React.useState({});
    const { data: results, isLoading } = useQuery({
        queryKey: ['search', filters],
        queryFn: async () => {
            // Search with filters
            return [];
        }
    });

    if (isLoading) {
        return <TableSkeleton rows={5} columns={4} />;
    }

    if (!results || results.length === 0) {
        return (
            <EmptySearchState
                onClearFilters={() => {
                    setFilters({});
                }}
            />
        );
    }

    return <div>{/* Render search results */}</div>;
}

/**
 * Example 7: Chart with loading and empty states
 */
export function ChartExample() {
    const { data, isLoading } = useQuery({
        queryKey: ['chart-data'],
        queryFn: async () => {
            // Fetch chart data
            return [];
        }
    });

    if (isLoading) {
        return <ChartSkeleton height={400} />;
    }

    if (!data || data.length === 0) {
        return <EmptyChartState />;
    }

    return <div>{/* Render chart */}</div>;
}

/**
 * Example 8: Wallet connection check
 */
export function WalletRequiredExample() {
    const isConnected = false; // Get from wallet context

    if (!isConnected) {
        return (
            <WalletNotConnectedState
                onConnect={() => {
                    console.log('Connect wallet clicked');
                }}
            />
        );
    }

    return <div>{/* Protected content */}</div>;
}

/**
 * Example 9: Custom empty state
 */
export function CustomEmptyStateExample() {
    return (
        <EmptyState
            icon={IconEdit}
            title='No drafts yet'
            description='Start creating drafts to save your work in progress.'
            action={{
                label: 'Create Draft',
                onClick: () => console.log('Create draft'),
                variant: 'default'
            }}
            secondaryAction={{
                label: 'Learn More',
                onClick: () => console.log('Learn more')
            }}
            variant='card'
        />
    );
}

/**
 * Example 10: Inline spinner
 */
export function InlineSpinnerExample() {
    const [loading, setLoading] = React.useState(false);

    return (
        <div className='flex items-center gap-2'>
            {loading && <Spinner size='sm' />}
            <span>Loading data...</span>
        </div>
    );
}

/**
 * Example 11: Portfolio with empty state
 */
export function PortfolioExample() {
    const { data: portfolio, isLoading } = useQuery({
        queryKey: ['portfolio'],
        queryFn: async () => {
            // Fetch portfolio
            return [];
        }
    });

    if (isLoading) {
        return <TableSkeleton rows={5} columns={7} />;
    }

    if (!portfolio || portfolio.length === 0) {
        return (
            <EmptyPortfolioState
                onBrowseMarketplace={() => {
                    console.log('Browse marketplace clicked');
                }}
            />
        );
    }

    return <div>{/* Render portfolio table */}</div>;
}

/**
 * Example 12: Multiple loading states
 */
export function MultipleLoadingStatesExample() {
    const { data: metrics, isLoading: metricsLoading } = useQuery({
        queryKey: ['metrics'],
        queryFn: async () => null
    });

    const { data: chart, isLoading: chartLoading } = useQuery({
        queryKey: ['chart'],
        queryFn: async () => null
    });

    return (
        <div className='space-y-6'>
            {/* Metrics */}
            {metricsLoading ? (
                <div className='grid gap-4 md:grid-cols-4'>
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                </div>
            ) : (
                <div>{/* Render metrics */}</div>
            )}

            {/* Chart */}
            {chartLoading ? <ChartSkeleton height={300} /> : <div>{/* Render chart */}</div>}
        </div>
    );
}

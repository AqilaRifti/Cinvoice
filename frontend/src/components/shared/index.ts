/**
 * Shared UI Components
 * 
 * This module exports reusable loading and empty state components
 * used throughout the application.
 */

// Loading skeletons
export {
    CardSkeleton,
    InvoiceCardSkeleton,
    MetricCardSkeleton,
    TableSkeleton,
    ChartSkeleton,
    DashboardSkeleton,
    MarketplaceGridSkeleton,
    Spinner
} from './loading-skeleton';

// Empty states
export {
    EmptyState,
    EmptyInvoicesState,
    EmptyMarketplaceState,
    EmptyPortfolioState,
    EmptySearchState,
    EmptyChartState,
    WalletNotConnectedState,
    EmptyTableState
} from './empty-state';
export type { EmptyStateProps } from './empty-state';

// Button with loading
export {
    ButtonWithLoading,
    IconButtonWithLoading
} from './button-with-loading';
export type { ButtonWithLoadingProps } from './button-with-loading';

// Transaction dialog
export { TransactionDialog } from './transaction-dialog';
export type { TransactionStatus } from './transaction-dialog';

// Transaction confirmation dialog
export { TransactionConfirmationDialog } from './transaction-confirmation-dialog';
export type { TransactionConfirmationProps } from './transaction-confirmation-dialog';

// Animated counter
export {
    AnimatedCounter,
    CurrencyCounter,
    PercentageCounter,
    CompactCounter,
    IntegerCounter
} from './animated-counter';
export type { AnimatedCounterProps, NumberFormat } from './animated-counter';

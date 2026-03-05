# Shared UI Components

This directory contains reusable loading and empty state components used throughout the application.

## Loading Skeletons

Loading skeletons provide visual feedback during data fetching operations. They use the shadcn-ui `Skeleton` component as a base.

### Available Skeleton Components

#### `CardSkeleton`
Generic card skeleton for basic card layouts.

```tsx
import { CardSkeleton } from '@/components/shared';

<CardSkeleton />
```

#### `InvoiceCardSkeleton`
Specialized skeleton for invoice cards in the marketplace.

```tsx
import { InvoiceCardSkeleton } from '@/components/shared';

<InvoiceCardSkeleton />
```

#### `MetricCardSkeleton`
Skeleton for metric/stats cards on dashboards.

```tsx
import { MetricCardSkeleton } from '@/components/shared';

<div className="grid gap-4 md:grid-cols-4">
  <MetricCardSkeleton />
  <MetricCardSkeleton />
  <MetricCardSkeleton />
  <MetricCardSkeleton />
</div>
```

#### `TableSkeleton`
Skeleton for table components with customizable rows and columns.

```tsx
import { TableSkeleton } from '@/components/shared';

<TableSkeleton rows={5} columns={6} />
```

#### `ChartSkeleton`
Skeleton for chart components with customizable height.

```tsx
import { ChartSkeleton } from '@/components/shared';

<ChartSkeleton height={400} />
```

#### `DashboardSkeleton`
Complete dashboard skeleton with metrics, charts, and content areas.

```tsx
import { DashboardSkeleton } from '@/components/shared';

function Dashboard() {
  const { data, isLoading } = useQuery(...);
  
  if (isLoading) return <DashboardSkeleton />;
  
  return <div>{/* Dashboard content */}</div>;
}
```

#### `MarketplaceGridSkeleton`
Grid of invoice card skeletons for marketplace loading.

```tsx
import { MarketplaceGridSkeleton } from '@/components/shared';

<MarketplaceGridSkeleton count={6} />
```

#### `Spinner`
Inline loading spinner for buttons and small areas.

```tsx
import { Spinner } from '@/components/shared';

<Spinner size="sm" />
<Spinner size="default" />
<Spinner size="lg" />
```

## Empty States

Empty state components provide clear feedback when no data is available, with optional illustrations and call-to-action buttons.

### Base Component

#### `EmptyState`
Generic empty state component with customizable icon, title, description, and actions.

```tsx
import { EmptyState } from '@/components/shared';
import { IconFileText } from '@tabler/icons-react';

<EmptyState
  icon={IconFileText}
  title="No invoices yet"
  description="Create your first invoice to get started."
  action={{
    label: 'Create Invoice',
    onClick: handleCreate
  }}
  secondaryAction={{
    label: 'Learn More',
    onClick: handleLearnMore
  }}
  variant="card" // or "plain"
/>
```

### Specialized Empty States

#### `EmptyInvoicesState`
Empty state for SMB invoices table.

```tsx
import { EmptyInvoicesState } from '@/components/shared';

<EmptyInvoicesState onCreateInvoice={handleCreateInvoice} />
```

#### `EmptyMarketplaceState`
Empty state for marketplace when no invoices are available.

```tsx
import { EmptyMarketplaceState } from '@/components/shared';

<EmptyMarketplaceState />
```

#### `EmptyPortfolioState`
Empty state for investor portfolio.

```tsx
import { EmptyPortfolioState } from '@/components/shared';

<EmptyPortfolioState onBrowseMarketplace={handleBrowseMarketplace} />
```

#### `EmptySearchState`
Empty state for search/filter results.

```tsx
import { EmptySearchState } from '@/components/shared';

<EmptySearchState onClearFilters={handleClearFilters} />
```

#### `EmptyChartState`
Empty state for charts with no data.

```tsx
import { EmptyChartState } from '@/components/shared';

<EmptyChartState />
```

#### `WalletNotConnectedState`
Empty state when wallet is not connected.

```tsx
import { WalletNotConnectedState } from '@/components/shared';

<WalletNotConnectedState onConnect={handleConnect} />
```

#### `EmptyTableState`
Generic empty state for tables.

```tsx
import { EmptyTableState } from '@/components/shared';

<EmptyTableState
  title="No items found"
  description="There are no items to display."
  onAction={handleAddItem}
/>
```

## Button with Loading

Enhanced button components with built-in loading state support.

### `ButtonWithLoading`
Button that displays a spinner when loading.

```tsx
import { ButtonWithLoading } from '@/components/shared';

<ButtonWithLoading
  loading={isSubmitting}
  loadingText="Submitting..."
  onClick={handleSubmit}
>
  Submit
</ButtonWithLoading>
```

### `IconButtonWithLoading`
Icon-only button with loading state.

```tsx
import { IconButtonWithLoading } from '@/components/shared';
import { IconTrash } from '@tabler/icons-react';

<IconButtonWithLoading
  icon={IconTrash}
  loading={isDeleting}
  onClick={handleDelete}
  variant="destructive"
/>
```

## Usage Examples

### Complete Loading Pattern

```tsx
import { useQuery } from '@tanstack/react-query';
import { TableSkeleton, EmptyTableState } from '@/components/shared';

function InvoicesTable() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices
  });
  
  if (isLoading) {
    return <TableSkeleton rows={5} columns={6} />;
  }
  
  if (!invoices || invoices.length === 0) {
    return <EmptyInvoicesState onCreateInvoice={handleCreate} />;
  }
  
  return (
    <Table>
      {/* Table content */}
    </Table>
  );
}
```

### Button Loading Pattern

```tsx
import { ButtonWithLoading } from '@/components/shared';
import { useMutation } from '@tanstack/react-query';

function MintInvoiceForm() {
  const { mutate, isPending } = useMutation({
    mutationFn: mintInvoice
  });
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <ButtonWithLoading
        type="submit"
        loading={isPending}
        loadingText="Minting..."
      >
        Mint Invoice
      </ButtonWithLoading>
    </form>
  );
}
```

### Marketplace Grid Pattern

```tsx
import { MarketplaceGridSkeleton, EmptyMarketplaceState } from '@/components/shared';

function Marketplace() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['marketplace'],
    queryFn: fetchMarketplaceInvoices
  });
  
  if (isLoading) {
    return <MarketplaceGridSkeleton count={6} />;
  }
  
  if (!invoices || invoices.length === 0) {
    return <EmptyMarketplaceState />;
  }
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {invoices.map(invoice => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
}
```

## Design Principles

1. **Consistent Feedback**: All loading states use the same skeleton pattern for consistency
2. **Actionable Empty States**: Empty states include clear CTAs to guide users
3. **Responsive Design**: All components adapt to different screen sizes
4. **Accessibility**: Components include proper ARIA labels and semantic HTML
5. **Theme Support**: Components respect the active theme and color scheme

## Requirements Validation

These components satisfy the following requirements from the spec:

- **Requirement 9.1**: Skeleton loaders for cards, tables, and charts using shadcn-ui Skeleton
- **Requirement 9.2**: Spinner indicators for button actions and inline operations
- **Requirement 9.3**: Empty states with relevant illustrations, descriptive text, and actionable CTAs
- **Requirement 9.4**: Empty state for tables with "No items found" message and filter reset option
- **Requirement 3.10**: Empty state for SMB invoices with "Create Your First Invoice" CTA
- **Requirement 4.10**: Empty state for investor portfolio with "Browse Marketplace" CTA
- **Requirement 8.7**: Skeleton loaders for charts matching chart dimensions
- **Requirement 8.10**: Empty state for charts when no data is available

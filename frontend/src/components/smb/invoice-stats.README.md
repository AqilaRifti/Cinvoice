# InvoiceStats Component

## Overview

The `InvoiceStats` component displays key invoice statistics for SMB users in a responsive grid of metric cards. Each card shows a specific metric with an icon, value, and percentage change indicator.

## Features

- **Four Metric Cards**:
  - Total Invoices: Total number of invoices created
  - Active Invoices: Invoices in Pending or Funded state
  - Total Funded: Number of funded invoices
  - Total Repaid: Total amount repaid in CTC

- **Visual Enhancements**:
  - Icons for each metric (FileText, Clock, DollarSign, CheckCircle)
  - Animated counters for smooth number transitions
  - Percentage change indicators with trend icons
  - Color-coded changes (green for positive, red for negative)
  - Hover effects with elevation and scale

- **Responsive Layout**:
  - 2x2 grid on mobile
  - 4x1 grid on desktop (md breakpoint and above)

- **Loading States**:
  - Skeleton loaders while data is fetching
  - Smooth transitions when data loads

## Usage

```tsx
import { InvoiceStats } from '@/components/smb/invoice-stats';

export default function SMBDashboard() {
  return (
    <div className="space-y-6">
      <InvoiceStats />
    </div>
  );
}
```

## Data Source

The component uses the `useUserInvoices` hook to fetch invoice data from the InvoiceNFT smart contract. It calculates statistics in real-time based on the invoice states:

- **Total**: Count of all invoices
- **Active**: Count of invoices in Pending or Funded state
- **Funded**: Count of invoices in Funded state
- **Total Repaid**: Sum of face values for invoices in Repaid state

## Animations

The component uses Framer Motion for smooth animations:

- **Stagger Container**: Cards animate in sequence with a 0.1s delay between each
- **Fade In Up**: Each card fades in and slides up from below
- **Hover Effect**: Cards scale up and lift on hover
- **Counter Animation**: Numbers animate from 0 to their final value over 1.5 seconds

## Percentage Changes

Currently, percentage changes are generated as mock data for demonstration purposes. In production, these should be calculated from historical data by comparing current period statistics with the previous period.

To implement real percentage changes:

1. Store historical statistics in a database or on-chain
2. Query previous period data (e.g., last 30 days)
3. Calculate percentage change: `((current - previous) / previous) * 100`
4. Pass the calculated changes to the component

## Styling

The component uses:
- shadcn-ui Card components for consistent styling
- Tailwind CSS for responsive grid layout
- Lucide icons for visual indicators
- Theme-aware colors that adapt to light/dark mode

## Requirements

Validates Requirements 3.3 from the frontend-redesign spec:
- ✅ Four metric cards showing invoice statistics
- ✅ Percentage change indicators
- ✅ Icons for each metric
- ✅ Hover effects with elevation
- ✅ Responsive grid layout (2x2 mobile, 4x1 desktop)
- ✅ Animated number transitions
- ✅ Loading states with skeleton loaders

## Dependencies

- `@/hooks/use-invoice-nft`: For fetching user invoices
- `@/lib/contracts`: For InvoiceState enum
- `@/lib/calculations`: For formatCurrency utility
- `@/lib/animations`: For animation variants
- `@/components/shared/animated-counter`: For number animations
- `framer-motion`: For animations
- `lucide-react`: For icons

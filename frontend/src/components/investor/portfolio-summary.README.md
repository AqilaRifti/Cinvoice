# PortfolioSummary Component

## Overview

The `PortfolioSummary` component displays key portfolio statistics for Investor users in a responsive grid of metric cards. Each card shows a specific metric with an icon, animated value, and percentage change indicator.

## Features

- **Four Metric Cards**:
  - Total Invested: Total amount invested across all invoices
  - Total Returned: Total amount returned from repaid invoices
  - Active Investments: Number of currently active (funded) investments
  - Overall ROI: Return on investment percentage (color-coded)

- **Visual Enhancements**:
  - Icons for each metric (Wallet, TrendingUp, Activity, Target)
  - Animated counters for smooth number transitions
  - Percentage change indicators with trend icons
  - Color-coded changes (green for positive, red for negative)
  - Color-coded ROI (green for positive, red for negative)
  - Hover effects with elevation and scale

- **Responsive Layout**:
  - 2x2 grid on mobile
  - 4x1 grid on desktop (md breakpoint and above)

- **Loading States**:
  - Skeleton loaders while data is fetching
  - Smooth transitions when data loads

## Usage

```tsx
import { PortfolioSummary } from '@/components/investor/portfolio-summary';

export default function InvestorDashboard() {
  return (
    <div className="space-y-6">
      <PortfolioSummary />
    </div>
  );
}
```

## Data Source

The component uses the `useUserInvestments` hook to fetch investment data from the smart contracts. It calculates statistics in real-time based on the investment states:

- **Total Invested**: Sum of purchase prices for all investments
- **Total Returned**: Sum of face values for repaid invoices
- **Active Investments**: Count of investments in Funded state
- **Overall ROI**: Calculated as `((expectedValue - totalInvested) / totalInvested) * 100`

### ROI Calculation

The ROI is calculated based on:
- **Repaid invoices**: Actual returns (face value received)
- **Active investments**: Expected returns (face value when repaid)
- **Defaulted invoices**: Not included in expected value

Formula: `ROI = ((totalExpectedValue - totalInvested) / totalInvested) * 100`

## Animations

The component uses Framer Motion for smooth animations:

- **Stagger Container**: Cards animate in sequence with a 0.1s delay between each
- **Fade In Up**: Each card fades in and slides up from below
- **Hover Effect**: Cards scale up and lift on hover
- **Counter Animation**: Numbers animate from 0 to their final value over 1.5 seconds
- **Percentage Animation**: ROI percentage animates smoothly with decimal precision

## Color Coding

### ROI Display
- **Positive ROI** (≥ 0%): Green text (`text-green-600`)
- **Negative ROI** (< 0%): Red text (`text-red-600`)

### Change Indicators
- **Positive change**: Green with up arrow
- **Negative change**: Red with down arrow
- **No change**: Gray text

## Percentage Changes

Currently, percentage changes are generated as mock data for demonstration purposes. In production, these should be calculated from historical data by comparing current period statistics with the previous period.

To implement real percentage changes:

1. Store historical portfolio statistics in a database or on-chain
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

Validates Requirements 4.1 from the frontend-redesign spec:
- ✅ Four metric cards showing portfolio statistics
- ✅ Percentage change indicators with trend icons
- ✅ Color-coded ROI (green for positive, red for negative)
- ✅ Animated number transitions using AnimatedCounter
- ✅ Icons for each metric
- ✅ Hover effects with elevation
- ✅ Responsive grid layout (2x2 mobile, 4x1 desktop)
- ✅ Loading states with skeleton loaders

## Dependencies

- `@/hooks/use-user-investments`: For fetching user investment data
- `@/lib/calculations`: For formatCurrency utility
- `@/lib/animations`: For animation variants
- `@/components/shared/animated-counter`: For number animations
- `framer-motion`: For animations
- `lucide-react`: For icons

## Related Components

- `InvoiceStats`: Similar component for SMB dashboard
- `PortfolioTable`: Detailed table view of investments
- `MarketplaceGrid`: Browse available invoices for investment

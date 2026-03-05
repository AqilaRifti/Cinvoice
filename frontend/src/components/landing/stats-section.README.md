# StatsSection Component

## Overview

The `StatsSection` component displays live platform statistics with animated counters that update every 30 seconds. It shows four key metrics: total invoices, total volume, active investments, and success rate.

## Features

- **Live Data**: Fetches real-time statistics from smart contracts
- **Animated Counters**: Smooth number transitions using Framer Motion
- **Auto-Refresh**: Automatically refreshes data every 30 seconds
- **Skeleton Loaders**: Shows loading state while fetching data
- **Responsive Grid**: 2x2 layout on mobile, 4 columns on desktop
- **Scroll Animations**: Cards animate into view when scrolling

## Usage

```tsx
import { StatsSection } from '@/components/landing';

export default function LandingPage() {
  return (
    <div>
      <StatsSection />
    </div>
  );
}
```

## Statistics Displayed

1. **Total Invoices**: Total number of invoices minted on the platform
2. **Total Volume**: Total value in the treasury (in CTC)
3. **Active Investments**: Number of currently active investments (calculated)
4. **Success Rate**: Platform success rate percentage (mock data)

## Data Source

The component uses the `usePlatformStats` hook to fetch data from:
- `InvoiceNFT.nextTokenId()` - for total invoices
- `PlatformGovernance.getTreasuryBalance()` - for total volume

## Auto-Refresh

The component automatically invalidates queries every 30 seconds to keep data fresh:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    queryClient.invalidateQueries({ queryKey: ['platform'] });
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [queryClient]);
```

## Animations

- **Card Entry**: Cards fade in and scale up when scrolling into view
- **Icon Animation**: Icons rotate and scale with spring animation
- **Counter Animation**: Numbers smoothly animate to new values
- **Hover Effect**: Cards lift and change border color on hover

## Responsive Design

- **Mobile (< 768px)**: 2x2 grid layout
- **Desktop (≥ 768px)**: 4 column layout
- **Touch Targets**: All interactive elements meet 44x44px minimum

## Accessibility

- Semantic HTML structure
- ARIA labels for icons
- Respects `prefers-reduced-motion` setting
- Keyboard accessible

## Requirements Validated

- **1.3**: Display live platform statistics with animated counters
- **1.7**: Animate number transitions smoothly

## Future Enhancements

- Fetch real active investments count from contracts
- Fetch real success rate from contract events
- Add trend indicators (up/down arrows)
- Add comparison to previous period
- Add export data functionality

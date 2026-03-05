# AnimatedCounter Component

A smooth, animated counter component built with Framer Motion that supports multiple number formats and customization options.

## Features

- ✨ Smooth spring-based animations using Framer Motion
- 🎨 Multiple format types (default, currency, percentage, decimal, compact)
- 🔢 Customizable decimal places
- ⚡ Configurable animation duration and easing
- ♿ Respects user's `prefers-reduced-motion` setting
- 🎯 TypeScript support with full type definitions
- 📦 Specialized counter components for common use cases

## Installation

The component is already part of the shared components. Import it from:

```tsx
import { AnimatedCounter } from '@/components/shared';
```

## Basic Usage

### Default Counter

```tsx
<AnimatedCounter value={1234} />
// Output: 1,234
```

### Currency Counter

```tsx
<AnimatedCounter 
  value={100.5} 
  format="currency" 
  currency="CTC" 
  decimals={2} 
/>
// Output: 100.50 CTC
```

### Percentage Counter

```tsx
<AnimatedCounter 
  value={75.5} 
  format="percentage" 
  decimals={1} 
/>
// Output: 75.5%
```

### Compact Notation

```tsx
<AnimatedCounter 
  value={1500000} 
  format="compact" 
  decimals={1} 
/>
// Output: 1.5M
```

### With Prefix and Suffix

```tsx
<AnimatedCounter 
  value={42} 
  prefix="+" 
  suffix=" items" 
/>
// Output: +42 items
```

## Specialized Components

For convenience, we provide specialized counter components:

### CurrencyCounter

```tsx
import { CurrencyCounter } from '@/components/shared';

<CurrencyCounter value={100.5} currency="CTC" />
// Output: 100.50 CTC
```

### PercentageCounter

```tsx
import { PercentageCounter } from '@/components/shared';

<PercentageCounter value={75.5} />
// Output: 75.5%
```

### CompactCounter

```tsx
import { CompactCounter } from '@/components/shared';

<CompactCounter value={1500000} />
// Output: 1.5M
```

### IntegerCounter

```tsx
import { IntegerCounter } from '@/components/shared';

<IntegerCounter value={1234.56} />
// Output: 1,234
```

## Props

### AnimatedCounterProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | **required** | The target value to animate to |
| `duration` | `number` | `1000` | Animation duration in milliseconds |
| `format` | `NumberFormat` | `'default'` | Number formatting type |
| `currency` | `string` | `'CTC'` | Currency symbol (used when format is 'currency') |
| `decimals` | `number` | `0` | Number of decimal places |
| `prefix` | `string` | `''` | Prefix to display before the number |
| `suffix` | `string` | `''` | Suffix to display after the number |
| `className` | `string` | `''` | Custom className for styling |
| `ease` | `'linear' \| 'easeIn' \| 'easeOut' \| 'easeInOut'` | `'easeOut'` | Easing function |

### NumberFormat Type

```typescript
type NumberFormat = 'default' | 'currency' | 'percentage' | 'decimal' | 'compact';
```

- **default**: Comma-separated integer (e.g., 1,234)
- **currency**: Number with currency symbol (e.g., 100.50 CTC)
- **percentage**: Number with percentage sign (e.g., 75.5%)
- **decimal**: Fixed decimal places (e.g., 3.14)
- **compact**: Compact notation with K/M/B suffixes (e.g., 1.5M)

## Real-World Examples

### Stats Dashboard

```tsx
import { AnimatedCounter, CurrencyCounter, PercentageCounter } from '@/components/shared';

function StatsDashboard({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatedCounter 
            value={stats.totalInvoices} 
            className="text-3xl font-bold"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyCounter 
            value={stats.totalVolume} 
            className="text-3xl font-bold"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <PercentageCounter 
            value={stats.successRate} 
            className="text-3xl font-bold text-green-600"
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Landing Page Statistics

```tsx
import { CompactCounter } from '@/components/shared';

function LandingStats({ platformStats }) {
  return (
    <section className="py-12 bg-muted">
      <div className="container">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <CompactCounter 
              value={platformStats.totalInvoices}
              className="text-4xl font-bold"
              duration={1500}
            />
            <p className="text-muted-foreground mt-2">Total Invoices</p>
          </div>
          
          <div>
            <CompactCounter 
              value={platformStats.totalVolume}
              className="text-4xl font-bold"
              duration={1500}
            />
            <p className="text-muted-foreground mt-2">Total Volume</p>
          </div>
          
          <div>
            <CompactCounter 
              value={platformStats.activeInvestments}
              className="text-4xl font-bold"
              duration={1500}
            />
            <p className="text-muted-foreground mt-2">Active Investments</p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Portfolio Summary

```tsx
import { CurrencyCounter, PercentageCounter } from '@/components/shared';

function PortfolioSummary({ portfolio }) {
  const roiColor = portfolio.roi >= 0 ? 'text-green-600' : 'text-red-600';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Invested</span>
          <CurrencyCounter 
            value={portfolio.totalInvested}
            className="font-semibold"
          />
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Returned</span>
          <CurrencyCounter 
            value={portfolio.totalReturned}
            className="font-semibold"
          />
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">ROI</span>
          <PercentageCounter 
            value={portfolio.roi}
            className={`font-semibold ${roiColor}`}
            prefix={portfolio.roi > 0 ? '+' : ''}
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

### Credit Score Display

```tsx
import { AnimatedCounter } from '@/components/shared';

function CreditScoreCard({ score }) {
  const scoreColor = 
    score >= 750 ? 'text-green-600' :
    score >= 500 ? 'text-yellow-600' :
    'text-red-600';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Score</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <AnimatedCounter 
          value={score}
          className={`text-5xl font-bold ${scoreColor}`}
          duration={1500}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Range: 300-850
        </p>
      </CardContent>
    </Card>
  );
}
```

## Animation Behavior

### Smooth Transitions

The component uses Framer Motion's spring animation for smooth, natural-looking transitions:

```tsx
// Slow animation
<AnimatedCounter value={count} duration={2000} />

// Fast animation
<AnimatedCounter value={count} duration={500} />
```

### Reduced Motion Support

The component automatically respects the user's `prefers-reduced-motion` setting:

- When enabled: Numbers update instantly without animation
- When disabled: Full spring animation is applied

This ensures accessibility for users who prefer reduced motion.

## Styling

The component accepts a `className` prop for custom styling:

```tsx
<AnimatedCounter 
  value={1234}
  className="text-4xl font-bold text-primary"
/>
```

You can also wrap it in styled containers:

```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg">
  <AnimatedCounter 
    value={stats.value}
    className="text-white text-3xl font-bold"
  />
</div>
```

## Performance Considerations

- The component uses Framer Motion's `useSpring` hook for efficient animations
- Only the displayed value updates during animation, not the entire component
- Animations are automatically disabled when `prefers-reduced-motion` is set
- The component is optimized for frequent value updates

## Testing

The component includes comprehensive unit tests covering:

- Basic rendering with different formats
- Number formatting accuracy
- Specialized counter components
- Edge cases (zero, negative, very large numbers)
- Accessibility features
- Props validation

Run tests with:

```bash
npm test animated-counter.test.tsx
```

## Requirements Validation

This component satisfies the following requirements from the Frontend Redesign spec:

- **Requirement 1.7**: Platform displays live statistics with animated counters
- **Requirement 12.4**: Data updates animate with counting animations

## Related Components

- `LoadingSkeleton` - For loading states
- `EmptyState` - For empty data states
- `Card` - For containing counter displays

## Troubleshooting

### Counter not animating

1. Check if `prefers-reduced-motion` is enabled in your system settings
2. Verify Framer Motion is properly installed
3. Ensure the `value` prop is changing

### Incorrect formatting

1. Verify the `format` prop is set correctly
2. Check the `decimals` prop matches your needs
3. For currency, ensure the `currency` prop is set

### Performance issues

1. Reduce the `duration` for faster animations
2. Use `IntegerCounter` instead of decimal formats when possible
3. Avoid updating values too frequently (debounce if needed)

## Future Enhancements

Potential improvements for future versions:

- [ ] Support for custom number locales
- [ ] Configurable spring stiffness and damping
- [ ] Support for animating from a specific start value
- [ ] Callback functions for animation start/end
- [ ] Support for custom formatting functions

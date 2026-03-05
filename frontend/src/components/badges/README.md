# Badge Components

This directory contains reusable badge components for the Creditcoin Invoice Financing Platform.

## Components

### InvoiceStateBadge

Displays the state of an invoice with appropriate color coding.

**Color Coding:**
- Pending: Blue
- Funded: Yellow
- Repaid: Green
- Defaulted: Red

**Usage:**

```tsx
import { InvoiceStateBadge } from '@/components/badges';
import { InvoiceState } from '@/types';

function MyComponent() {
  return (
    <div>
      <InvoiceStateBadge state={InvoiceState.Pending} />
      <InvoiceStateBadge state={InvoiceState.Funded} />
      <InvoiceStateBadge state={InvoiceState.Repaid} />
      <InvoiceStateBadge state={InvoiceState.Defaulted} />
    </div>
  );
}
```

### CreditScoreBadge

Displays a credit score with color coding based on score ranges.

**Score Ranges:**
- 750+: Green (Excellent)
- 500-749: Yellow (Good)
- 300-499: Red (Fair)

**Props:**
- `score` (number, required): The credit score to display (300-850)
- `showIcon` (boolean, optional): Whether to show the trend icon (default: true)
- `className` (string, optional): Additional CSS classes

**Usage:**

```tsx
import { CreditScoreBadge } from '@/components/badges';

function MyComponent() {
  return (
    <div>
      <CreditScoreBadge score={800} />
      <CreditScoreBadge score={650} />
      <CreditScoreBadge score={400} />
      <CreditScoreBadge score={750} showIcon={false} />
    </div>
  );
}
```

## Features

- **Color Coding**: Both badges use consistent color coding based on state/score
- **Hover Effects**: Smooth hover transitions for better UX
- **Icons**: CreditScoreBadge includes optional trend icons
- **Accessibility**: Proper semantic HTML and ARIA attributes
- **Customizable**: Both components accept className prop for custom styling
- **Type Safe**: Full TypeScript support with proper types

## Design Requirements

These components fulfill the following requirements from the Frontend Redesign spec:

- **Requirement 3.7**: Invoice state badges with color coding
- **Requirement 4.4**: Credit score indicators with color coding
- **Requirement 6.2**: Badge components with appropriate styling

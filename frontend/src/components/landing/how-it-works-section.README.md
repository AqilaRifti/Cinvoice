# HowItWorksSection Component

## Overview

The `HowItWorksSection` component displays a step-by-step guide for how the Creditcoin Invoice Financing Platform works for different user roles (SMB, Investor, Admin). It features a tabbed interface with smooth animations and responsive layouts.

## Features

- **Role-based Tabs**: Switch between SMB, Investor, and Admin workflows
- **Step-by-step Flow**: Visual representation of the process for each role
- **Responsive Layout**: 
  - Desktop: Horizontal flow with arrow connectors
  - Mobile/Tablet: Vertical flow with arrow connectors
- **Smooth Animations**: 
  - Fade-in on scroll into view
  - Staggered step animations when switching tabs
  - Icon animations with spring physics
- **Visual Indicators**:
  - Numbered step badges
  - Color-coded icons for each step
  - Arrow connectors between steps

## Usage

```tsx
import { HowItWorksSection } from '@/components/landing';

export default function LandingPage() {
  return (
    <div>
      <HowItWorksSection />
    </div>
  );
}
```

## Component Structure

### Main Component
- `HowItWorksSection`: Main container with section header and tabs

### Sub-components
- `RoleSteps`: Renders the steps for a specific role with responsive layout
- `StepCard`: Individual step card with icon, title, and description

## Role Workflows

### SMB (Small & Medium Business)
1. **Upload Invoice**: Upload invoice PDF and enter details
2. **Tokenize**: Invoice is minted as an NFT on blockchain
3. **Get Funded**: Investors purchase the invoice NFT
4. **Repay**: Repay full face value to maintain credit score

### Investor
1. **Browse Marketplace**: Explore available invoice NFTs
2. **Assess Risk**: Review credit scores and repayment history
3. **Invest**: Purchase invoice NFTs at a discount
4. **Earn Returns**: Receive full face value when SMB repays

### Admin
1. **Monitor Platform**: Track platform health and metrics
2. **Create Proposals**: Propose platform changes
3. **Multi-Sig Approval**: Require 2 of 3 admin approvals
4. **Execute Actions**: Execute approved proposals on-chain

## Styling

The component uses:
- Tailwind CSS for responsive layouts
- shadcn-ui components (Card, Tabs)
- Framer Motion for animations
- Lucide icons for visual elements

## Animations

### Scroll Animations
- Section header fades in when scrolling into view
- Uses `useInView` hook with `-100px` margin for early trigger

### Tab Switching
- Steps fade in with staggered delays (0.1s per step)
- Icons animate with spring physics (scale + rotate)
- Smooth transitions between tabs

### Hover Effects
- Cards have border color transitions on hover
- Maintains accessibility with visible focus states

## Responsive Behavior

### Desktop (≥1024px)
- 4-column grid layout
- Horizontal arrow connectors between steps
- Full step descriptions visible

### Mobile/Tablet (<1024px)
- Vertical stack layout
- Vertical arrow connectors (rotated 90°)
- Full step descriptions visible
- Tab labels show role description on sm+ screens

## Accessibility

- Semantic HTML structure
- Keyboard navigable tabs
- ARIA labels from shadcn-ui Tabs component
- Color-coded icons with descriptive text
- Sufficient color contrast for WCAG AA compliance

## Requirements Validation

This component satisfies:
- **Requirement 1.5**: "THE Platform SHALL display a 'How It Works' section with step-by-step visual flow diagrams for each user role"
- **Task 7.4**: 
  - ✅ Implement HowItWorksSection with step-by-step flow
  - ✅ Add tab component for role selection
  - ✅ Make responsive (vertical mobile, horizontal desktop)

## Dependencies

- `framer-motion`: Animation library
- `lucide-react`: Icon library
- `@/components/ui/card`: Card component
- `@/components/ui/tabs`: Tabs component
- `@/lib/utils`: Utility functions (cn)

## Future Enhancements

- Add interactive tooltips with more details
- Include video tutorials for each role
- Add "Try Demo" buttons for each workflow
- Integrate with actual user onboarding flow
- Add analytics tracking for tab interactions

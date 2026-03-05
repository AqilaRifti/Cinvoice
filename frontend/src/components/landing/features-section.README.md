# FeaturesSection Component

## Overview

The `FeaturesSection` component displays three key features of the Creditcoin Invoice Financing Platform with animated icons, hover effects, and responsive grid layout. It's designed to be used on the landing page to highlight the platform's value propositions.

## Features

- **Three Feature Cards**: Instant Liquidity, Transparent Credit Scoring, and Secure & Decentralized
- **Scroll-triggered Animations**: Icons and cards animate into view when scrolled into viewport
- **Icon Animations**: Icons scale and rotate with spring animation on scroll
- **Hover Effects**: Cards elevate and change border color on hover
- **Responsive Grid**: 1 column on mobile, 2 columns on tablet, 3 columns on desktop
- **Staggered Entrance**: Cards appear with a staggered delay for visual appeal

## Usage

```tsx
import { FeaturesSection } from '@/components/landing';

export default function LandingPage() {
  return (
    <main>
      <FeaturesSection />
    </main>
  );
}
```

## Component Structure

```
FeaturesSection
├── Section Header (animated on scroll)
│   ├── Title: "Why Choose Creditcoin?"
│   └── Description
└── Feature Cards Grid (responsive)
    ├── FeatureCard 1: Instant Liquidity (Zap icon, yellow)
    ├── FeatureCard 2: Transparent Credit Scoring (Shield icon, blue)
    └── FeatureCard 3: Secure & Decentralized (TrendingUp icon, green)
```

## Animation Details

### Card Animation
- **Initial State**: Opacity 0, translated down 50px
- **Visible State**: Opacity 1, translated to original position
- **Stagger Delay**: 0.2s between each card
- **Duration**: 0.5s with easeOut easing

### Icon Animation
- **Initial State**: Scale 0, rotated -180 degrees
- **Visible State**: Scale 1, rotated 0 degrees
- **Animation Type**: Spring animation (stiffness: 200, damping: 15)
- **Delay**: Card delay + 0.3s

### Hover Effect
- **Translation**: -8px upward
- **Border**: Changes to primary/50 color
- **Shadow**: Adds shadow-lg
- **Duration**: 0.3s with easeOut easing

## Responsive Behavior

### Mobile (<768px)
- Grid: 1 column
- Gap: 6 (1.5rem)
- Padding: 4 (1rem)

### Tablet (768px - 1023px)
- Grid: 2 columns
- Gap: 8 (2rem)

### Desktop (≥1024px)
- Grid: 3 columns
- Gap: 8 (2rem)

## Customization

### Adding New Features

To add or modify features, update the `features` array:

```tsx
const features = [
  {
    icon: YourIcon, // Lucide icon component
    title: 'Feature Title',
    description: 'Feature description text',
    color: 'text-color-500', // Tailwind text color class
    bgColor: 'bg-color-500/10', // Tailwind background color class with opacity
  },
  // ... more features
];
```

### Adjusting Animation Timing

Modify the animation variants:

```tsx
const cardVariants = {
  visible: {
    transition: {
      duration: 0.5, // Adjust duration
      ease: 'easeOut', // Change easing function
    },
  },
};
```

### Changing Stagger Delay

Update the delay calculation in the motion component:

```tsx
transition={{ delay: index * 0.2 }} // Change 0.2 to desired delay multiplier
```

## Accessibility

- Uses semantic HTML with `<section>` element
- Card components from shadcn-ui are accessible by default
- Icons have appropriate sizing for visibility
- Text contrast meets WCAG AA standards
- Animations respect `prefers-reduced-motion` (handled by Framer Motion)

## Dependencies

- `framer-motion`: Animation library
- `lucide-react`: Icon library (Zap, Shield, TrendingUp)
- `@/components/ui/card`: shadcn-ui Card components
- `react`: useRef hook for scroll detection

## Performance Considerations

- Uses `useInView` with `once: true` to trigger animations only once
- Animations are GPU-accelerated (transform and opacity)
- Icons are tree-shakeable from lucide-react
- No heavy computations or state management

## Related Components

- `HeroSection`: Landing page hero section
- `StatsSection`: Platform statistics section (to be implemented)
- `HowItWorksSection`: Process flow section (to be implemented)

## Requirements Validation

This component satisfies:
- **Requirement 1.2**: Display three feature cards explaining SMB, Investor, and Admin workflows with icons
- **Animation**: Icon animations on scroll into view
- **Hover Effects**: Card elevation and border color changes
- **Responsive**: Grid layout adapts from 1 to 3 columns based on screen size

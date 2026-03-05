# Hero Section Component

## Overview

The `HeroSection` component is the primary landing page component that creates an engaging first impression for visitors. It features an animated gradient background, typewriter effect headline, and three prominent CTA buttons with hover animations.

## Features

### 1. Animated Gradient Background
- Uses Framer Motion to animate a gradient background
- Smooth transition between colors creates a dynamic, modern feel
- Background moves continuously in a loop (10-second cycle)
- Decorative blur elements add depth

### 2. Typewriter Effect Headline
- Main headline "Decentralized Invoice Financing" types out character by character
- Includes animated cursor (pulsing pipe character)
- Typing speed: 100ms per character
- Creates engaging, attention-grabbing effect

### 3. Three CTA Buttons
Each button has distinct styling and purpose:

1. **Connect Wallet** (Primary)
   - Links to SMB dashboard
   - Primary button style with wallet icon
   - Most prominent call-to-action

2. **Browse Marketplace** (Secondary)
   - Links to investor dashboard
   - Outline variant for secondary emphasis
   - Store icon indicates marketplace

3. **Learn More** (Tertiary)
   - Anchor link to "How It Works" section
   - Ghost variant for subtle presence
   - Book icon suggests educational content

### 4. Hover Animations
All buttons feature:
- Scale up on hover (1.05x)
- Scale down on tap/click (0.95x)
- Arrow icon slides right on hover
- Smooth transitions (200ms duration)

### 5. Responsive Design

**Mobile (<640px)**
- Stacked vertical layout
- Full-width buttons
- Smaller text sizes
- Reduced padding

**Tablet (640px - 1024px)**
- Horizontal button layout
- Medium text sizes
- Balanced spacing

**Desktop (>1024px)**
- Full horizontal layout
- Large text sizes (up to 7xl for headline)
- Maximum visual impact

### 6. Trust Indicators
Three animated status indicators at the bottom:
- Blockchain Secured (green pulse)
- Multi-Sig Governance (blue pulse)
- IPFS Storage (purple pulse)

## Usage

```tsx
import { HeroSection } from '@/components/landing';

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      {/* Other sections */}
    </div>
  );
}
```

## Animation Details

### Gradient Animation
```typescript
{
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  },
  transition: {
    duration: 10,
    ease: 'linear',
    repeat: Infinity,
  },
}
```

### Fade In Up
```typescript
{
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}
```

### Stagger Container
```typescript
{
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}
```

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (h1 for main headline)
- Descriptive button text with icons
- Keyboard navigable
- Screen reader friendly
- Respects reduced motion preferences (via Framer Motion)

## Requirements Satisfied

- ✅ **Requirement 1.1**: Hero section with animated gradient background and clear value proposition headline
- ✅ **Requirement 1.4**: Prominent CTA buttons with hover animations
- ✅ **Requirement 11.1**: Responsive design (stacked mobile, horizontal desktop)
- ✅ **Requirement 12.2**: Staggered entrance animations with fade-in and slide-up
- ✅ **Requirement 12.3**: Button hover effects with scale and color transitions

## Customization

### Adjust Typing Speed
```typescript
const typingSpeed = 100; // Change to desired milliseconds per character
```

### Modify Gradient Colors
```typescript
className="bg-gradient-to-br from-primary/20 via-background to-secondary/20"
// Adjust colors and opacity as needed
```

### Change Animation Duration
```typescript
transition: {
  duration: 10, // Adjust gradient animation speed
}
```

## Dependencies

- `framer-motion`: Animation library
- `lucide-react`: Icon library
- `next/link`: Next.js routing
- `@/components/ui/button`: shadcn-ui Button component

## Performance

- Animations use GPU-accelerated transforms
- Typewriter effect cleans up interval on unmount
- Minimal re-renders with proper React hooks
- Optimized for 60fps animations

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Framer Motion handles animation fallbacks
- Gradient animations work in all modern browsers

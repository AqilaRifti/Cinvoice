# Responsive Layout Implementation

This document describes the responsive layout wrapper components implemented for the Creditcoin Invoice Financing Platform.

## Overview

The responsive layout system provides a seamless experience across all device sizes (mobile, tablet, desktop) with adaptive navigation and layout components.

## Components

### 1. PageContainer (`page-container.tsx`)

The main page wrapper component that provides consistent layout across all pages.

**Features:**
- Consistent page layout with header
- Optional scrollable content area
- Loading state with skeleton
- Access control with fallback
- Mobile-responsive padding (accounts for bottom nav on mobile)

**Usage:**
```tsx
<PageContainer
  pageTitle="Dashboard"
  pageDescription="View your dashboard"
  scrollable={true}
  isloading={false}
>
  {/* Page content */}
</PageContainer>
```

**Mobile Adaptations:**
- Adds extra bottom padding (pb-20) on mobile to account for bottom navigation
- Removes bottom padding on desktop (md:pb-4)

### 2. MobileBottomNav (`mobile-bottom-nav.tsx`)

Bottom navigation bar for mobile devices with key navigation actions.

**Features:**
- Fixed position at bottom of screen
- Icon-based navigation with labels
- Active state highlighting
- Touch-friendly targets (44x44px minimum)
- Only visible on mobile (hidden on md and above)

**Behavior:**
- Shows first 4 navigation items
- Displays icon + truncated label
- Highlights active route
- Touch-optimized with `touch-manipulation` class

**Requirements:** 11.2, 11.6

### 3. MobileDrawer (`mobile-drawer.tsx`)

Drawer menu for mobile navigation with full navigation items.

**Features:**
- Opens from left side
- Full navigation menu
- Active item highlighting
- Theme controls
- Touch-friendly interface

**Usage:**
```tsx
const [open, setOpen] = useState(false);

<MobileDrawer open={open} onOpenChange={setOpen} />
```

**Requirements:** 11.2, 11.8

### 4. HeaderWithMobile (`header-with-mobile.tsx`)

Enhanced header component with mobile drawer integration.

**Features:**
- Shows menu button on mobile to open navigation drawer
- Hides breadcrumbs on mobile (sm breakpoint)
- Hides theme controls on mobile (available in drawer)
- Desktop sidebar trigger hidden on mobile

**Behavior:**
- Mobile (<768px): Shows menu button, hides breadcrumbs and theme controls
- Tablet (768px-1024px): Shows breadcrumbs, hides theme controls
- Desktop (≥1024px): Shows all controls

**Requirements:** 11.2, 11.8

## Responsive Breakpoints

The layout uses Tailwind CSS responsive breakpoints:

- **Mobile**: < 768px (default)
- **Tablet**: ≥ 768px (md)
- **Desktop**: ≥ 1024px (lg)

## Layout Behavior by Screen Size

### Mobile (< 768px)

**Navigation:**
- Sidebar hidden
- Bottom navigation bar visible (fixed at bottom)
- Menu button in header opens drawer

**Layout:**
- Single column layout
- Extra bottom padding for bottom nav
- Simplified header (no breadcrumbs)
- Theme controls in drawer only

### Tablet (768px - 1024px)

**Navigation:**
- Collapsible sidebar (default collapsed)
- No bottom navigation
- Breadcrumbs visible

**Layout:**
- Standard padding
- Full header with breadcrumbs
- Theme controls visible

### Desktop (≥ 1024px)

**Navigation:**
- Full sidebar (collapsible to icon-only)
- No bottom navigation
- Full breadcrumbs

**Layout:**
- Standard padding
- Full header with all controls
- Theme controls visible

## Integration

The responsive layout is integrated in the dashboard layout:

```tsx
// frontend/src/app/dashboard/layout.tsx
<SidebarProvider>
  <AppSidebar /> {/* Hidden on mobile */}
  <SidebarInset>
    <HeaderWithMobile /> {/* Responsive header */}
    {children}
  </SidebarInset>
  <MobileBottomNav /> {/* Only visible on mobile */}
</SidebarProvider>
```

## Touch Targets

All interactive elements on mobile meet the minimum touch target size of 44x44px for accessibility:

```tsx
className='min-h-[44px] min-w-[44px] touch-manipulation'
```

The `touch-manipulation` class improves touch responsiveness by disabling double-tap zoom.

## Accessibility

- All navigation items have proper ARIA labels
- Screen reader text for icon-only buttons
- Keyboard navigation support
- Focus indicators on all interactive elements

## Requirements Satisfied

- **11.2**: Mobile bottom navigation bar instead of sidebar
- **11.3**: Cards stack vertically on mobile, grid on desktop
- **11.6**: Touch targets minimum 44x44px on mobile
- **11.8**: Dialogs display as full-screen sheets on mobile (via Sheet component)

## Future Enhancements

- Add swipe gestures for drawer
- Add haptic feedback on mobile interactions
- Add animation transitions between breakpoints
- Add persistent drawer state in localStorage

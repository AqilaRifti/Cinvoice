# AppSidebar Component

## Overview

The `AppSidebar` component is the main navigation sidebar for the Creditcoin Invoice Financing Platform. It provides a collapsible navigation menu with role-based filtering, active route highlighting, and theme controls.

## Features

### 1. Collapsible Functionality ✅
- **Icon-only mode**: Sidebar can collapse to show only icons
- **Smooth transitions**: Animated collapse/expand with CSS transitions
- **Persistent state**: Sidebar state is managed by the shadcn-ui Sidebar component

### 2. Role-Based Navigation Items ✅
- **Dynamic filtering**: Navigation items are filtered based on user role (Admin, SMB, Investor, Guest)
- **Smart access control**: Uses `useUserRole` hook to determine user permissions
- **Fallback behavior**: Guests see all items but are prompted to connect wallet

### 3. Active Item Highlighting ✅
- **Visual feedback**: Active route is highlighted with accent color
- **Icon animation**: Active item icon scales up (110%) for emphasis
- **Font weight**: Active item text is bold for better visibility

### 4. Icon-Only Mode with Tooltips ✅
- **Contextual tooltips**: Hover over icons to see full navigation item names
- **Keyboard shortcuts**: Tooltips display keyboard shortcuts when available
- **Instant display**: Zero delay for better UX (delayDuration={0})

### 5. Theme Selector at Bottom ✅
- **Theme selection**: Full theme selector in expanded mode
- **Mode toggle**: Light/dark mode toggle in both expanded and collapsed modes
- **Smooth transitions**: Theme changes animate smoothly

## Requirements Mapping

| Requirement | Status | Implementation |
|------------|--------|----------------|
| 2.1 - Collapsible sidebar with role-specific navigation | ✅ | Uses shadcn-ui Sidebar with `collapsible='icon'` prop |
| 2.5 - Highlight active navigation item with accent color | ✅ | Active state with `bg-accent` and icon scale animation |
| 2.6 - Icon-only mode with tooltips on hover | ✅ | TooltipProvider wraps collapsed menu items |
| 2.7 - Theme selector in navigation | ✅ | ThemeSelector and ThemeModeToggle in footer |

## Usage

```tsx
import AppSidebar from '@/components/layout/app-sidebar';

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>{children}</main>
    </SidebarProvider>
  );
}
```

## Component Structure

```
AppSidebar
├── SidebarHeader
│   └── Logo + Title (hidden when collapsed)
├── SidebarContent
│   └── SidebarGroup
│       └── SidebarMenu
│           └── Navigation Items (with tooltips when collapsed)
├── SidebarFooter
│   ├── ThemeSelector (expanded mode)
│   ├── ThemeModeToggle (both modes)
│   └── Separator
└── SidebarRail (resize handle)
```

## Role-Based Filtering

The sidebar uses the `useFilteredNavItems` hook to filter navigation items based on user role:

- **Admin**: Can access all dashboards (Admin, SMB, Investor)
- **SMB**: Can access SMB Dashboard only
- **Investor**: Can access Investor Dashboard only
- **Guest**: Sees all items (will be prompted to connect wallet)

## Styling

### Active State
- Background: `bg-accent`
- Text: `text-accent-foreground`
- Font: `font-medium`
- Icon: `scale-110` transform

### Transitions
- Duration: `200ms`
- Easing: Default CSS easing
- Properties: `all` (background, color, transform)

### Collapsed Mode
- Width: `64px` (icon-only)
- Tooltips: Right-aligned with zero delay
- Theme controls: Centered with tooltip

## Dependencies

- `@/components/ui/sidebar` - Base sidebar components
- `@/components/ui/separator` - Visual separator
- `@/components/ui/tooltip` - Tooltip components
- `@/components/themes/theme-selector` - Theme selection
- `@/components/themes/theme-mode-toggle` - Light/dark toggle
- `@/hooks/use-nav` - Role-based filtering
- `next/navigation` - Pathname detection

## Accessibility

- **Keyboard navigation**: All items are keyboard accessible
- **Screen readers**: Icon-only mode includes `sr-only` labels
- **Focus indicators**: Visible focus states on all interactive elements
- **ARIA labels**: Proper labeling for assistive technologies

## Performance

- **Memoization**: Navigation items are memoized in `useFilteredNavItems`
- **Conditional rendering**: Only renders necessary elements based on collapsed state
- **Optimized re-renders**: Uses React hooks efficiently

## Future Enhancements

1. **Badge notifications**: Add notification badges for pending actions
2. **Nested navigation**: Support for sub-menu items
3. **Search integration**: Quick search within navigation
4. **Customizable shortcuts**: User-defined keyboard shortcuts
5. **Recent items**: Show recently accessed pages

## Testing

To test the AppSidebar component:

1. **Visual Testing**:
   - Toggle sidebar collapse/expand
   - Navigate between different routes
   - Switch themes and modes
   - Test on mobile/tablet/desktop

2. **Role Testing**:
   - Connect as Admin (should see all dashboards)
   - Connect as SMB (should see SMB dashboard only)
   - Connect as Investor (should see Investor dashboard only)
   - Disconnect wallet (should see all items as guest)

3. **Interaction Testing**:
   - Hover over icons in collapsed mode (tooltips should appear)
   - Click navigation items (should navigate correctly)
   - Active route should be highlighted
   - Theme controls should work in both modes

## Related Components

- `Header` - Top navigation bar
- `PageContainer` - Main content wrapper
- `ThemeSelector` - Theme selection dropdown
- `ThemeModeToggle` - Light/dark mode toggle
- `WalletConnectButton` - Wallet connection (moved to Header)

## Notes

- The WalletConnectButton has been moved to the Header component for better UX
- The sidebar uses the shadcn-ui Sidebar component which handles state management
- Role-based filtering is implemented in the `useFilteredNavItems` hook
- Theme controls are always visible in the footer for easy access

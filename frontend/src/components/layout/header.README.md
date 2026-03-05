# Header Component

The Header component is the main navigation bar at the top of the application, providing access to key features and user controls.

## Features

### 1. Sidebar Trigger
- Toggles the sidebar open/closed
- Responsive behavior for mobile and desktop

### 2. Breadcrumbs Navigation
- Dynamic breadcrumb generation based on current route
- Clickable navigation links to parent pages
- Hidden on mobile to save space

### 3. Search Input
- Global search functionality
- Hidden on mobile (< md breakpoint)
- Accessible via command palette (Cmd+K)

### 4. Network Status Badge
- Shows current blockchain network
- Visual indicator for correct/wrong network
- Green badge with checkmark for Creditcoin Testnet
- Red badge with alert icon for wrong network
- Responsive text (full name on desktop, abbreviated on mobile)

### 5. Wallet Connection
- RainbowKit integration for wallet connection
- Dropdown menu with wallet actions:
  - Copy wallet address to clipboard
  - View wallet on block explorer
  - Disconnect wallet
- Shows wallet address and balance
- Responsive display (truncated on mobile)

### 6. Theme Controls
- Theme mode toggle (light/dark)
- Theme selector (claude, mono, neobrutualism, notebook, supabase, vercel)

### 7. GitHub CTA
- Link to project repository

## Component Structure

```tsx
<Header>
  <LeftSection>
    <SidebarTrigger />
    <Separator />
    <Breadcrumbs />
  </LeftSection>
  
  <RightSection>
    <CtaGithub />
    <SearchInput />
    <NetworkStatusBadge />
    <UserNav>
      <WalletConnectButton>
        <DropdownMenu>
          - Copy Address
          - View on Explorer
          - Disconnect
        </DropdownMenu>
      </WalletConnectButton>
    </UserNav>
    <ThemeModeToggle />
    <ThemeSelector />
  </RightSection>
</Header>
```

## Requirements Satisfied

- **Requirement 2.2**: Breadcrumbs navigation showing current location hierarchy ✓
- **Requirement 2.4**: Wallet address and network status display ✓
- **Requirement 13.4**: Theme toggle for light/dark mode ✓
- **Requirement 19.3**: Wallet connection status with address and network ✓

## Responsive Behavior

### Desktop (≥1024px)
- Full breadcrumbs visible
- Search input visible
- Full network name displayed
- Full wallet address and balance shown

### Tablet (768px - 1023px)
- Breadcrumbs visible
- Search input hidden (use Cmd+K)
- Network name abbreviated
- Wallet address truncated

### Mobile (<768px)
- Breadcrumbs hidden (page title only)
- Search input hidden (use Cmd+K)
- Network name abbreviated to "CTC"
- Wallet address truncated to first 6 characters

## Usage

The Header component is automatically included in the dashboard layout:

```tsx
// app/dashboard/layout.tsx
import Header from '@/components/layout/header';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}
```

## Dependencies

- `@rainbow-me/rainbowkit` - Wallet connection UI
- `wagmi` - Ethereum hooks
- `sonner` - Toast notifications
- `@tabler/icons-react` - Icons
- `shadcn-ui` - UI components (Badge, Button, DropdownMenu, etc.)

## Related Components

- `NetworkStatusBadge` - Network indicator badge
- `WalletConnectButton` - Wallet connection with dropdown
- `Breadcrumbs` - Dynamic breadcrumb navigation
- `ThemeSelector` - Theme selection dropdown
- `ThemeModeToggle` - Light/dark mode toggle
- `UserNav` - User navigation wrapper

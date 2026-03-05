# Command Palette

A powerful command palette component built with shadcn-ui Command component for quick navigation and search functionality.

## Features

- **Keyboard Shortcut**: Trigger with `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- **Navigation Shortcuts**: Quick access to all major dashboard pages
- **Search Functionality**: Real-time search across navigation items and quick actions
- **Visual Indicators**: Tabler icons for better visual recognition
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Quick Actions**: Predefined actions for common tasks

## Usage

The command palette is automatically available in the dashboard layout. Users can:

1. Press `Cmd+K` (or `Ctrl+K`) to open the command palette
2. Click the search button in the header
3. Type to search for pages or actions
4. Use arrow keys to navigate results
5. Press `Enter` to select an action

## Components

### CommandPalette

Main component that renders the command palette dialog.

```tsx
<CommandPalette open={open} onOpenChange={setOpen} />
```

**Props:**
- `open`: boolean - Controls the visibility of the command palette
- `onOpenChange`: (open: boolean) => void - Callback when the open state changes

### CommandPaletteProvider

Provider component that handles keyboard shortcuts and manages state.

```tsx
<CommandPaletteProvider>
  {children}
</CommandPaletteProvider>
```

## Navigation Items

The command palette displays navigation items from `@/config/nav-config.ts`:

- **SMB Dashboard** - Access SMB features (shortcut: `s s`)
- **Investor Dashboard** - Access investor features (shortcut: `i i`)
- **Admin Dashboard** - Access admin features (shortcut: `a a`)

## Quick Actions

Predefined quick actions for common tasks:

- **Go to Home** (`⌘H`) - Navigate to landing page
- **Create Invoice** (`⌘N`) - Go to SMB dashboard to create invoice
- **Browse Marketplace** (`⌘M`) - View available invoices
- **View Portfolio** (`⌘P`) - Check investment portfolio
- **Platform Analytics** (`⌘A`) - View platform statistics

## Search Functionality

The command palette includes intelligent search that:

- Searches across navigation item titles
- Searches across quick action titles and keywords
- Filters results in real-time as you type
- Highlights matching items

### Search Keywords

Quick actions include keywords for better discoverability:

- "home landing page" → Go to Home
- "new invoice mint create smb" → Create Invoice
- "marketplace invest buy invoices" → Browse Marketplace
- "portfolio investments my invoices" → View Portfolio
- "analytics stats metrics admin" → Platform Analytics

## Icons

The command palette uses Tabler Icons for visual indicators:

- `IconDashboard` - Dashboard pages
- `IconBriefcase` - Workspace/Investor
- `IconShieldCheck` - Admin/Account
- `IconFileInvoice` - Invoices
- `IconShoppingCart` - Marketplace
- `IconWallet` - Portfolio
- `IconChartBar` - Analytics
- `IconHome` - Home page
- `IconPlus` - Create actions

## Accessibility

- Full keyboard navigation support
- ARIA labels for screen readers
- Focus management
- Escape key to close
- Visible focus indicators

## Integration

The command palette is integrated into the dashboard layout at:
- `frontend/src/app/dashboard/layout.tsx`

The search button in the header triggers the command palette:
- `frontend/src/components/search-input.tsx`

## Customization

To add new navigation items:

1. Update `@/config/nav-config.ts` with new nav items
2. Add corresponding icon mapping in `command-palette.tsx`
3. Icons will automatically appear in the command palette

To add new quick actions:

1. Edit the `quickActions` array in `command-palette.tsx`
2. Add title, icon, action callback, shortcut, and keywords
3. The action will automatically be searchable

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 2.3**: Command palette with Cmd+K trigger using shadcn-ui Command component
- **Requirement 14.9**: Keyboard shortcuts for common actions
- **Requirement 18.1**: Global search functionality
- **Requirement 18.2**: Real-time filtering with debouncing

## Technical Details

- Built with `cmdk` library (powers shadcn-ui Command)
- Uses Next.js `useRouter` for navigation
- Integrates with existing navigation configuration
- Responsive and mobile-friendly
- Theme-aware styling

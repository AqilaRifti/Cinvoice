# Web3 Provider Setup

## Overview

The Web3 provider setup integrates RainbowKit, wagmi, and TanStack Query to provide blockchain functionality, wallet connection, and state management for the Creditcoin Invoice Financing Platform.

## Architecture

```
Web3Provider
├── WagmiProvider (blockchain connection)
│   └── config (Creditcoin Testnet)
├── QueryClientProvider (state management)
│   └── queryClient (centralized configuration)
└── RainbowKitProvider (wallet UI)
    ├── Custom theming (matches active theme)
    └── EventListener (contract event subscriptions)
```

## Components

### Web3Provider

Main provider component that wraps the application with all necessary Web3 providers.

**Location**: `frontend/src/components/providers/web3-provider.tsx`

**Features**:
- Wagmi provider with Creditcoin Testnet configuration
- TanStack Query provider with centralized query client
- RainbowKit provider with custom theming
- Event listener for real-time contract updates

### Custom RainbowKit Theming

The `useRainbowKitTheme` hook creates a custom RainbowKit theme that matches the active application theme (vercel, claude, supabase, etc.) and respects light/dark mode.

**Theme Mapping**:
- `--primary` → accentColor
- `--card` → modal backgrounds
- `--border` → borders and dividers
- `--destructive` → error states
- `--radius` → border radius
- `--font-sans` → typography

**Supported Themes**:
- Claude
- Mono
- Neobrutualism
- Notebook
- Supabase
- Vercel

### EventListener Component

Subscribes to contract events and provides real-time UI updates.

**Monitored Events**:
- `InvoiceMinted` - New invoice created
- `InvoiceStateChanged` - Invoice state updated
- `InvoicePurchased` - Invoice purchased by investor
- `InvoiceRepaid` - Invoice repaid by SMB
- `InvoiceDefaulted` - Invoice defaulted

**Behavior**:
- Shows toast notifications for events
- Invalidates relevant TanStack Query caches
- Triggers automatic UI refresh

## Configuration

### Wagmi Config

**Location**: `frontend/src/lib/wagmi.ts`

**Chain**: Creditcoin Testnet (Chain ID: 102031)

**Features**:
- RPC endpoint: `https://rpc.cc3-testnet.creditcoin.network`
- Block explorer: `https://explorer.testnet.creditcoin.org`
- Wallet providers: MetaMask, WalletConnect, Coinbase Wallet
- SSR support enabled

### Query Client Config

**Location**: `frontend/src/lib/query-client.ts`

**Settings**:
- Stale time: 30 seconds
- Cache time: 5 minutes
- Refetch on window focus: disabled
- Retry: 1 attempt
- Query key factory for consistent cache management

## Usage

### In Layout

```tsx
import { Web3Provider } from '@/components/providers/web3-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
```

### Wallet Connection

```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header>
      <ConnectButton />
    </header>
  );
}
```

### Contract Interactions

```tsx
import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES, INVOICE_NFT_ABI } from '@/lib/contracts';

export function MyComponent() {
  // Read from contract
  const { data } = useReadContract({
    address: CONTRACT_ADDRESSES.InvoiceNFT,
    abi: INVOICE_NFT_ABI,
    functionName: 'nextTokenId',
  });

  // Write to contract
  const { writeContract } = useWriteContract();
  
  const mintInvoice = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.InvoiceNFT,
      abi: INVOICE_NFT_ABI,
      functionName: 'mintInvoice',
      args: [metadataURI, faceValue, repaymentDate],
    });
  };
}
```

### Query Caching

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

export function MyComponent() {
  const queryClient = useQueryClient();
  
  // Fetch with caching
  const { data } = useQuery({
    queryKey: queryKeys.invoices.all,
    queryFn: fetchInvoices,
  });
  
  // Invalidate cache after mutation
  const handleSuccess = () => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.invoices.all 
    });
  };
}
```

## Event Handling

Contract events automatically trigger:
1. Toast notifications to inform users
2. Query cache invalidation for affected data
3. UI re-renders with fresh data

Example event flow:
```
User mints invoice
  ↓
Transaction confirmed
  ↓
InvoiceMinted event emitted
  ↓
EventListener catches event
  ↓
Toast notification shown
  ↓
Invoice queries invalidated
  ↓
UI refreshes with new invoice
```

## Theme Integration

RainbowKit automatically adapts to:
- Active theme (vercel, claude, etc.)
- Light/dark mode preference
- CSS custom properties from theme files

The theme updates in real-time when users switch themes or toggle light/dark mode.

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 19.1**: RainbowKit for wallet connection with custom theming
- **Requirement 17.1**: wagmi hooks for all contract interactions
- **Requirement 17.2**: TanStack Query for caching and state management
- **Requirement 17.4**: Contract event listeners for real-time updates

## Testing

To test the Web3 provider setup:

1. **Wallet Connection**:
   - Click "Connect Wallet" button
   - Select wallet provider
   - Approve connection
   - Verify network is Creditcoin Testnet

2. **Theme Switching**:
   - Switch between themes
   - Toggle light/dark mode
   - Verify RainbowKit modal matches theme

3. **Event Listening**:
   - Mint an invoice
   - Verify toast notification appears
   - Verify invoice list updates automatically

4. **Query Caching**:
   - Load data
   - Navigate away and back
   - Verify data loads from cache (instant)
   - Wait 30 seconds
   - Verify data refetches (stale time)

## Troubleshooting

### Wallet Not Connecting

- Verify Creditcoin Testnet is added to wallet
- Check RPC endpoint is accessible
- Ensure wallet has CTC for gas fees

### Theme Not Applying

- Check browser console for CSS variable errors
- Verify theme CSS files are imported
- Clear browser cache and reload

### Events Not Firing

- Verify contract addresses are correct
- Check network connection
- Ensure wallet is connected
- Look for errors in browser console

## Future Enhancements

Potential improvements for future iterations:

1. **Advanced Theme Mapping**: Better oklch to RGB conversion for theme colors
2. **Transaction History**: Show recent transactions in RainbowKit
3. **Custom Wallet List**: Prioritize specific wallets for Creditcoin
4. **Network Switching**: Auto-prompt to switch to Creditcoin Testnet
5. **Event Filtering**: Allow users to configure which events trigger notifications

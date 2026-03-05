# FinancingPool Hooks

This module provides React hooks for interacting with the FinancingPool smart contract. It includes hooks for purchasing invoices, repaying invoices, querying investment data, and listening to contract events.

## Hooks Overview

### Mutation Hooks
- `usePurchaseInvoice()` - Purchase an invoice NFT
- `useRepayInvoice()` - Repay an invoice

### Query Hooks
- `usePurchasePrice()` - Calculate purchase price for an invoice
- `useInvestment()` - Get investment details for an invoice
- `usePlatformFee()` - Get the platform fee percentage

### Event Listener Hook
- `useFinancingPoolEvents()` - Listen for FinancingPool contract events

---

## Mutation Hooks

### 1. `usePurchaseInvoice()` - Purchase Invoice Hook

Purchases an invoice NFT from the marketplace.

**Returns:**
- `mutateAsync` - Function to purchase invoice
- `isPending` - Loading state
- `isSuccess` - Success state
- `isError` - Error state
- `error` - Error object

**Example:**

```typescript
import { usePurchaseInvoice } from '@/hooks/use-financing-pool';
import { parseEther } from 'viem';

function InvestButton({ tokenId, smb, purchasePrice }) {
  const { mutateAsync, isPending } = usePurchaseInvoice();

  const handlePurchase = async () => {
    try {
      await mutateAsync({
        tokenId,
        smb,
        purchasePrice: parseEther(purchasePrice),
      });
      toast.success('Invoice purchased successfully!');
    } catch (error) {
      toast.error('Failed to purchase invoice');
    }
  };

  return (
    <button onClick={handlePurchase} disabled={isPending}>
      {isPending ? 'Purchasing...' : 'Invest Now'}
    </button>
  );
}
```

---

### 2. `useRepayInvoice()` - Repay Invoice Hook

Repays an invoice, returning the face value to the investor.

**Returns:**
- `mutateAsync` - Function to repay invoice
- `isPending` - Loading state
- `isSuccess` - Success state
- `isError` - Error state
- `error` - Error object

**Example:**

```typescript
import { useRepayInvoice } from '@/hooks/use-financing-pool';
import { parseEther } from 'viem';

function RepayButton({ tokenId, faceValue }) {
  const { mutateAsync, isPending } = useRepayInvoice();

  const handleRepay = async () => {
    try {
      await mutateAsync({
        tokenId,
        faceValue: parseEther(faceValue),
      });
      toast.success('Invoice repaid successfully!');
    } catch (error) {
      toast.error('Failed to repay invoice');
    }
  };

  return (
    <button onClick={handleRepay} disabled={isPending}>
      {isPending ? 'Repaying...' : 'Repay Now'}
    </button>
  );
}
```

---

## Query Hooks

### 3. `usePurchasePrice()` - Purchase Price Query Hook

Calculates the purchase price for an invoice based on face value and discount rate.

**Parameters:**
- `tokenId` - The token ID of the invoice
- `smb` - The SMB address (owner of the invoice)

**Returns:**
- `purchasePrice` - The calculated purchase price (bigint)
- `isLoading` - Loading state
- `error` - Error object
- `refetch` - Function to manually refetch

**Example:**

```typescript
import { usePurchasePrice } from '@/hooks/use-financing-pool';
import { formatEther } from 'viem';

function InvoiceCard({ tokenId, smb }) {
  const { purchasePrice, isLoading } = usePurchasePrice(tokenId, smb);

  if (isLoading) return <div>Loading price...</div>;

  return (
    <div>
      <p>Purchase Price: {formatEther(purchasePrice || 0n)} CTC</p>
    </div>
  );
}
```

---

### 4. `useInvestment()` - Investment Details Query Hook

Fetches investment details for a specific invoice.

**Parameters:**
- `tokenId` - The token ID of the invoice

**Returns:**
- `investment` - Investment object with investor, purchasePrice, purchaseTimestamp
- `isLoading` - Loading state
- `error` - Error object
- `refetch` - Function to manually refetch

**Example:**

```typescript
import { useInvestment } from '@/hooks/use-financing-pool';
import { formatEther } from 'viem';

function InvestmentDetails({ tokenId }) {
  const { investment, isLoading } = useInvestment(tokenId);

  if (isLoading) return <div>Loading...</div>;
  if (!investment) return <div>No investment found</div>;

  return (
    <div>
      <p>Investor: {investment.investor}</p>
      <p>Purchase Price: {formatEther(investment.purchasePrice)} CTC</p>
      <p>Date: {new Date(investment.purchaseTimestamp * 1000).toLocaleDateString()}</p>
    </div>
  );
}
```

---

### 5. `usePlatformFee()` - Platform Fee Query Hook

Fetches the platform fee percentage (in basis points).

**Returns:**
- `platformFee` - Fee percentage in basis points (e.g., 500 = 5%)
- `isLoading` - Loading state
- `error` - Error object
- `refetch` - Function to manually refetch

**Example:**

```typescript
import { usePlatformFee } from '@/hooks/use-financing-pool';

function PlatformFeeDisplay() {
  const { platformFee, isLoading } = usePlatformFee();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Platform Fee: {(platformFee || 0) / 100}%</p>
    </div>
  );
}
```

---

## Event Listener Hook

### 6. `useFinancingPoolEvents()` - Event Listener Hook

Listens for FinancingPool contract events and updates the UI automatically.

**Events Monitored:**
- `InvoicePurchased` - When an invoice is purchased
- `InvoiceRepaid` - When an invoice is repaid
- `InvoiceDefaulted` - When an invoice is marked as defaulted

**Features:**
- Automatically invalidates relevant queries to trigger refetch
- Shows toast notifications for user feedback
- Updates UI in real-time

**Example:**

```typescript
import { useFinancingPoolEvents } from '@/hooks/use-financing-pool';

function EventListeners() {
  useFinancingPoolEvents();
  return null;
}

// In your app layout or provider:
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>
          <EventListeners />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
```

---

## Complete Example

Here's a complete example showing how to use multiple hooks together:

```typescript
import { 
  usePurchaseInvoice, 
  useRepayInvoice, 
  usePurchasePrice, 
  useInvestment,
  usePlatformFee 
} from '@/hooks/use-financing-pool';
import { useInvoiceDetails } from '@/hooks/use-invoice-nft';
import { formatEther, parseEther } from 'viem';
import { toast } from 'sonner';

function InvoiceDetailPage({ tokenId }) {
  // Fetch invoice details
  const { invoice, isLoading: invoiceLoading } = useInvoiceDetails(tokenId);
  
  // Fetch purchase price
  const { purchasePrice, isLoading: priceLoading } = usePurchasePrice(
    tokenId, 
    invoice?.smb
  );
  
  // Fetch investment details
  const { investment } = useInvestment(tokenId);
  
  // Fetch platform fee
  const { platformFee } = usePlatformFee();
  
  // Purchase mutation
  const { mutateAsync: purchase, isPending: isPurchasing } = usePurchaseInvoice();
  
  // Repay mutation
  const { mutateAsync: repay, isPending: isRepaying } = useRepayInvoice();

  const handlePurchase = async () => {
    if (!invoice || !purchasePrice) return;
    
    try {
      await purchase({
        tokenId,
        smb: invoice.smb,
        purchasePrice,
      });
      toast.success('Invoice purchased successfully!');
    } catch (error) {
      toast.error('Failed to purchase invoice');
    }
  };

  const handleRepay = async () => {
    if (!invoice) return;
    
    try {
      await repay({
        tokenId,
        faceValue: invoice.faceValue,
      });
      toast.success('Invoice repaid successfully!');
    } catch (error) {
      toast.error('Failed to repay invoice');
    }
  };

  if (invoiceLoading || priceLoading) {
    return <div>Loading...</div>;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  const roi = purchasePrice 
    ? ((Number(invoice.faceValue - purchasePrice) / Number(purchasePrice)) * 100).toFixed(2)
    : '0';

  return (
    <div>
      <h1>Invoice #{tokenId}</h1>
      
      <div>
        <h2>Details</h2>
        <p>Face Value: {formatEther(invoice.faceValue)} CTC</p>
        <p>Purchase Price: {formatEther(purchasePrice || 0n)} CTC</p>
        <p>Expected ROI: {roi}%</p>
        <p>Platform Fee: {(platformFee || 0) / 100}%</p>
        <p>State: {['Pending', 'Funded', 'Repaid', 'Defaulted'][invoice.state]}</p>
      </div>

      {investment && (
        <div>
          <h2>Investment</h2>
          <p>Investor: {investment.investor}</p>
          <p>Purchase Price: {formatEther(investment.purchasePrice)} CTC</p>
          <p>Date: {new Date(investment.purchaseTimestamp * 1000).toLocaleDateString()}</p>
        </div>
      )}

      <div>
        {invoice.state === 0 && (
          <button onClick={handlePurchase} disabled={isPurchasing}>
            {isPurchasing ? 'Purchasing...' : 'Invest Now'}
          </button>
        )}
        
        {invoice.state === 1 && (
          <button onClick={handleRepay} disabled={isRepaying}>
            {isRepaying ? 'Repaying...' : 'Repay Now'}
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Best Practices

1. **Error Handling**: Always wrap mutations in try-catch blocks and show user feedback
2. **Loading States**: Use `isPending` to disable buttons and show loading indicators
3. **Query Invalidation**: The hooks automatically invalidate relevant queries after mutations
4. **Event Listening**: Register `useFinancingPoolEvents()` once at the app level
5. **Type Safety**: All hooks are fully typed with TypeScript
6. **Optimistic Updates**: Consider implementing optimistic updates for better UX

---

## Notes

- All hooks use TanStack Query for caching and automatic refetching
- Mutations automatically invalidate relevant queries on success
- Event listeners provide real-time updates across the application
- Purchase price is calculated on-chain based on credit score and discount rate
- Platform fee is applied to all invoice purchases

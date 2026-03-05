# InvoiceNFT Hooks

This file contains React hooks for interacting with the InvoiceNFT smart contract.

## Hooks Overview

### 1. `useMintInvoice()` - Mutation Hook

Mints a new invoice NFT.

**Returns:**
- `mutateAsync`: Function to mint an invoice
- `isPending`: Boolean indicating if the transaction is pending
- `isSuccess`: Boolean indicating if the transaction succeeded
- `error`: Error object if the transaction failed

**Parameters for `mutateAsync`:**
```typescript
{
  metadataURI: string;      // IPFS URI for invoice metadata
  faceValue: bigint;        // Face value in wei
  repaymentDate: bigint;    // Unix timestamp for repayment date
}
```

**Example:**
```typescript
const { mutateAsync, isPending } = useMintInvoice();

await mutateAsync({
  metadataURI: 'ipfs://QmExample...',
  faceValue: parseEther('1000'),
  repaymentDate: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000)
});
```

**Automatic Behavior:**
- Invalidates invoice queries after successful mint
- Invalidates user queries to update balance
- Invalidates platform stats

---

### 2. `useInvoiceDetails(tokenId)` - Query Hook

Fetches details for a specific invoice.

**Parameters:**
- `tokenId: number` - The token ID of the invoice

**Returns:**
```typescript
{
  invoice: Invoice | undefined;  // Invoice data
  isLoading: boolean;            // Loading state
  error: Error | null;           // Error if fetch failed
  refetch: () => void;           // Function to manually refetch
}
```

**Invoice Type:**
```typescript
interface Invoice {
  tokenId: number;
  faceValue: bigint;
  repaymentDate: number;
  smb: `0x${string}`;
  state: InvoiceState;
  metadataURI: string;
  creditScoreAtMinting: number;
}
```

**Example:**
```typescript
const { invoice, isLoading, error } = useInvoiceDetails(1);

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!invoice) return <div>Invoice not found</div>;

return <div>Face Value: {invoice.faceValue.toString()}</div>;
```

**Caching:**
- Stale time: 30 seconds
- Automatically refetches when data becomes stale
- Cached per token ID

---

### 3. `useUserInvoices(address?)` - Query Hook

Fetches all invoices owned by a user.

**Parameters:**
- `address?: `0x${string}`` - Optional user address (defaults to connected wallet)

**Returns:**
```typescript
{
  invoices: Invoice[];      // Array of user's invoices
  balance: number;          // Number of invoices owned
  isLoading: boolean;       // Loading state
  error: Error | null;      // Error if fetch failed
  refetch: () => void;      // Function to manually refetch
}
```

**Example:**
```typescript
// Get current user's invoices
const { invoices, balance, isLoading } = useUserInvoices();

// Get another user's invoices
const { invoices: otherInvoices } = useUserInvoices('0x123...');
```

**Performance Note:**
This hook iterates through all tokens to find user's invoices. In production, consider using:
- Event indexing (The Graph, Moralis, etc.)
- Backend API with database
- Multicall for batch requests

**Caching:**
- Stale time: 30 seconds
- Cached per user address
- Automatically refetches when data becomes stale

---

### 4. `useInvoiceEvents()` - Event Listener Hook

Listens for InvoiceNFT contract events and updates the UI automatically.

**Events Listened:**
1. **InvoiceMinted** - When a new invoice is minted
2. **InvoiceStateChanged** - When an invoice state changes

**Automatic Behavior:**
- Invalidates relevant queries to trigger refetch
- Shows toast notifications for user feedback
- Updates UI in real-time

**Usage:**
This hook should be registered once at the app level (in a provider or layout):

```typescript
function EventListeners() {
  useInvoiceEvents();
  return null;
}

// In your app layout:
function AppLayout({ children }) {
  return (
    <>
      <EventListeners />
      {children}
    </>
  );
}
```

**Toast Notifications:**
- Success toast when invoice is minted
- Info toast when invoice state changes

---

## Integration with TanStack Query

All hooks use TanStack Query for state management and caching. The query keys are defined in `@/lib/query-client.ts`:

```typescript
queryKeys.invoices.detail(tokenId)      // Single invoice
queryKeys.invoices.all                   // All invoices
queryKeys.user.invoices(address)         // User's invoices
queryKeys.platform.stats()               // Platform statistics
```

### Query Invalidation

When mutations succeed, relevant queries are automatically invalidated:

- **After minting:** Invalidates all invoice queries, user queries, and platform stats
- **After state change:** Invalidates specific invoice and invoice lists

This ensures the UI always shows the latest data without manual refetching.

---

## Error Handling

All hooks handle errors gracefully:

1. **Mutation errors** are logged to console
2. **Query errors** are returned in the `error` field
3. **Contract errors** are caught and can be parsed using `parseContractError` from `@/lib/errors`

**Example with error handling:**
```typescript
const { mutateAsync, error } = useMintInvoice();

try {
  await mutateAsync(params);
} catch (err) {
  const message = parseContractError(err);
  toast.error(message);
}
```

---

## Requirements Validation

These hooks satisfy the following requirements from the design document:

- **Requirement 17.1**: Uses wagmi hooks (useReadContract, useWriteContract, useWatchContractEvent)
- **Requirement 17.2**: Wraps contract reads in TanStack Query hooks for caching
- **Requirement 17.3**: Invalidates relevant queries after mutations
- **Requirement 17.4**: Listens for contract events (InvoiceMinted, InvoiceStateChanged)

---

## Testing

See `use-invoice-nft.example.tsx` for complete usage examples including:
- Minting invoices
- Displaying invoice details
- Listing user invoices
- Setting up event listeners
- Complete dashboard component

---

## Related Files

- `@/lib/contracts.ts` - Contract addresses and ABIs
- `@/lib/query-client.ts` - Query keys factory
- `@/lib/wagmi.ts` - Wagmi configuration
- `@/lib/errors.ts` - Error parsing utilities
- `use-invoice-nft.example.tsx` - Usage examples

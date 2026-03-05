# CreditScoreOracle Hooks

This module provides React hooks for interacting with the CreditScoreOracle smart contract. These hooks use wagmi v2 + viem v2 for blockchain interactions and TanStack Query v5 for state management and caching.

## Hooks

### `useCreditScore`

Fetches the credit score for a user (300-850 range).

**Parameters:**
- `address?: `0x${string}`` - Optional user address (defaults to connected wallet)

**Returns:**
- `score: number` - Credit score (defaults to 500 for new users)
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error object if query failed
- `refetch: () => void` - Function to manually refetch the data

**Example:**
```typescript
import { useCreditScore } from '@/hooks/use-credit-score-oracle';

function CreditScoreDisplay() {
  const { score, isLoading } = useCreditScore();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Your credit score: {score}</div>;
}

// Fetch score for a specific address
function UserCreditScore({ address }: { address: `0x${string}` }) {
  const { score } = useCreditScore(address);
  return <div>Credit score: {score}</div>;
}
```

### `useCreditProfile`

Fetches detailed credit profile information for a user.

**Parameters:**
- `address?: `0x${string}`` - Optional user address (defaults to connected wallet)

**Returns:**
- `profile: CreditProfile | null` - Credit profile object or null if not found
  - `score: number` - Credit score
  - `lastUpdated: number` - Timestamp of last update
  - `totalInvoices: number` - Total number of invoices
  - `successfulRepayments: number` - Number of successful repayments
  - `defaults: number` - Number of defaults
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error object if query failed
- `refetch: () => void` - Function to manually refetch the data

**Example:**
```typescript
import { useCreditProfile } from '@/hooks/use-credit-score-oracle';

function CreditProfileCard() {
  const { profile, isLoading } = useCreditProfile();
  
  if (isLoading) return <div>Loading...</div>;
  if (!profile) return <div>No credit profile found</div>;
  
  return (
    <div>
      <h3>Credit Profile</h3>
      <p>Score: {profile.score}</p>
      <p>Total Invoices: {profile.totalInvoices}</p>
      <p>Successful Repayments: {profile.successfulRepayments}</p>
      <p>Defaults: {profile.defaults}</p>
      <p>Last Updated: {new Date(profile.lastUpdated * 1000).toLocaleDateString()}</p>
    </div>
  );
}
```

### `useDiscountRate`

Fetches the discount rate for a user based on their credit score.

**Parameters:**
- `address?: `0x${string}`` - Optional user address (defaults to connected wallet)

**Returns:**
- `discountRate: number` - Discount rate in basis points (e.g., 500 = 5%)
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error object if query failed
- `refetch: () => void` - Function to manually refetch the data

**Example:**
```typescript
import { useDiscountRate } from '@/hooks/use-credit-score-oracle';

function DiscountRateDisplay() {
  const { discountRate, isLoading } = useDiscountRate();
  
  if (isLoading) return <div>Loading...</div>;
  
  const percentage = discountRate / 100; // Convert basis points to percentage
  
  return <div>Your discount rate: {percentage}%</div>;
}

// Calculate purchase price with discount
function InvoicePurchaseCalculator({ faceValue }: { faceValue: bigint }) {
  const { discountRate } = useDiscountRate();
  
  const purchasePrice = faceValue * BigInt(10000 - discountRate) / BigInt(10000);
  
  return (
    <div>
      <p>Face Value: {faceValue.toString()} CTC</p>
      <p>Discount Rate: {discountRate / 100}%</p>
      <p>Purchase Price: {purchasePrice.toString()} CTC</p>
    </div>
  );
}
```

## Features

- **Automatic Caching**: All queries are cached for 30 seconds using TanStack Query
- **Automatic Refetching**: Queries automatically refetch on reconnect
- **Type Safety**: Full TypeScript support with proper types
- **Error Handling**: Graceful error handling with error objects
- **Default Values**: Sensible defaults for new users (score: 500, discountRate: 0)
- **Flexible Address**: Can fetch data for connected wallet or any specific address

## Integration with Other Hooks

These hooks work seamlessly with other contract hooks:

```typescript
import { useCreditScore, useDiscountRate } from '@/hooks/use-credit-score-oracle';
import { useInvoiceDetails } from '@/hooks/use-invoice-nft';
import { usePurchasePrice } from '@/hooks/use-financing-pool';

function InvoiceInvestmentCard({ tokenId }: { tokenId: number }) {
  const { invoice } = useInvoiceDetails(tokenId);
  const { score } = useCreditScore(invoice?.smb);
  const { discountRate } = useDiscountRate(invoice?.smb);
  const { purchasePrice } = usePurchasePrice(tokenId, invoice?.smb);
  
  return (
    <div>
      <h3>Invoice #{tokenId}</h3>
      <p>SMB Credit Score: {score}</p>
      <p>Discount Rate: {discountRate / 100}%</p>
      <p>Purchase Price: {purchasePrice?.toString()} CTC</p>
    </div>
  );
}
```

## Query Keys

The hooks use the following query keys for caching:

- `useCreditScore`: `['user', 'creditScore', address]`
- `useCreditProfile`: `['user', 'creditProfile', address]`
- `useDiscountRate`: `['discountRate', address]`

These keys are defined in `@/lib/query-client` and can be used for manual query invalidation if needed.

## Requirements Satisfied

This implementation satisfies the following requirements from the frontend-redesign spec:

- **Requirement 17.1**: Uses wagmi hooks for all contract interactions
- **Requirement 17.2**: Wraps contract reads in TanStack Query hooks for caching and automatic refetching
- **Requirement 3.1**: Provides credit score display functionality (300-850 range)
- **Requirement 3.2**: Provides discount rate display functionality

## Related Files

- Contract configuration: `frontend/src/lib/contracts.ts`
- Query client setup: `frontend/src/lib/query-client.ts`
- Wagmi configuration: `frontend/src/lib/wagmi.ts`
- Tests: `frontend/src/hooks/__tests__/use-credit-score-oracle.test.ts`

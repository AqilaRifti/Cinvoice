# Transaction Receipts Feature

## Overview

The Transaction Receipts feature provides users with detailed information about their blockchain transactions after they complete successfully. This includes transaction hash, block number, gas usage, and a direct link to view the transaction on the block explorer.

## Components

### TransactionReceipt

A standalone component that displays comprehensive transaction receipt information.

**Location:** `frontend/src/components/shared/transaction-receipt.tsx`

**Props:**
```typescript
interface TransactionReceiptData {
    transactionHash: string;
    blockNumber: bigint;
    gasUsed: bigint;
    effectiveGasPrice: bigint;
    timestamp?: number;
    status: 'success' | 'reverted';
}

interface TransactionReceiptProps {
    receipt: TransactionReceiptData;
    title?: string;
    description?: string;
}
```

**Features:**
- Displays transaction hash with copy-to-clipboard functionality
- Shows block number and timestamp (if available)
- Displays gas used and total gas cost in CTC
- Shows transaction status with visual indicator
- Provides link to block explorer
- Animated entrance with motion effects
- Green border styling for successful transactions

**Usage Example:**
```tsx
import { TransactionReceipt } from '@/components/shared/transaction-receipt';

function MyComponent() {
    const receipt = {
        transactionHash: '0x123...',
        blockNumber: 12345678n,
        gasUsed: 21000n,
        effectiveGasPrice: 50000000000n,
        timestamp: 1704067200,
        status: 'success',
    };

    return <TransactionReceipt receipt={receipt} />;
}
```

### TransactionDialog (Updated)

The existing TransactionDialog component has been enhanced to display transaction receipts on success.

**Location:** `frontend/src/components/shared/transaction-dialog.tsx`

**New Props:**
```typescript
interface TransactionDialogProps {
    // ... existing props
    receipt?: TransactionReceiptData;
}
```

**Behavior:**
- During **pending** state: Shows transaction hash with block explorer link
- On **success**: Displays full TransactionReceipt component with all details
- On **error**: Shows error message and retry option (if provided)

## Integration

### Updated Components

The following components have been updated to capture and display transaction receipts:

1. **MintInvoiceDialog** (`frontend/src/components/smb/mint-invoice-dialog.tsx`)
   - Captures receipt data from `useWaitForTransactionReceipt`
   - Passes receipt to TransactionDialog on success
   - Shows receipt with minting-specific messaging

2. **RepayInvoiceDialog** (`frontend/src/components/smb/repay-invoice-dialog.tsx`)
   - Captures receipt data from transaction confirmation
   - Displays receipt with repayment success message
   - Includes credit score boost notification

3. **InvestDialog** (`frontend/src/components/investor/invest-dialog.tsx`)
   - Shows receipt after successful invoice purchase
   - Displays investment confirmation details
   - Provides block explorer link for verification

### Implementation Pattern

All transaction dialogs follow this pattern:

```tsx
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TransactionDialog, TransactionStatus } from '@/components/shared/transaction-dialog';

function MyTransactionDialog() {
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
    const [txDialogOpen, setTxDialogOpen] = useState(false);
    
    const { writeContract, data: hash, error } = useWriteContract();
    const { isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

    // Handle transaction status changes
    useEffect(() => {
        if (isSuccess && txStatus !== 'success') {
            setTxStatus('success');
        }
        if (error && txStatus !== 'error') {
            setTxStatus('error');
        }
    }, [isSuccess, error, txStatus]);

    return (
        <TransactionDialog
            open={txDialogOpen}
            onOpenChange={setTxDialogOpen}
            status={txStatus}
            txHash={hash}
            receipt={receipt ? {
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed,
                effectiveGasPrice: receipt.effectiveGasPrice,
                status: receipt.status === 'success' ? 'success' : 'reverted',
            } : undefined}
            error={error}
            title="My Transaction"
            successMessage="Transaction completed!"
        />
    );
}
```

## Receipt Data Structure

The receipt data comes from wagmi's `useWaitForTransactionReceipt` hook, which returns:

```typescript
{
    transactionHash: string;      // Transaction hash
    blockNumber: bigint;          // Block number where tx was mined
    gasUsed: bigint;              // Gas units consumed
    effectiveGasPrice: bigint;    // Actual gas price paid (in wei)
    status: 'success' | 'reverted'; // Transaction status
    // ... other fields
}
```

## User Experience

### Success Flow

1. User initiates transaction (mint, purchase, repay)
2. Transaction confirmation dialog shows gas estimation
3. User confirms transaction
4. TransactionDialog opens with "pending" status
5. Shows transaction hash with block explorer link
6. After confirmation, status changes to "success"
7. TransactionReceipt component displays with:
   - Full transaction details
   - Gas cost breakdown
   - Block explorer link
   - Copy hash functionality
8. Success message with confetti animation
9. Dialog auto-closes after 3 seconds (or user can close manually)

### Error Flow

1. If transaction fails, shows error state
2. Displays parsed error message
3. Provides retry button (if retry handler provided)
4. User can close or retry

## Accessibility

- All interactive elements are keyboard accessible
- Transaction hash has copy button with visual feedback
- Block explorer links open in new tab with proper rel attributes
- Status indicators use both color and text
- Proper ARIA labels for screen readers

## Testing

Test files:
- `frontend/src/components/shared/__tests__/transaction-receipt.test.tsx`
- `frontend/src/components/shared/__tests__/transaction-dialog.test.tsx`

Run tests:
```bash
npm run test transaction-receipt
npm run test transaction-dialog
```

## Block Explorer Integration

The feature uses the `getBlockExplorerUrl` utility from `@/lib/wagmi` to generate block explorer links. This ensures links point to the correct network (testnet/mainnet).

Example URLs:
- Testnet: `https://explorer.testnet.creditcoin.org/tx/0x123...`
- Mainnet: `https://explorer.creditcoin.org/tx/0x123...`

## Future Enhancements

Potential improvements:
1. Add transaction receipt download as PDF
2. Include event logs in receipt
3. Show decoded transaction input data
4. Add transaction cost in USD equivalent
5. Display confirmation count before finality
6. Add receipt history/archive feature

## Requirements Satisfied

This implementation satisfies **Requirement 17.7** from the Frontend Redesign spec:

> THE Platform SHALL provide transaction receipts with block explorer links after successful transactions

All transaction types (mint, purchase, repay) now display comprehensive receipts with block explorer links upon successful completion.

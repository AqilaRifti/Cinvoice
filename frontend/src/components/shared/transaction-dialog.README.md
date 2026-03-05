# Transaction Dialog Component

A reusable dialog component for displaying transaction status with animations, block explorer links, and error handling.

## Features

- **Multiple Status States**: Handles idle, pending, success, and error states
- **Success Animation**: Confetti animation on successful transactions
- **Block Explorer Links**: Automatic links to transaction on block explorer
- **Error Handling**: Displays parsed error messages with retry option
- **Smooth Animations**: Uses Framer Motion for polished transitions
- **Customizable Messages**: Override default messages for each state

## Usage

### Basic Example

```tsx
import { TransactionDialog } from '@/components/shared';
import { useState } from 'react';

function MyComponent() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
    const [txHash, setTxHash] = useState<string>();
    const [error, setError] = useState<Error | null>(null);

    const handleTransaction = async () => {
        setDialogOpen(true);
        setTxStatus('pending');
        
        try {
            const hash = await writeContract({...});
            setTxHash(hash);
            
            await waitForTransactionReceipt({ hash });
            setTxStatus('success');
        } catch (err) {
            setError(err as Error);
            setTxStatus('error');
        }
    };

    return (
        <>
            <Button onClick={handleTransaction}>
                Submit Transaction
            </Button>
            
            <TransactionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                status={txStatus}
                txHash={txHash}
                error={error}
                onRetry={handleTransaction}
            />
        </>
    );
}
```

### With Custom Messages

```tsx
<TransactionDialog
    open={dialogOpen}
    onOpenChange={setDialogOpen}
    status={txStatus}
    txHash={txHash}
    error={error}
    title="Mint Invoice"
    pendingMessage="Minting your invoice NFT..."
    successMessage="Invoice minted successfully!"
    errorMessage="Failed to mint invoice"
    onRetry={handleMint}
/>
```

### Integration with wagmi Hooks

```tsx
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TransactionDialog, TransactionStatus } from '@/components/shared';

function MintInvoiceButton() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [status, setStatus] = useState<TransactionStatus>('idle');
    
    const { writeContract, data: hash, error, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isPending || isConfirming) {
            setStatus('pending');
            setDialogOpen(true);
        } else if (isSuccess) {
            setStatus('success');
        } else if (error) {
            setStatus('error');
        }
    }, [isPending, isConfirming, isSuccess, error]);

    const handleMint = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.InvoiceNFT,
            abi: INVOICE_NFT_ABI,
            functionName: 'mintInvoice',
            args: [metadataURI, faceValue, repaymentDate],
        });
    };

    return (
        <>
            <Button onClick={handleMint}>Mint Invoice</Button>
            
            <TransactionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                status={status}
                txHash={hash}
                error={error}
                onRetry={handleMint}
                title="Mint Invoice"
            />
        </>
    );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | `boolean` | Yes | - | Controls dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | Yes | - | Callback when dialog open state changes |
| `status` | `TransactionStatus` | Yes | - | Current transaction status: 'idle', 'pending', 'success', or 'error' |
| `txHash` | `string` | No | - | Transaction hash for block explorer link |
| `error` | `Error \| null` | No | - | Error object to display error message |
| `onRetry` | `() => void` | No | - | Callback for retry button (only shown on error) |
| `title` | `string` | No | 'Transaction' | Dialog title |
| `pendingMessage` | `string` | No | 'Processing your transaction...' | Message shown during pending state |
| `successMessage` | `string` | No | 'Transaction completed successfully!' | Message shown on success |
| `errorMessage` | `string` | No | - | Custom error message (falls back to parsed error) |

## Status States

### Idle
- Initial state before transaction starts
- No visual feedback shown

### Pending
- Shows spinning loader icon
- Displays pending message
- Shows "don't close window" warning
- Cannot be closed by user

### Success
- Shows green checkmark with scale animation
- Triggers confetti animation (50 particles, 2-3 second duration)
- Shows success message
- Displays transaction hash link
- Shows "Close" button

### Error
- Shows red X icon with scale animation
- Displays parsed error message in alert
- Shows transaction hash link (if available)
- Shows "Retry" button (if onRetry provided)
- Shows "Close" button

## Animations

### Confetti
- 50 colored particles (green, blue, orange, red, purple)
- Random horizontal positions
- Falls from top to bottom with rotation
- 2-3 second duration with staggered delays
- Auto-hides after 3 seconds

### Icon Transitions
- Scale animation with spring physics
- Smooth fade in/out between states
- 200ms duration

### Content Transitions
- Fade and slide animations
- Staggered delays for sequential appearance
- Smooth exit animations

## Accessibility

- Proper ARIA labels on dialog
- Keyboard navigation support
- Focus management
- Screen reader announcements for status changes
- External link indicators for block explorer

## Requirements Satisfied

- **7.5**: Transaction status feedback with pending, success, error states
- **7.6**: Success message with confetti animation
- **7.7**: Error display with retry option
- **10.2**: Transaction hash link to block explorer
- **10.3**: Error toast with details (via parseContractError)

## Related Components

- `Dialog` - Base dialog component from shadcn-ui
- `Alert` - Alert component for error/info messages
- `Button` - Button component for actions
- `parseContractError` - Utility for parsing contract errors
- `getBlockExplorerUrl` - Utility for generating explorer URLs

## Notes

- Uses Framer Motion for animations (respects prefers-reduced-motion)
- Automatically parses contract errors for user-friendly messages
- Confetti animation is lightweight and performant
- Dialog cannot be closed during pending state
- Transaction hash link opens in new tab with security attributes

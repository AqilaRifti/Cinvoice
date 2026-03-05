# TransactionDialog Integration Guide

This guide shows how to integrate the TransactionDialog component into existing transaction flows.

## Quick Integration Pattern

### Step 1: Add State Management

```tsx
import { useState } from 'react';
import { TransactionDialog, TransactionStatus } from '@/components/shared';

function YourComponent() {
    const [txDialogOpen, setTxDialogOpen] = useState(false);
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
    
    // ... rest of your component
}
```

### Step 2: Update Transaction Handler

```tsx
const handleTransaction = async () => {
    // Open dialog and set to pending
    setTxDialogOpen(true);
    setTxStatus('pending');
    
    try {
        // Your transaction logic
        const hash = await writeContract({...});
        
        // Wait for confirmation
        await waitForTransactionReceipt({ hash });
        
        // Set to success
        setTxStatus('success');
    } catch (error) {
        // Set to error
        setTxStatus('error');
    }
};
```

### Step 3: Add Dialog Component

```tsx
return (
    <>
        {/* Your existing UI */}
        <Button onClick={handleTransaction}>Submit</Button>
        
        {/* Add TransactionDialog */}
        <TransactionDialog
            open={txDialogOpen}
            onOpenChange={setTxDialogOpen}
            status={txStatus}
            txHash={hash}
            error={error}
            onRetry={handleTransaction}
            title="Your Transaction Title"
        />
    </>
);
```

## Real-World Example: Updating MintInvoiceDialog

Here's how to integrate TransactionDialog into the existing MintInvoiceDialog:

### Before (Current Implementation)

```tsx
export function MintInvoiceDialog() {
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleMint = async () => {
        try {
            writeContract({...});
        } catch (error) {
            toast.error(parseContractError(error));
        }
    };

    if (isSuccess) {
        toast.success('Invoice minted successfully!');
        setOpen(false);
    }

    return (
        <Dialog>
            {/* Form content */}
            <Button onClick={handleMint} disabled={isPending || isConfirming}>
                {isPending || isConfirming ? 'Processing...' : 'Mint Invoice'}
            </Button>
        </Dialog>
    );
}
```

### After (With TransactionDialog)

```tsx
export function MintInvoiceDialog() {
    const [open, setOpen] = useState(false);
    const [txDialogOpen, setTxDialogOpen] = useState(false);
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
    
    const { writeContract, data: hash, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // Update status based on transaction state
    useEffect(() => {
        if (isPending || isConfirming) {
            setTxStatus('pending');
            setTxDialogOpen(true);
        } else if (isSuccess) {
            setTxStatus('success');
            // Close form dialog after success
            setTimeout(() => setOpen(false), 2000);
        } else if (error) {
            setTxStatus('error');
        }
    }, [isPending, isConfirming, isSuccess, error]);

    const handleMint = () => {
        writeContract({...});
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                {/* Form content */}
                <Button onClick={handleMint}>
                    Mint Invoice
                </Button>
            </Dialog>

            <TransactionDialog
                open={txDialogOpen}
                onOpenChange={setTxDialogOpen}
                status={txStatus}
                txHash={hash}
                error={error}
                onRetry={handleMint}
                title="Mint Invoice"
                pendingMessage="Minting your invoice NFT..."
                successMessage="Invoice minted successfully! 🎉"
            />
        </>
    );
}
```

## Benefits of Using TransactionDialog

1. **Consistent UX**: All transactions have the same look and feel
2. **Better Feedback**: Users see clear status updates with animations
3. **Error Handling**: Automatic error parsing and retry functionality
4. **Block Explorer Links**: Easy access to transaction details
5. **Success Celebration**: Confetti animation for positive reinforcement
6. **Reduced Code**: No need to implement status UI in each component

## Migration Checklist

When migrating existing transaction flows:

- [ ] Add TransactionDialog state management
- [ ] Update transaction handler to set status
- [ ] Add TransactionDialog component to JSX
- [ ] Remove old loading/success/error UI
- [ ] Remove toast notifications (TransactionDialog handles feedback)
- [ ] Test all transaction states (pending, success, error)
- [ ] Verify retry functionality works
- [ ] Check block explorer links open correctly

## Common Patterns

### Pattern 1: Simple Transaction

```tsx
const [txDialogOpen, setTxDialogOpen] = useState(false);
const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
const { writeContract, data: hash, error } = useWriteContract();
const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

useEffect(() => {
    if (isLoading) {
        setTxStatus('pending');
        setTxDialogOpen(true);
    } else if (isSuccess) {
        setTxStatus('success');
    } else if (error) {
        setTxStatus('error');
    }
}, [isLoading, isSuccess, error]);
```

### Pattern 2: Multi-Step Transaction

```tsx
const [txDialogOpen, setTxDialogOpen] = useState(false);
const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
const [currentStep, setCurrentStep] = useState(1);

const handleMultiStepTransaction = async () => {
    setTxDialogOpen(true);
    
    try {
        // Step 1
        setTxStatus('pending');
        const hash1 = await writeContract({...});
        await waitForTransactionReceipt({ hash: hash1 });
        
        // Step 2
        const hash2 = await writeContract({...});
        await waitForTransactionReceipt({ hash: hash2 });
        
        setTxStatus('success');
    } catch (error) {
        setTxStatus('error');
    }
};
```

### Pattern 3: Transaction with Validation

```tsx
const handleTransaction = async () => {
    // Validate before opening dialog
    if (!isValid) {
        toast.error('Please fill all required fields');
        return;
    }
    
    setTxDialogOpen(true);
    setTxStatus('pending');
    
    try {
        const hash = await writeContract({...});
        await waitForTransactionReceipt({ hash });
        setTxStatus('success');
    } catch (error) {
        setTxStatus('error');
    }
};
```

## Troubleshooting

### Dialog doesn't open
- Check that `open` prop is set to `true`
- Verify `setTxDialogOpen(true)` is called before transaction

### Status doesn't update
- Ensure `setTxStatus()` is called in try/catch blocks
- Check useEffect dependencies include transaction states

### Retry doesn't work
- Verify `onRetry` prop is provided
- Ensure retry handler resets state and retries transaction

### Confetti doesn't show
- Confetti only shows on `status="success"`
- Check browser console for animation errors
- Verify Framer Motion is installed

## Best Practices

1. **Always provide onRetry**: Users should be able to retry failed transactions
2. **Use custom messages**: Make messages specific to the action
3. **Reset state on close**: Clear transaction state when dialog closes
4. **Handle all states**: Ensure pending, success, and error are all handled
5. **Test error cases**: Verify error messages are user-friendly
6. **Close form dialogs**: Close the form dialog after successful transaction

## Related Documentation

- [TransactionDialog README](./transaction-dialog.README.md) - Full API documentation
- [Error Handling](../../lib/__tests__/errors.README.md) - Error parsing utilities
- [Wagmi Integration](../../lib/wagmi.ts) - Block explorer URL utilities

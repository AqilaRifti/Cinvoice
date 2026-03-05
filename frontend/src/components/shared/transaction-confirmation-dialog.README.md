# Transaction Confirmation Dialog

A reusable dialog component that displays transaction details with gas cost estimation before users confirm blockchain write operations.

## Features

- **Gas Cost Estimation**: Automatically estimates gas costs using viem's `estimateGas`
- **Real-time Gas Price**: Fetches current gas price from the network
- **Total Cost Calculation**: Shows transaction value + estimated gas cost
- **USD Conversion**: Optional ETH to USD price conversion
- **Detailed Breakdown**: Expandable section showing gas units and gas price
- **Transaction Summary**: Custom summary section for transaction-specific details
- **Warning Messages**: Optional warning messages for risky operations
- **Error Handling**: Displays transaction errors with user-friendly messages

## Usage

```tsx
import { TransactionConfirmationDialog } from '@/components/shared';
import { encodeFunctionData } from 'viem';

function MyComponent() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { writeContract, isPending, isConfirming, error } = useWriteContract();

  const handleConfirm = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'myFunction',
      args: [arg1, arg2],
      value: valueToSend,
    });
  };

  return (
    <TransactionConfirmationDialog
      open={showConfirmation}
      onOpenChange={setShowConfirmation}
      onConfirm={handleConfirm}
      title="Confirm Transaction"
      description="Review the details before confirming"
      isPending={isPending}
      isConfirming={isConfirming}
      error={error}
      to={CONTRACT_ADDRESS}
      data={encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'myFunction',
        args: [arg1, arg2],
      })}
      value={valueToSend}
      transactionSummary={
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item</span>
            <span className="font-medium">Value</span>
          </div>
        </div>
      }
      warningMessage="This action cannot be undone."
      ethPriceUSD={2500} // Optional: for USD conversion
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Controls dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | Yes | Callback when dialog open state changes |
| `onConfirm` | `() => void` | Yes | Callback when user confirms transaction |
| `title` | `string` | Yes | Dialog title |
| `description` | `string` | No | Dialog description |
| `isPending` | `boolean` | No | Whether transaction is pending wallet confirmation |
| `isConfirming` | `boolean` | No | Whether transaction is being confirmed on-chain |
| `error` | `Error \| null` | No | Transaction error to display |
| `to` | `` `0x${string}` `` | Yes | Contract address for gas estimation |
| `data` | `` `0x${string}` `` | Yes | Encoded function data for gas estimation |
| `value` | `bigint` | No | Transaction value (defaults to 0n) |
| `transactionSummary` | `React.ReactNode` | Yes | Custom summary content |
| `warningMessage` | `string` | No | Optional warning message |
| `ethPriceUSD` | `number` | No | ETH price in USD for conversion |

## Integration Examples

### Investment Dialog
See `frontend/src/components/investor/invest-dialog.tsx` for a complete example of integrating the confirmation dialog into a multi-step investment flow.

### Repayment Dialog
See `frontend/src/components/smb/repay-invoice-dialog.tsx` for an example of using the confirmation dialog for invoice repayment.

### Minting Dialog
See `frontend/src/components/smb/mint-invoice-dialog.tsx` for an example of integrating the confirmation dialog after IPFS upload.

## Design Patterns

### Two-Step Confirmation Flow

1. **Initial Dialog**: Show transaction details, terms, and conditions
2. **Confirmation Dialog**: Show gas costs and final confirmation

```tsx
// Step 1: Initial dialog with details
<Dialog open={open && !showConfirmation}>
  {/* Show transaction details */}
  <Button onClick={() => setShowConfirmation(true)}>
    Continue to Confirmation
  </Button>
</Dialog>

// Step 2: Gas confirmation
<TransactionConfirmationDialog
  open={showConfirmation}
  onConfirm={handleConfirm}
  {/* ... props */}
/>
```

### Transaction Summary

The `transactionSummary` prop accepts any React node, allowing you to customize the display:

```tsx
transactionSummary={
  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-muted-foreground">Invoice #</span>
      <span className="font-medium">{tokenId}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Amount</span>
      <span className="font-medium">{formatEther(amount)} CTC</span>
    </div>
    <div className="flex justify-between pt-2 border-t">
      <span className="text-muted-foreground">Total</span>
      <span className="font-bold text-lg">{formatEther(total)} CTC</span>
    </div>
  </div>
}
```

## Gas Estimation

The component automatically:
1. Estimates gas units required for the transaction
2. Fetches current gas price from the network
3. Calculates total gas cost (gas units × gas price)
4. Adds gas cost to transaction value for total cost
5. Converts to USD if `ethPriceUSD` is provided

If gas estimation fails, the component displays a message and allows the transaction to proceed with network defaults.

## Accessibility

- Keyboard navigation supported
- Focus management for dialog open/close
- ARIA labels for screen readers
- Disabled state for buttons during transaction
- Clear error messages

## Requirements Validated

- **Requirement 17.6**: Display transaction confirmation dialogs before submitting writes with estimated gas costs
- **Requirement 7.8**: Provide transaction cost estimation before submission showing gas fees and total cost

## Related Components

- `TransactionDialog`: Shows transaction status after submission (pending, success, error)
- `ButtonWithLoading`: Button component with loading state
- `EmptyState`: Empty state component for no data scenarios

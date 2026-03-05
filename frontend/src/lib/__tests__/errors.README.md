# Error Handling Utilities

This module provides comprehensive error handling utilities for the Creditcoin Invoice Financing Platform frontend.

## Overview

The error handling utilities provide:
- **Contract error parsing**: Convert technical blockchain errors to user-friendly messages
- **Input sanitization**: Prevent XSS and injection attacks
- **Error classification**: Identify user rejections, network errors, etc.
- **Logging utilities**: Format errors for debugging

## Requirements

- **Requirement 16.4**: Parse contract errors to user-friendly messages
- **Requirement 16.5**: Sanitize user inputs to prevent XSS and injection attacks

## Functions

### `parseContractError(error: unknown): string`

Parses contract errors and returns user-friendly error messages.

**Handles:**
- Viem `BaseError` and `ContractFunctionRevertedError`
- Wagmi error types
- Common wallet errors (user rejection, insufficient funds)
- Network errors
- Contract-specific revert reasons

**Example:**
```typescript
import { parseContractError } from '@/lib/errors';
import { toast } from 'sonner';

try {
  await writeContract({ ... });
} catch (error) {
  const message = parseContractError(error);
  toast.error(message);
}
```

**Error Mappings:**

| Error Pattern | User-Friendly Message |
|--------------|----------------------|
| `user rejected` | Transaction was rejected |
| `insufficient funds` | Insufficient funds for transaction |
| `network error` | Network error occurred. Please check your connection |
| `InvalidFaceValue` | Invalid invoice face value. Must be greater than zero |
| `InvalidRepaymentDate` | Repayment date must be in the future |
| `Unauthorized` | You are not authorized to perform this action |
| `TransferRestricted` | Cannot transfer funded invoices |
| `InvoiceNotAvailable` | Invoice is not available for purchase |
| `AlreadyRepaid` | Invoice has already been repaid |
| `NotAdmin` | Only admins can perform this action |
| `Paused` | Platform is currently paused |

### `sanitizeInput(input: string): string`

Sanitizes user input to prevent XSS and injection attacks.

**Features:**
- Removes HTML tags
- Escapes special HTML characters (`&`, `<`, `>`, `"`, `'`, `/`)
- Removes null bytes
- Trims whitespace

**Example:**
```typescript
import { sanitizeInput } from '@/lib/errors';

const userInput = '<script>alert("xss")</script>Hello';
const safe = sanitizeInput(userInput); // Returns: "Hello"
```

**Note:** This is basic sanitization suitable for text inputs. For rich text, consider using a dedicated library like DOMPurify.

### `sanitizeObject<T>(obj: T): T`

Sanitizes all string properties in an object recursively.

**Example:**
```typescript
import { sanitizeObject } from '@/lib/errors';

const formData = {
  name: '<script>xss</script>John',
  description: 'Safe text',
  amount: 100
};

const safe = sanitizeObject(formData);
// Returns: { name: 'John', description: 'Safe text', amount: 100 }
```

### `isUserRejection(error: unknown): boolean`

Checks if an error is a user rejection error.

**Use case:** Skip showing error toasts for user rejections (they know they rejected).

**Example:**
```typescript
import { isUserRejection, parseContractError } from '@/lib/errors';
import { toast } from 'sonner';

try {
  await writeContract({ ... });
} catch (error) {
  if (!isUserRejection(error)) {
    toast.error(parseContractError(error));
  }
}
```

### `isNetworkError(error: unknown): boolean`

Checks if an error is a network error.

**Example:**
```typescript
import { isNetworkError } from '@/lib/errors';

if (isNetworkError(error)) {
  // Show retry button or network troubleshooting tips
}
```

### `formatErrorForLogging(error: unknown): object`

Formats error for logging/debugging. Extracts useful information from error objects.

**Example:**
```typescript
import { formatErrorForLogging } from '@/lib/errors';

try {
  await writeContract({ ... });
} catch (error) {
  const formatted = formatErrorForLogging(error);
  console.error('Transaction failed:', formatted);
  // Send to error tracking service (e.g., Sentry)
}
```

## Usage Patterns

### Pattern 1: Basic Error Handling in Mutations

```typescript
import { parseContractError, isUserRejection } from '@/lib/errors';
import { toast } from 'sonner';

function useMintInvoice() {
  const { writeContract } = useWriteContract();
  
  const handleMint = async (params: any) => {
    try {
      await writeContract({ ... });
      toast.success('Invoice minted successfully!');
    } catch (error) {
      if (!isUserRejection(error)) {
        toast.error(parseContractError(error));
      }
    }
  };
  
  return { handleMint };
}
```

### Pattern 2: Form Data Sanitization

```typescript
import { sanitizeObject } from '@/lib/errors';

function handleFormSubmit(data: FormData) {
  // Sanitize all string inputs
  const sanitized = sanitizeObject({
    description: data.description,
    customerName: data.customerName,
    customerAddress: data.customerAddress,
  });
  
  // Now safe to use in UI or send to backend
  await submitInvoice(sanitized);
}
```

### Pattern 3: Comprehensive Error Handling

```typescript
import { 
  parseContractError, 
  isUserRejection, 
  isNetworkError,
  formatErrorForLogging 
} from '@/lib/errors';
import { toast } from 'sonner';

async function handleTransaction(action: () => Promise<any>) {
  try {
    return await action();
  } catch (error) {
    // Log for debugging
    console.error('Transaction error:', formatErrorForLogging(error));
    
    // User rejection - silent
    if (isUserRejection(error)) {
      return null;
    }
    
    // Network error - show retry option
    if (isNetworkError(error)) {
      toast.error('Network error. Please check your connection.', {
        action: {
          label: 'Retry',
          onClick: () => handleTransaction(action),
        },
      });
      return null;
    }
    
    // Other errors - show user-friendly message
    toast.error(parseContractError(error));
    throw error;
  }
}
```

### Pattern 4: Display Error in UI

```typescript
import { parseContractError } from '@/lib/errors';

function TransactionDialog() {
  const { error } = useWriteContract();
  
  return (
    <Dialog>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {parseContractError(error)}
          </AlertDescription>
        </Alert>
      )}
    </Dialog>
  );
}
```

## Testing

Unit tests are provided in `errors.test.ts` covering:
- Contract error parsing for all error types
- Input sanitization for XSS prevention
- Object sanitization
- Error classification (user rejection, network errors)
- Edge cases and integration scenarios

Run tests with:
```bash
npm test -- src/lib/__tests__/errors.test.ts
```

## Security Considerations

### Input Sanitization

The `sanitizeInput` function provides basic protection against:
- HTML injection
- Script injection
- XSS attacks

**Important:** Always sanitize user inputs before:
- Displaying in UI
- Storing in database
- Sending to backend
- Using in contract interactions

### Error Messages

Error messages are designed to be:
- **User-friendly**: Non-technical language
- **Informative**: Clear about what went wrong
- **Actionable**: Suggest what the user can do
- **Secure**: Don't expose sensitive system information

## Contract-Specific Errors

The error handler includes mappings for all custom errors from the smart contracts:

### InvoiceNFT Errors
- `InvalidFaceValue`
- `InvalidRepaymentDate`
- `Unauthorized`
- `TransferRestricted`
- `InvoiceNotFound`

### FinancingPool Errors
- `InvoiceNotAvailable`
- `IncorrectPayment`
- `AlreadyRepaid`
- `NotInvestor`

### CreditScoreOracle Errors
- `InvalidScore`
- `ScoreNotFound`

### PlatformGovernance Errors
- `NotAdmin`
- `ProposalNotFound`
- `AlreadyApproved`
- `ProposalAlreadyExecuted`
- `InsufficientApprovals`
- `Paused`

## Best Practices

1. **Always use `parseContractError`** for contract errors instead of displaying raw error messages
2. **Check for user rejections** before showing error toasts
3. **Sanitize all user inputs** before displaying or storing
4. **Log errors** for debugging while showing user-friendly messages
5. **Provide retry options** for network errors
6. **Test error handling** for all contract interactions

## Future Enhancements

Potential improvements:
- Add DOMPurify for rich text sanitization
- Integrate with error tracking service (Sentry)
- Add error recovery strategies
- Implement error analytics
- Add multilingual error messages
- Create error documentation for users

## Related Files

- `frontend/src/lib/errors.ts` - Main implementation
- `frontend/src/lib/__tests__/errors.test.ts` - Unit tests
- `frontend/src/lib/__tests__/errors.example.ts` - Usage examples
- `frontend/src/components/investor/invest-dialog.tsx` - Example usage
- `frontend/src/components/smb/repay-invoice-dialog.tsx` - Example usage
- `frontend/src/components/smb/mint-invoice-dialog.tsx` - Example usage
- `frontend/src/components/smb/upload-invoice-dialog.tsx` - Example usage with sanitization

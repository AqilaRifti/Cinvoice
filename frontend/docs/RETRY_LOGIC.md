# Retry Logic Implementation

## Overview

This document describes the retry logic implementation for failed contract reads with exponential backoff, as specified in **Requirement 17.8**.

## Implementation Details

### Location

The retry logic is implemented in `frontend/src/lib/query-client.ts` and is automatically applied to all TanStack Query queries.

### Components

#### 1. Exponential Backoff Function

```typescript
export function exponentialBackoff(attemptIndex: number): number {
    const baseDelay = 1000; // 1 second
    return Math.min(baseDelay * Math.pow(2, attemptIndex), 8000); // Cap at 8 seconds
}
```

**Behavior:**
- Attempt 1: 1 second delay
- Attempt 2: 2 seconds delay
- Attempt 3: 4 seconds delay
- Attempt 4+: 8 seconds delay (capped)

#### 2. Retry Decision Logic

```typescript
export function shouldRetryContractRead(failureCount: number, error: unknown): boolean {
    // Maximum 3 retry attempts
    if (failureCount >= 3) {
        return false;
    }

    // Retry on network errors, RPC errors, etc.
    // Don't retry on contract-specific errors
}
```

**Retry Conditions:**

✅ **Will Retry (Network/Infrastructure Errors):**
- Network errors (`network`, `timeout`, `fetch`, `connection`)
- Connection errors (`ECONNREFUSED`, `ENOTFOUND`)
- RPC errors (`rpc`, `provider`, `rate limit`)
- Unknown errors (default behavior)

❌ **Will NOT Retry (Contract/User Errors):**
- Contract reverts (`execution reverted`)
- Invalid inputs (`invalid`)
- Authorization errors (`unauthorized`)
- User rejections (`user rejected`)

**Maximum Attempts:**
- Initial attempt + 3 retries = 4 total attempts
- After 3 failed retries, the error is thrown

### Configuration

The retry logic is configured in the TanStack Query client:

```typescript
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: shouldRetryContractRead,
            retryDelay: exponentialBackoff,
            // ... other options
        },
        mutations: {
            retry: 0, // Mutations don't retry
        },
    },
});
```

## Usage

### Automatic Application

All contract read queries automatically use the retry logic:

```typescript
// This query will automatically retry on network failures
const { data, isLoading, error } = useQuery({
    queryKey: ['invoice', tokenId],
    queryFn: async () => {
        return await readContract(config, {
            address: CONTRACT_ADDRESSES.InvoiceNFT,
            abi: INVOICE_NFT_ABI,
            functionName: 'getInvoiceDetails',
            args: [BigInt(tokenId)],
        });
    },
});
```

### Custom Retry Logic

You can override the default retry logic for specific queries:

```typescript
const { data } = useQuery({
    queryKey: ['custom'],
    queryFn: fetchData,
    retry: 5, // Retry 5 times instead of 3
    retryDelay: (attemptIndex) => attemptIndex * 1000, // Linear backoff
});
```

## Testing

### Unit Tests

Comprehensive unit tests are located in `frontend/src/lib/__tests__/query-client.test.ts`:

- ✅ Exponential backoff calculation
- ✅ Retry decision logic for various error types
- ✅ Maximum retry attempts enforcement
- ✅ Query client integration
- ✅ Retry behavior simulation

### Manual Testing

Run the demonstration script to see retry logic in action:

```bash
cd frontend
npx tsx src/lib/__tests__/retry-demo.ts
```

### Integration Testing

To test retry behavior with real network failures:

1. Start the frontend application
2. Disconnect from the network
3. Observe automatic retries in the browser console
4. Reconnect to see successful retry

## Examples

### Example 1: Network Failure Recovery

```
Attempt 1: Network error → Wait 1s → Retry
Attempt 2: Network error → Wait 2s → Retry
Attempt 3: Network error → Wait 4s → Retry
Attempt 4: Network error → Wait 8s → Retry
Attempt 5: Max retries reached → Throw error
```

### Example 2: Contract Revert (No Retry)

```
Attempt 1: Execution reverted → Throw error immediately
```

### Example 3: Successful Retry

```
Attempt 1: Network error → Wait 1s → Retry
Attempt 2: Success → Return data
```

## Benefits

1. **Improved Reliability**: Automatically recovers from transient network failures
2. **Better UX**: Users don't see errors for temporary network issues
3. **Reduced Load**: Exponential backoff prevents overwhelming the RPC provider
4. **Smart Retry**: Only retries errors that are likely to succeed on retry
5. **Configurable**: Can be customized per query if needed

## Monitoring

To monitor retry behavior in production:

1. Check browser console for retry logs
2. Monitor RPC provider metrics for retry patterns
3. Track error rates before and after retry implementation
4. Measure time-to-success for queries with retries

## Troubleshooting

### Issue: Too Many Retries

**Solution**: Reduce max retries or increase backoff delay:

```typescript
queries: {
    retry: 2, // Reduce from 3 to 2
    retryDelay: (attempt) => exponentialBackoff(attempt) * 2, // Double the delay
}
```

### Issue: Not Retrying When Expected

**Solution**: Check error message format. Add custom error patterns:

```typescript
if (message.includes('your-custom-error')) {
    return true; // Retry
}
```

### Issue: Retrying Contract Errors

**Solution**: Add contract error patterns to the "don't retry" list:

```typescript
if (message.includes('your-contract-error')) {
    return false; // Don't retry
}
```

## Related Requirements

- **Requirement 17.8**: THE Platform SHALL implement retry logic for failed contract reads with exponential backoff

## References

- [TanStack Query Retry Documentation](https://tanstack.com/query/latest/docs/react/guides/query-retries)
- [Exponential Backoff Algorithm](https://en.wikipedia.org/wiki/Exponential_backoff)
- Design Document: `frontend-redesign/design.md` - State Management Patterns

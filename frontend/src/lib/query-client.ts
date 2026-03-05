import { QueryClient } from '@tanstack/react-query';
import { InvoiceFilters } from '@/types';

// ============================================================================
// Query Client Configuration
// ============================================================================

/**
 * Exponential backoff retry delay function
 * Implements exponential backoff: 1s, 2s, 4s, 8s
 * @param attemptIndex - The attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
export function exponentialBackoff(attemptIndex: number): number {
    const baseDelay = 1000; // 1 second
    return Math.min(baseDelay * Math.pow(2, attemptIndex), 8000); // Cap at 8 seconds
}

/**
 * Custom retry logic for contract reads
 * Determines whether to retry based on the error type
 * @param failureCount - Number of consecutive failures
 * @param error - The error that occurred
 * @returns Whether to retry the request
 */
export function shouldRetryContractRead(failureCount: number, error: unknown): boolean {
    // Maximum 3 retry attempts
    if (failureCount >= 3) {
        return false;
    }

    // Retry on network errors
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Retry on network-related errors
        if (
            message.includes('network') ||
            message.includes('timeout') ||
            message.includes('fetch') ||
            message.includes('connection') ||
            message.includes('econnrefused') ||
            message.includes('enotfound')
        ) {
            return true;
        }

        // Retry on RPC errors
        if (
            message.includes('rpc') ||
            message.includes('provider') ||
            message.includes('rate limit')
        ) {
            return true;
        }

        // Don't retry on contract-specific errors (these are expected)
        if (
            message.includes('execution reverted') ||
            message.includes('invalid') ||
            message.includes('unauthorized') ||
            message.includes('user rejected')
        ) {
            return false;
        }
    }

    // Default: retry on unknown errors
    return true;
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000, // 30 seconds
            gcTime: 5 * 60_000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: shouldRetryContractRead,
            retryDelay: exponentialBackoff,
        },
        mutations: {
            retry: 0,
        },
    },
});

// ============================================================================
// Query Keys Factory
// ============================================================================

export const queryKeys = {
    // Invoice queries
    invoices: {
        all: ['invoices'] as const,
        lists: () => [...queryKeys.invoices.all, 'list'] as const,
        list: (filters: InvoiceFilters) =>
            [...queryKeys.invoices.lists(), filters] as const,
        details: () => [...queryKeys.invoices.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.invoices.details(), id] as const,
        metadata: (tokenId: number) =>
            [...queryKeys.invoices.all, 'metadata', tokenId] as const,
    },

    // User queries
    user: {
        all: ['user'] as const,
        balance: (address: `0x${string}`) =>
            [...queryKeys.user.all, 'balance', address] as const,
        invoices: (address: `0x${string}`) =>
            [...queryKeys.user.all, 'invoices', address] as const,
        investments: (address: `0x${string}`) =>
            [...queryKeys.user.all, 'investments', address] as const,
        creditScore: (address: `0x${string}`) =>
            [...queryKeys.user.all, 'creditScore', address] as const,
        creditProfile: (address: `0x${string}`) =>
            [...queryKeys.user.all, 'creditProfile', address] as const,
        role: (address: `0x${string}`) =>
            [...queryKeys.user.all, 'role', address] as const,
    },

    // Platform queries
    platform: {
        all: ['platform'] as const,
        stats: () => [...queryKeys.platform.all, 'stats'] as const,
        health: () => [...queryKeys.platform.all, 'health'] as const,
        fee: () => [...queryKeys.platform.all, 'fee'] as const,
        paused: () => [...queryKeys.platform.all, 'paused'] as const,
    },

    // Governance queries
    governance: {
        all: ['governance'] as const,
        proposals: () => [...queryKeys.governance.all, 'proposals'] as const,
        proposal: (id: number) =>
            [...queryKeys.governance.proposals(), id] as const,
        treasury: () => [...queryKeys.governance.all, 'treasury'] as const,
        admins: () => [...queryKeys.governance.all, 'admins'] as const,
    },

    // Investment queries
    investment: {
        all: ['investment'] as const,
        detail: (tokenId: number) =>
            [...queryKeys.investment.all, 'detail', tokenId] as const,
        purchasePrice: (tokenId: number) =>
            [...queryKeys.investment.all, 'purchasePrice', tokenId] as const,
    },
};

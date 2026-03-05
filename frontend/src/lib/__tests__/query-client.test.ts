import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { exponentialBackoff, shouldRetryContractRead } from '../query-client';

/**
 * Test suite for Query Client retry logic with exponential backoff
 * 
 * **Validates: Requirements 17.8**
 * 
 * This test suite verifies that the query client implements retry logic
 * for failed contract reads with exponential backoff as specified in
 * Requirement 17.8.
 */

describe('Query Client Retry Logic', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: shouldRetryContractRead,
                    retryDelay: exponentialBackoff,
                },
            },
        });
    });

    afterEach(() => {
        queryClient.clear();
    });

    describe('Exponential Backoff', () => {
        it('should implement exponential backoff with correct delays', () => {
            expect(exponentialBackoff(0)).toBe(1000); // 1s
            expect(exponentialBackoff(1)).toBe(2000); // 2s
            expect(exponentialBackoff(2)).toBe(4000); // 4s
            expect(exponentialBackoff(3)).toBe(8000); // 8s
        });

        it('should cap delay at 8 seconds', () => {
            expect(exponentialBackoff(4)).toBe(8000);
            expect(exponentialBackoff(5)).toBe(8000);
            expect(exponentialBackoff(10)).toBe(8000);
        });
    });

    describe('Retry Decision Logic', () => {
        describe('Network Errors - Should Retry', () => {
            it('should retry on network error', () => {
                const error = new Error('Network request failed');
                expect(shouldRetryContractRead(0, error)).toBe(true);
                expect(shouldRetryContractRead(1, error)).toBe(true);
                expect(shouldRetryContractRead(2, error)).toBe(true);
            });

            it('should retry on timeout error', () => {
                const error = new Error('Request timeout');
                expect(shouldRetryContractRead(0, error)).toBe(true);
            });

            it('should retry on fetch error', () => {
                const error = new Error('Fetch failed');
                expect(shouldRetryContractRead(0, error)).toBe(true);
            });

            it('should retry on connection error', () => {
                const error = new Error('Connection refused');
                expect(shouldRetryContractRead(0, error)).toBe(true);
            });

            it('should retry on ECONNREFUSED', () => {
                const error = new Error('ECONNREFUSED');
                expect(shouldRetryContractRead(0, error)).toBe(true);
            });

            it('should retry on ENOTFOUND', () => {
                const error = new Error('ENOTFOUND');
                expect(shouldRetryContractRead(0, error)).toBe(true);
            });
        });

        describe('RPC Errors - Should Retry', () => {
            it('should retry on RPC error', () => {
                const error = new Error('RPC call failed');
                expect(shouldRetryContractRead(0, error)).toBe(true);
            });

            it('should retry on provider error', () => {
                const error = new Error('Provider error');
                expect(shouldRetryContractRead(0, error)).toBe(true);
            });

            it('should retry on rate limit error', () => {
                const error = new Error('Rate limit exceeded');
                expect(shouldRetryContractRead(0, error)).toBe(true);
            });
        });

        describe('Contract Errors - Should NOT Retry', () => {
            it('should not retry on execution reverted', () => {
                const error = new Error('execution reverted');
                expect(shouldRetryContractRead(0, error)).toBe(false);
            });

            it('should not retry on invalid input', () => {
                const error = new Error('Invalid input');
                expect(shouldRetryContractRead(0, error)).toBe(false);
            });

            it('should not retry on unauthorized', () => {
                const error = new Error('Unauthorized access');
                expect(shouldRetryContractRead(0, error)).toBe(false);
            });

            it('should not retry on user rejected', () => {
                const error = new Error('User rejected transaction');
                expect(shouldRetryContractRead(0, error)).toBe(false);
            });
        });

        describe('Maximum Retry Attempts', () => {
            it('should stop retrying after 3 attempts', () => {
                const error = new Error('Network error');
                expect(shouldRetryContractRead(0, error)).toBe(true);
                expect(shouldRetryContractRead(1, error)).toBe(true);
                expect(shouldRetryContractRead(2, error)).toBe(true);
                expect(shouldRetryContractRead(3, error)).toBe(false);
                expect(shouldRetryContractRead(4, error)).toBe(false);
            });

            it('should respect max retries even for retryable errors', () => {
                const error = new Error('RPC error');
                expect(shouldRetryContractRead(3, error)).toBe(false);
            });
        });

        describe('Unknown Errors', () => {
            it('should retry on unknown error types', () => {
                const error = new Error('Some unknown error');
                expect(shouldRetryContractRead(0, error)).toBe(true);
            });

            it('should retry on non-Error objects', () => {
                const error = { message: 'Something went wrong' };
                expect(shouldRetryContractRead(0, error)).toBe(true);
            });
        });
    });

    describe('Query Client Integration', () => {
        it('should have retry configured in default options', () => {
            const options = queryClient.getDefaultOptions();
            expect(options.queries?.retry).toBeDefined();
            expect(options.queries?.retryDelay).toBeDefined();
        });

        it('should use custom retry function', () => {
            const options = queryClient.getDefaultOptions();
            expect(typeof options.queries?.retry).toBe('function');
        });

        it('should use exponential backoff for retry delay', () => {
            const options = queryClient.getDefaultOptions();
            expect(typeof options.queries?.retryDelay).toBe('function');
        });

        it('should not retry mutations by default', () => {
            const options = queryClient.getDefaultOptions();
            expect(options.mutations?.retry).toBe(0);
        });
    });

    describe('Retry Behavior Simulation', () => {
        it('should retry network failures with exponential backoff', async () => {
            const mockFn = vi.fn()
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({ data: 'success' });

            let attemptCount = 0;
            const delays: number[] = [];

            await queryClient.fetchQuery({
                queryKey: ['test-retry'],
                queryFn: async () => {
                    const result = await mockFn();
                    attemptCount++;
                    return result;
                },
                retry: (failureCount, error) => {
                    const shouldRetry = shouldRetryContractRead(failureCount, error);
                    if (shouldRetry) {
                        delays.push(exponentialBackoff(failureCount));
                    }
                    return shouldRetry;
                },
            });

            expect(mockFn).toHaveBeenCalledTimes(3);
            expect(delays).toEqual([1000, 2000]); // First and second retry delays
        });

        it('should not retry contract errors', async () => {
            const mockFn = vi.fn()
                .mockRejectedValue(new Error('execution reverted'));

            try {
                await queryClient.fetchQuery({
                    queryKey: ['test-no-retry'],
                    queryFn: mockFn,
                    retry: shouldRetryContractRead,
                });
            } catch (error) {
                // Expected to fail
            }

            expect(mockFn).toHaveBeenCalledTimes(1); // No retries
        });

        it('should stop after max retries', async () => {
            const mockFn = vi.fn()
                .mockRejectedValue(new Error('Network error'));

            try {
                await queryClient.fetchQuery({
                    queryKey: ['test-max-retry'],
                    queryFn: mockFn,
                    retry: shouldRetryContractRead,
                });
            } catch (error) {
                // Expected to fail after max retries
            }

            expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
        });
    });
});

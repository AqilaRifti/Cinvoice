import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePurchaseInvoice, useRepayInvoice, usePurchasePrice, useInvestment, usePlatformFee } from '../use-financing-pool';
import * as wagmi from 'wagmi';
import * as wagmiActions from 'wagmi/actions';

// Mock wagmi
vi.mock('wagmi', () => ({
    useWriteContract: vi.fn(),
    useWatchContractEvent: vi.fn(),
}));

vi.mock('wagmi/actions', () => ({
    waitForTransactionReceipt: vi.fn(),
    readContract: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

// Test wrapper with QueryClient
function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
    );
}

describe('FinancingPool Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('usePurchaseInvoice', () => {
        it('should purchase invoice successfully', async () => {
            const mockWriteContractAsync = vi.fn().mockResolvedValue('0xhash');
            const mockWaitForReceipt = vi.fn().mockResolvedValue({ status: 'success' });

            vi.mocked(wagmi.useWriteContract).mockReturnValue({
                writeContractAsync: mockWriteContractAsync,
            } as any);

            vi.mocked(wagmiActions.waitForTransactionReceipt).mockImplementation(mockWaitForReceipt);

            const { result } = renderHook(() => usePurchaseInvoice(), {
                wrapper: createWrapper(),
            });

            await result.current.mutateAsync({
                tokenId: 1,
                smb: '0x123' as `0x${string}`,
                purchasePrice: BigInt(95),
            });

            expect(mockWriteContractAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    functionName: 'purchaseInvoice',
                    args: [BigInt(1), '0x123'],
                    value: BigInt(95),
                })
            );
            expect(mockWaitForReceipt).toHaveBeenCalled();
        });

        it('should handle purchase errors', async () => {
            const mockError = new Error('Insufficient funds');
            const mockWriteContractAsync = vi.fn().mockRejectedValue(mockError);

            vi.mocked(wagmi.useWriteContract).mockReturnValue({
                writeContractAsync: mockWriteContractAsync,
            } as any);

            const { result } = renderHook(() => usePurchaseInvoice(), {
                wrapper: createWrapper(),
            });

            await expect(
                result.current.mutateAsync({
                    tokenId: 1,
                    smb: '0x123' as `0x${string}`,
                    purchasePrice: BigInt(95),
                })
            ).rejects.toThrow('Insufficient funds');
        });
    });

    describe('useRepayInvoice', () => {
        it('should repay invoice successfully', async () => {
            const mockWriteContractAsync = vi.fn().mockResolvedValue('0xhash');
            const mockWaitForReceipt = vi.fn().mockResolvedValue({ status: 'success' });

            vi.mocked(wagmi.useWriteContract).mockReturnValue({
                writeContractAsync: mockWriteContractAsync,
            } as any);

            vi.mocked(wagmiActions.waitForTransactionReceipt).mockImplementation(mockWaitForReceipt);

            const { result } = renderHook(() => useRepayInvoice(), {
                wrapper: createWrapper(),
            });

            await result.current.mutateAsync({
                tokenId: 1,
                faceValue: BigInt(100),
            });

            expect(mockWriteContractAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    functionName: 'repayInvoice',
                    args: [BigInt(1)],
                    value: BigInt(100),
                })
            );
            expect(mockWaitForReceipt).toHaveBeenCalled();
        });
    });

    describe('usePurchasePrice', () => {
        it('should fetch purchase price successfully', async () => {
            const mockReadContract = vi.fn().mockResolvedValue(BigInt(95));
            vi.mocked(wagmiActions.readContract).mockImplementation(mockReadContract);

            const { result } = renderHook(
                () => usePurchasePrice(1, '0x123' as `0x${string}`),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.purchasePrice).toBe(BigInt(95));
            expect(mockReadContract).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    functionName: 'calculatePurchasePrice',
                    args: [BigInt(1), '0x123'],
                })
            );
        });

        it('should not fetch when SMB address is missing', () => {
            const { result } = renderHook(() => usePurchasePrice(1, undefined), {
                wrapper: createWrapper(),
            });

            expect(result.current.purchasePrice).toBeUndefined();
        });
    });

    describe('useInvestment', () => {
        it('should fetch investment details successfully', async () => {
            const mockInvestment = {
                investor: '0xabc' as `0x${string}`,
                purchasePrice: BigInt(95),
                purchaseTimestamp: BigInt(1234567890),
            };

            const mockReadContract = vi.fn().mockResolvedValue(mockInvestment);
            vi.mocked(wagmiActions.readContract).mockImplementation(mockReadContract);

            const { result } = renderHook(() => useInvestment(1), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.investment).toEqual({
                investor: '0xabc',
                purchasePrice: BigInt(95),
                purchaseTimestamp: 1234567890,
            });
        });

        it('should return null when investment does not exist', async () => {
            const mockReadContract = vi.fn().mockResolvedValue(null);
            vi.mocked(wagmiActions.readContract).mockImplementation(mockReadContract);

            const { result } = renderHook(() => useInvestment(1), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.investment).toBeNull();
        });
    });

    describe('usePlatformFee', () => {
        it('should fetch platform fee successfully', async () => {
            const mockReadContract = vi.fn().mockResolvedValue(BigInt(500)); // 5%
            vi.mocked(wagmiActions.readContract).mockImplementation(mockReadContract);

            const { result } = renderHook(() => usePlatformFee(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.platformFee).toBe(500);
            expect(mockReadContract).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    functionName: 'platformFeePercent',
                })
            );
        });
    });
});

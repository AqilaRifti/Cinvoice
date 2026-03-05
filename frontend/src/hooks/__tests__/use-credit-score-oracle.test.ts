import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreditScore, useCreditProfile, useDiscountRate } from '../use-credit-score-oracle';
import * as wagmi from 'wagmi';
import * as wagmiActions from 'wagmi/actions';

// Mock wagmi
vi.mock('wagmi', () => ({
    useAccount: vi.fn(),
}));

vi.mock('wagmi/actions', () => ({
    readContract: vi.fn(),
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

describe('CreditScoreOracle Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useCreditScore', () => {
        it('should fetch credit score successfully', async () => {
            const mockAddress = '0x123' as `0x${string}`;
            const mockReadContract = vi.fn().mockResolvedValue(BigInt(750));

            vi.mocked(wagmi.useAccount).mockReturnValue({
                address: mockAddress,
            } as any);

            vi.mocked(wagmiActions.readContract).mockImplementation(mockReadContract);

            const { result } = renderHook(() => useCreditScore(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.score).toBe(750);
            expect(mockReadContract).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    functionName: 'getCreditScore',
                    args: [mockAddress],
                })
            );
        });

        it('should return default score of 500 when no address is connected', async () => {
            vi.mocked(wagmi.useAccount).mockReturnValue({
                address: undefined,
            } as any);

            const { result } = renderHook(() => useCreditScore(), {
                wrapper: createWrapper(),
            });

            expect(result.current.score).toBe(500);
        });

        it('should fetch credit score for a specific address', async () => {
            const mockAddress = '0xabc' as `0x${string}`;
            const mockReadContract = vi.fn().mockResolvedValue(BigInt(650));

            vi.mocked(wagmi.useAccount).mockReturnValue({
                address: '0x123' as `0x${string}`,
            } as any);

            vi.mocked(wagmiActions.readContract).mockImplementation(mockReadContract);

            const { result } = renderHook(() => useCreditScore(mockAddress), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.score).toBe(650);
            expect(mockReadContract).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    args: [mockAddress],
                })
            );
        });
    });

    describe('useCreditProfile', () => {
        it('should fetch credit profile successfully', async () => {
            const mockAddress = '0x123' as `0x${string}`;
            const mockProfile = {
                score: BigInt(750),
                lastUpdated: BigInt(1234567890),
                totalInvoices: BigInt(10),
                successfulRepayments: BigInt(8),
                defaults: BigInt(1),
            };

            const mockReadContract = vi.fn().mockResolvedValue(mockProfile);

            vi.mocked(wagmi.useAccount).mockReturnValue({
                address: mockAddress,
            } as any);

            vi.mocked(wagmiActions.readContract).mockImplementation(mockReadContract);

            const { result } = renderHook(() => useCreditProfile(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.profile).toEqual({
                score: 750,
                lastUpdated: 1234567890,
                totalInvoices: 10,
                successfulRepayments: 8,
                defaults: 1,
            });

            expect(mockReadContract).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    functionName: 'getCreditProfile',
                    args: [mockAddress],
                })
            );
        });

        it('should return null when no address is connected', async () => {
            vi.mocked(wagmi.useAccount).mockReturnValue({
                address: undefined,
            } as any);

            const { result } = renderHook(() => useCreditProfile(), {
                wrapper: createWrapper(),
            });

            expect(result.current.profile).toBeUndefined();
        });

        it('should return null when profile does not exist', async () => {
            const mockAddress = '0x123' as `0x${string}`;
            const mockReadContract = vi.fn().mockResolvedValue(null);

            vi.mocked(wagmi.useAccount).mockReturnValue({
                address: mockAddress,
            } as any);

            vi.mocked(wagmiActions.readContract).mockImplementation(mockReadContract);

            const { result } = renderHook(() => useCreditProfile(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.profile).toBeNull();
        });
    });

    describe('useDiscountRate', () => {
        it('should fetch discount rate successfully', async () => {
            const mockAddress = '0x123' as `0x${string}`;
            const mockReadContract = vi.fn().mockResolvedValue(BigInt(500)); // 5%

            vi.mocked(wagmi.useAccount).mockReturnValue({
                address: mockAddress,
            } as any);

            vi.mocked(wagmiActions.readContract).mockImplementation(mockReadContract);

            const { result } = renderHook(() => useDiscountRate(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.discountRate).toBe(500);
            expect(mockReadContract).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    functionName: 'getDiscountRate',
                    args: [mockAddress],
                })
            );
        });

        it('should return 0 when no address is connected', async () => {
            vi.mocked(wagmi.useAccount).mockReturnValue({
                address: undefined,
            } as any);

            const { result } = renderHook(() => useDiscountRate(), {
                wrapper: createWrapper(),
            });

            expect(result.current.discountRate).toBe(0);
        });

        it('should fetch discount rate for a specific address', async () => {
            const mockAddress = '0xabc' as `0x${string}`;
            const mockReadContract = vi.fn().mockResolvedValue(BigInt(300)); // 3%

            vi.mocked(wagmi.useAccount).mockReturnValue({
                address: '0x123' as `0x${string}`,
            } as any);

            vi.mocked(wagmiActions.readContract).mockImplementation(mockReadContract);

            const { result } = renderHook(() => useDiscountRate(mockAddress), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.discountRate).toBe(300);
            expect(mockReadContract).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    args: [mockAddress],
                })
            );
        });
    });
});

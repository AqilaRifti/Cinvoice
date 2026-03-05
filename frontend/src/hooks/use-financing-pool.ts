import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWriteContract, useWatchContractEvent } from 'wagmi';
import { waitForTransactionReceipt, readContract } from 'wagmi/actions';
import { toast } from 'sonner';
import { CONTRACT_ADDRESSES, FINANCING_POOL_ABI } from '@/lib/contracts';
import { queryKeys } from '@/lib/query-client';
import { config } from '@/lib/wagmi';

// ============================================================================
// Types
// ============================================================================

export interface Investment {
    investor: `0x${string}`;
    purchasePrice: bigint;
    purchaseTimestamp: number;
}

export interface PurchaseInvoiceParams {
    tokenId: number;
    purchasePrice: bigint;
}

export interface RepayInvoiceParams {
    tokenId: number;
    faceValue: bigint;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to purchase an invoice NFT
 * 
 * @returns Mutation object with mutateAsync function to purchase invoice
 * 
 * @example
 * const { mutateAsync, isPending } = usePurchaseInvoice();
 * 
 * await mutateAsync({
 *   tokenId: 1,
 *   smb: '0x123...',
 *   purchasePrice: parseEther('95')
 * });
 */
export function usePurchaseInvoice() {
    const queryClient = useQueryClient();
    const { writeContractAsync } = useWriteContract();

    return useMutation({
        mutationFn: async (params: PurchaseInvoiceParams) => {
            // Submit transaction
            const hash = await writeContractAsync({
                address: CONTRACT_ADDRESSES.FinancingPool,
                abi: FINANCING_POOL_ABI,
                functionName: 'purchaseInvoice',
                args: [BigInt(params.tokenId)],
                value: params.purchasePrice,
            });

            // Wait for confirmation
            const receipt = await waitForTransactionReceipt(config, { hash });
            return receipt;
        },
        onSuccess: (_, variables) => {
            // Invalidate relevant queries to trigger refetch
            queryClient.invalidateQueries({
                queryKey: queryKeys.invoices.detail(variables.tokenId),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.platform.stats() });
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
        },
        onError: (error) => {
            console.error('Failed to purchase invoice:', error);
        },
    });
}

/**
 * Hook to repay an invoice
 * 
 * @returns Mutation object with mutateAsync function to repay invoice
 * 
 * @example
 * const { mutateAsync, isPending } = useRepayInvoice();
 * 
 * await mutateAsync({
 *   tokenId: 1,
 *   faceValue: parseEther('100')
 * });
 */
export function useRepayInvoice() {
    const queryClient = useQueryClient();
    const { writeContractAsync } = useWriteContract();

    return useMutation({
        mutationFn: async (params: RepayInvoiceParams) => {
            // Submit transaction
            const hash = await writeContractAsync({
                address: CONTRACT_ADDRESSES.FinancingPool,
                abi: FINANCING_POOL_ABI,
                functionName: 'repayInvoice',
                args: [BigInt(params.tokenId)],
                value: params.faceValue,
            });

            // Wait for confirmation
            const receipt = await waitForTransactionReceipt(config, { hash });
            return receipt;
        },
        onSuccess: (_, variables) => {
            // Invalidate relevant queries to trigger refetch
            queryClient.invalidateQueries({
                queryKey: queryKeys.invoices.detail(variables.tokenId),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.platform.stats() });
        },
        onError: (error) => {
            console.error('Failed to repay invoice:', error);
        },
    });
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to calculate the purchase price for an invoice
 * 
 * @param tokenId - The token ID of the invoice
 * @returns Query object with purchase price
 * 
 * @example
 * const { purchasePrice, isLoading } = usePurchasePrice(1);
 */
export function usePurchasePrice(tokenId: number) {
    const query = useQuery({
        queryKey: queryKeys.investment.purchasePrice(tokenId),
        queryFn: async () => {
            console.log('🔍 Fetching purchase price for token:', tokenId);
            console.log('📍 FinancingPool address:', CONTRACT_ADDRESSES.FinancingPool);

            try {
                const price = await readContract(config, {
                    address: CONTRACT_ADDRESSES.FinancingPool,
                    abi: FINANCING_POOL_ABI,
                    functionName: 'calculatePurchasePrice',
                    args: [BigInt(tokenId)],
                });

                console.log('✅ Purchase price fetched:', price?.toString());
                return price;
            } catch (error) {
                console.error('❌ Error fetching purchase price:', error);
                throw error;
            }
        },
        staleTime: 30_000, // 30 seconds
        enabled: tokenId >= 0,
        retry: 3,
        retryDelay: 1000,
    });

    console.log('📊 Purchase price query state:', {
        data: query.data?.toString(),
        isLoading: query.isLoading,
        error: query.error,
        status: query.status,
    });

    return {
        purchasePrice: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook to fetch investment details for a specific invoice
 * 
 * @param tokenId - The token ID of the invoice
 * @returns Query object with investment details
 * 
 * @example
 * const { investment, isLoading } = useInvestment(1);
 */
export function useInvestment(tokenId: number) {
    const query = useQuery({
        queryKey: queryKeys.investment.detail(tokenId),
        queryFn: async () => {
            const investment = await readContract(config, {
                address: CONTRACT_ADDRESSES.FinancingPool,
                abi: FINANCING_POOL_ABI,
                functionName: 'getInvestment',
                args: [BigInt(tokenId)],
            });

            if (!investment) {
                return null;
            }

            return {
                investor: investment.investor,
                purchasePrice: investment.purchasePrice,
                purchaseTimestamp: Number(investment.purchaseTimestamp),
            } as Investment;
        },
        staleTime: 30_000, // 30 seconds
        enabled: tokenId >= 0,
    });

    return {
        investment: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook to fetch the platform fee percentage
 * 
 * @returns Query object with platform fee (in basis points)
 * 
 * @example
 * const { platformFee, isLoading } = usePlatformFee();
 * // platformFee might be 500 (representing 5%)
 */
export function usePlatformFee() {
    const query = useQuery({
        queryKey: queryKeys.platform.fee(),
        queryFn: async () => {
            const fee = await readContract(config, {
                address: CONTRACT_ADDRESSES.FinancingPool,
                abi: FINANCING_POOL_ABI,
                functionName: 'platformFeePercent',
            });

            return Number(fee);
        },
        staleTime: 5 * 60_000, // 5 minutes (fee changes infrequently)
    });

    return {
        platformFee: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================================================
// Event Listener Hook
// ============================================================================

/**
 * Hook to listen for FinancingPool contract events and update UI accordingly
 * 
 * This hook should be registered once at the app level (in a provider or layout)
 * to listen for events and automatically update the UI via query invalidation
 * and toast notifications.
 * 
 * @example
 * // In your app layout or provider:
 * function EventListeners() {
 *   useFinancingPoolEvents();
 *   return null;
 * }
 */
export function useFinancingPoolEvents() {
    const queryClient = useQueryClient();

    // Listen for InvoicePurchased events
    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.FinancingPool,
        abi: FINANCING_POOL_ABI,
        eventName: 'InvoicePurchased',
        onLogs: (logs) => {
            logs.forEach((log) => {
                const { tokenId, investor, purchasePrice } = log.args;

                // Invalidate queries to trigger refetch
                queryClient.invalidateQueries({
                    queryKey: queryKeys.invoices.detail(Number(tokenId)),
                });
                queryClient.invalidateQueries({
                    queryKey: queryKeys.user.investments(investor!),
                });
                queryClient.invalidateQueries({ queryKey: queryKeys.platform.stats() });
                queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });

                // Show success notification
                toast.success(`Invoice #${tokenId} purchased`, {
                    description: `Purchase price: ${purchasePrice?.toString()} wei`,
                });
            });
        },
    });

    // Listen for InvoiceRepaid events
    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.FinancingPool,
        abi: FINANCING_POOL_ABI,
        eventName: 'InvoiceRepaid',
        onLogs: (logs) => {
            logs.forEach((log) => {
                const { tokenId, smb, amount } = log.args;

                // Invalidate queries to trigger refetch
                queryClient.invalidateQueries({
                    queryKey: queryKeys.invoices.detail(Number(tokenId)),
                });
                queryClient.invalidateQueries({
                    queryKey: queryKeys.user.invoices(smb!),
                });
                queryClient.invalidateQueries({ queryKey: queryKeys.platform.stats() });

                // Show success notification
                toast.success(`Invoice #${tokenId} repaid successfully`, {
                    description: `Amount: ${amount?.toString()} wei`,
                });
            });
        },
    });

    // Listen for InvoiceDefaulted events
    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.FinancingPool,
        abi: FINANCING_POOL_ABI,
        eventName: 'InvoiceDefaulted',
        onLogs: (logs) => {
            logs.forEach((log) => {
                const { tokenId, smb } = log.args;

                // Invalidate queries to trigger refetch
                queryClient.invalidateQueries({
                    queryKey: queryKeys.invoices.detail(Number(tokenId)),
                });
                queryClient.invalidateQueries({
                    queryKey: queryKeys.user.invoices(smb!),
                });
                queryClient.invalidateQueries({ queryKey: queryKeys.platform.stats() });

                // Show warning notification
                toast.error(`Invoice #${tokenId} marked as defaulted`, {
                    description: 'The invoice has passed its repayment date without payment',
                });
            });
        },
    });
}

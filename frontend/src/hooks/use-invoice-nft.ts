import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWriteContract, useWatchContractEvent, useReadContract } from 'wagmi';
import { waitForTransactionReceipt, readContract } from 'wagmi/actions';
import { toast } from 'sonner';
import { CONTRACT_ADDRESSES, INVOICE_NFT_ABI, InvoiceState } from '@/lib/contracts';
import { queryKeys } from '@/lib/query-client';
import { config } from '@/lib/wagmi';

// ============================================================================
// Types
// ============================================================================

export interface Invoice {
    tokenId: number;
    faceValue: bigint;
    repaymentDate: number;
    smb: `0x${string}`;
    state: InvoiceState;
    metadataURI: string;
    creditScoreAtMinting: number;
}

export interface MintInvoiceParams {
    metadataURI: string;
    faceValue: bigint;
    repaymentDate: bigint;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to mint a new invoice NFT
 * 
 * @returns Mutation object with mutateAsync function to mint invoice
 * 
 * @example
 * const { mutateAsync, isPending } = useMintInvoice();
 * 
 * await mutateAsync({
 *   metadataURI: 'ipfs://...',
 *   faceValue: parseEther('100'),
 *   repaymentDate: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000)
 * });
 */
export function useMintInvoice() {
    const queryClient = useQueryClient();
    const { writeContractAsync } = useWriteContract();

    return useMutation({
        mutationFn: async (params: MintInvoiceParams) => {
            // Submit transaction
            const hash = await writeContractAsync({
                address: CONTRACT_ADDRESSES.InvoiceNFT,
                abi: INVOICE_NFT_ABI,
                functionName: 'mintInvoice',
                args: [params.metadataURI, params.faceValue, params.repaymentDate],
            });

            // Wait for confirmation
            const receipt = await waitForTransactionReceipt(config, { hash });
            return receipt;
        },
        onSuccess: () => {
            // Invalidate relevant queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.platform.stats() });
        },
        onError: (error) => {
            console.error('Failed to mint invoice:', error);
        },
    });
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch details for a specific invoice
 * 
 * @param tokenId - The token ID of the invoice
 * @returns Query object with invoice details
 * 
 * @example
 * const { invoice, isLoading, error } = useInvoiceDetails(1);
 */
export function useInvoiceDetails(tokenId: number) {
    const query = useQuery({
        queryKey: queryKeys.invoices.detail(tokenId),
        queryFn: async () => {
            const invoice = await readContract(config, {
                address: CONTRACT_ADDRESSES.InvoiceNFT,
                abi: INVOICE_NFT_ABI,
                functionName: 'getInvoiceDetails',
                args: [BigInt(tokenId)],
            });

            if (!invoice) {
                throw new Error(`Invoice ${tokenId} not found`);
            }

            return {
                tokenId,
                faceValue: invoice.faceValue,
                repaymentDate: Number(invoice.repaymentDate),
                smb: invoice.smb,
                state: invoice.state as InvoiceState,
                metadataURI: invoice.metadataURI,
                creditScoreAtMinting: Number(invoice.creditScoreAtMinting),
            } as Invoice;
        },
        staleTime: 30_000, // 30 seconds
        enabled: tokenId >= 0,
    });

    return {
        invoice: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook to fetch all invoices owned by a user
 * 
 * @param address - Optional user address (defaults to connected wallet)
 * @returns Query object with user's invoices
 * 
 * @example
 * const { invoices, isLoading } = useUserInvoices();
 * const { invoices: otherUserInvoices } = useUserInvoices('0x123...');
 */
export function useUserInvoices(address?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const userAddress = address || connectedAddress;

    // Get user's invoice balance
    const { data: balance } = useReadContract({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        functionName: 'balanceOf',
        args: userAddress ? [userAddress] : undefined,
        query: {
            enabled: !!userAddress,
        },
    });

    // Get total number of invoices minted
    const { data: nextTokenId } = useReadContract({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        functionName: 'nextTokenId',
    });

    const query = useQuery({
        queryKey: queryKeys.user.invoices(userAddress!),
        queryFn: async () => {
            if (!userAddress || !nextTokenId) {
                return [];
            }

            const userInvoices: Invoice[] = [];
            const totalTokens = Number(nextTokenId);

            // Iterate through all tokens to find user's invoices
            // Note: In production, this should use events/indexer for better performance
            for (let i = 0; i < totalTokens; i++) {
                try {
                    // Check ownership
                    const owner = await readContract(config, {
                        address: CONTRACT_ADDRESSES.InvoiceNFT,
                        abi: INVOICE_NFT_ABI,
                        functionName: 'ownerOf',
                        args: [BigInt(i)],
                    });

                    if (owner?.toLowerCase() === userAddress.toLowerCase()) {
                        // Fetch invoice details
                        const details = await readContract(config, {
                            address: CONTRACT_ADDRESSES.InvoiceNFT,
                            abi: INVOICE_NFT_ABI,
                            functionName: 'getInvoiceDetails',
                            args: [BigInt(i)],
                        });

                        if (details) {
                            userInvoices.push({
                                tokenId: i,
                                faceValue: details.faceValue,
                                repaymentDate: Number(details.repaymentDate),
                                smb: details.smb,
                                state: details.state as InvoiceState,
                                metadataURI: details.metadataURI,
                                creditScoreAtMinting: Number(details.creditScoreAtMinting),
                            });
                        }
                    }
                } catch (error) {
                    // Token might not exist or be burned, skip it
                    console.debug(`Skipping token ${i}:`, error);
                }
            }

            return userInvoices;
        },
        enabled: !!userAddress && !!nextTokenId,
        staleTime: 30_000, // 30 seconds
    });

    return {
        invoices: query.data || [],
        balance: balance ? Number(balance) : 0,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================================================
// Event Listener Hook
// ============================================================================

/**
 * Hook to listen for InvoiceNFT contract events and update UI accordingly
 * 
 * This hook should be registered once at the app level (in a provider or layout)
 * to listen for events and automatically update the UI via query invalidation
 * and toast notifications.
 * 
 * @example
 * // In your app layout or provider:
 * function EventListeners() {
 *   useInvoiceEvents();
 *   return null;
 * }
 */
export function useInvoiceEvents() {
    const queryClient = useQueryClient();

    // Listen for InvoiceMinted events
    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        eventName: 'InvoiceMinted',
        onLogs: (logs) => {
            logs.forEach((log) => {
                const { tokenId, smb, faceValue, repaymentDate } = log.args;

                // Invalidate queries to trigger refetch
                queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
                queryClient.invalidateQueries({ queryKey: queryKeys.user.invoices(smb!) });
                queryClient.invalidateQueries({ queryKey: queryKeys.platform.stats() });

                // Show success notification
                toast.success(`Invoice #${tokenId} minted successfully`, {
                    description: `Face value: ${faceValue?.toString()} wei`,
                });
            });
        },
    });

    // Listen for InvoiceStateChanged events
    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        eventName: 'InvoiceStateChanged',
        onLogs: (logs) => {
            logs.forEach((log) => {
                const { tokenId, newState } = log.args;

                // Invalidate specific invoice query
                queryClient.invalidateQueries({
                    queryKey: queryKeys.invoices.detail(Number(tokenId)),
                });

                // Invalidate lists that might include this invoice
                queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });

                // Show notification with state change
                const stateLabel = InvoiceState[newState as number];
                toast.info(`Invoice #${tokenId} state changed`, {
                    description: `New state: ${stateLabel}`,
                });
            });
        },
    });
}

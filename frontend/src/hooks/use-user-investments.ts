import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { CONTRACT_ADDRESSES, INVOICE_NFT_ABI, FINANCING_POOL_ABI, InvoiceState } from '@/lib/contracts';
import { queryKeys } from '@/lib/query-client';
import { config } from '@/lib/wagmi';

// ============================================================================
// Types
// ============================================================================

export interface InvestmentWithDetails {
    tokenId: number;
    faceValue: bigint;
    purchasePrice: bigint;
    purchaseTimestamp: number;
    repaymentDate: number;
    state: InvoiceState;
    smb: `0x${string}`;
}

export interface PortfolioStats {
    totalInvested: bigint;
    totalReturned: bigint;
    activeInvestments: number;
    roi: number; // percentage
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to fetch all investments for the connected user
 * 
 * @returns Query object with user's investments and portfolio statistics
 * 
 * @example
 * const { investments, stats, isLoading } = useUserInvestments();
 */
export function useUserInvestments() {
    const { address } = useAccount();

    const query = useQuery({
        queryKey: address ? queryKeys.user.investments(address) : ['investments', 'disconnected'],
        queryFn: async () => {
            if (!address) {
                return { investments: [], stats: null };
            }

            // Get the total number of invoices
            const nextTokenId = await readContract(config, {
                address: CONTRACT_ADDRESSES.InvoiceNFT,
                abi: INVOICE_NFT_ABI,
                functionName: 'nextTokenId',
            });

            const totalInvoices = Number(nextTokenId);
            const investments: InvestmentWithDetails[] = [];

            // Check each invoice to see if the user is the investor
            for (let tokenId = 0; tokenId < totalInvoices; tokenId++) {
                try {
                    // Get investment details
                    const investment = await readContract(config, {
                        address: CONTRACT_ADDRESSES.FinancingPool,
                        abi: FINANCING_POOL_ABI,
                        functionName: 'getInvestment',
                        args: [BigInt(tokenId)],
                    });

                    // Check if this user is the investor
                    if (investment.investor.toLowerCase() === address.toLowerCase()) {
                        // Get invoice details
                        const invoiceDetails = await readContract(config, {
                            address: CONTRACT_ADDRESSES.InvoiceNFT,
                            abi: INVOICE_NFT_ABI,
                            functionName: 'getInvoiceDetails',
                            args: [BigInt(tokenId)],
                        });

                        investments.push({
                            tokenId,
                            faceValue: invoiceDetails.faceValue,
                            purchasePrice: investment.purchasePrice,
                            purchaseTimestamp: Number(investment.purchaseTimestamp),
                            repaymentDate: Number(invoiceDetails.repaymentDate),
                            state: invoiceDetails.state,
                            smb: invoiceDetails.smb,
                        });
                    }
                } catch (error) {
                    // Skip invoices that don't have investments yet
                    continue;
                }
            }

            // Calculate portfolio statistics
            const stats = calculatePortfolioStats(investments);

            return { investments, stats };
        },
        staleTime: 30_000, // 30 seconds
        enabled: !!address,
    });

    return {
        investments: query.data?.investments || [],
        stats: query.data?.stats || null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate portfolio statistics from investments
 */
function calculatePortfolioStats(investments: InvestmentWithDetails[]): PortfolioStats {
    if (investments.length === 0) {
        return {
            totalInvested: 0n,
            totalReturned: 0n,
            activeInvestments: 0,
            roi: 0,
        };
    }

    const totalInvested = investments.reduce((sum, inv) => sum + inv.purchasePrice, 0n);

    // Total returned is the sum of face values for repaid invoices
    const totalReturned = investments
        .filter((inv) => inv.state === InvoiceState.Repaid)
        .reduce((sum, inv) => sum + inv.faceValue, 0n);

    // Active investments are those in Funded state
    const activeInvestments = investments.filter(
        (inv) => inv.state === InvoiceState.Funded
    ).length;

    // Calculate ROI
    // For repaid invoices: (faceValue - purchasePrice) / purchasePrice
    // For active invoices: potential ROI based on face value
    const totalExpectedValue = investments.reduce((sum, inv) => {
        if (inv.state === InvoiceState.Repaid) {
            return sum + inv.faceValue;
        } else if (inv.state === InvoiceState.Funded) {
            return sum + inv.faceValue; // Expected return
        }
        return sum; // Defaulted invoices don't contribute
    }, 0n);

    const roi = totalInvested > 0n
        ? Number((totalExpectedValue - totalInvested) * 10000n / totalInvested) / 100
        : 0;

    return {
        totalInvested,
        totalReturned,
        activeInvestments,
        roi,
    };
}

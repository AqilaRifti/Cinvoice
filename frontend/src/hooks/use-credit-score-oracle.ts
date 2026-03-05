import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { CONTRACT_ADDRESSES, CREDIT_ORACLE_ABI } from '@/lib/contracts';
import { queryKeys } from '@/lib/query-client';
import { config } from '@/lib/wagmi';

// ============================================================================
// Types
// ============================================================================

export interface CreditProfile {
    score: number;
    lastUpdated: number;
    totalInvoices: number;
    successfulRepayments: number;
    defaults: number;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch credit score for a user
 * 
 * @param address - Optional user address (defaults to connected wallet)
 * @returns Query object with credit score (300-850 range)
 * 
 * @example
 * const { score, isLoading } = useCreditScore();
 * const { score: otherUserScore } = useCreditScore('0x123...');
 */
export function useCreditScore(address?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = address || connectedAddress;

    const query = useQuery({
        queryKey: queryKeys.user.creditScore(targetAddress!),
        queryFn: async () => {
            if (!targetAddress) {
                return 500; // Default score for new users
            }

            const score = await readContract(config, {
                address: CONTRACT_ADDRESSES.CreditScoreOracle,
                abi: CREDIT_ORACLE_ABI,
                functionName: 'getCreditScore',
                args: [targetAddress],
            });

            return Number(score);
        },
        staleTime: 30_000, // 30 seconds
        enabled: !!targetAddress,
    });

    return {
        score: query.data ?? 500, // Default to 500 for new users
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook to fetch credit profile for a user
 * 
 * @param address - Optional user address (defaults to connected wallet)
 * @returns Query object with detailed credit profile
 * 
 * @example
 * const { profile, isLoading } = useCreditProfile();
 * // profile contains: score, lastUpdated, totalInvoices, successfulRepayments, defaults
 */
export function useCreditProfile(address?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = address || connectedAddress;

    const query = useQuery({
        queryKey: queryKeys.user.creditProfile(targetAddress!),
        queryFn: async () => {
            if (!targetAddress) {
                return null;
            }

            const profile = await readContract(config, {
                address: CONTRACT_ADDRESSES.CreditScoreOracle,
                abi: CREDIT_ORACLE_ABI,
                functionName: 'getCreditProfile',
                args: [targetAddress],
            });

            if (!profile) {
                return null;
            }

            return {
                score: Number(profile.score),
                lastUpdated: Number(profile.lastUpdated),
                totalInvoices: Number(profile.totalInvoices),
                successfulRepayments: Number(profile.successfulRepayments),
                defaults: Number(profile.defaults),
            } as CreditProfile;
        },
        staleTime: 30_000, // 30 seconds
        enabled: !!targetAddress,
    });

    return {
        profile: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook to fetch discount rate for a user based on their credit score
 * 
 * @param address - Optional user address (defaults to connected wallet)
 * @returns Query object with discount rate (in basis points)
 * 
 * @example
 * const { discountRate, isLoading } = useDiscountRate();
 * // discountRate might be 500 (representing 5%)
 */
export function useDiscountRate(address?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = address || connectedAddress;

    const query = useQuery({
        queryKey: ['discountRate', targetAddress],
        queryFn: async () => {
            if (!targetAddress) {
                return 0;
            }

            const rate = await readContract(config, {
                address: CONTRACT_ADDRESSES.CreditScoreOracle,
                abi: CREDIT_ORACLE_ABI,
                functionName: 'getDiscountRate',
                args: [targetAddress],
            });

            return Number(rate); // basis points
        },
        staleTime: 30_000, // 30 seconds
        enabled: !!targetAddress,
    });

    return {
        discountRate: query.data ?? 0,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

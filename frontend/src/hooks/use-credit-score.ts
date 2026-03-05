import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CREDIT_ORACLE_ABI } from '@/lib/contracts';

export function useCreditScore(address?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = address || connectedAddress;

    const { data: score, isLoading: scoreLoading } = useReadContract({
        address: CONTRACT_ADDRESSES.CreditScoreOracle,
        abi: CREDIT_ORACLE_ABI,
        functionName: 'getCreditScore',
        args: targetAddress ? [targetAddress] : undefined,
        query: {
            enabled: !!targetAddress,
        },
    });

    const { data: discountRate, isLoading: discountLoading } = useReadContract({
        address: CONTRACT_ADDRESSES.CreditScoreOracle,
        abi: CREDIT_ORACLE_ABI,
        functionName: 'getDiscountRate',
        args: targetAddress ? [targetAddress] : undefined,
        query: {
            enabled: !!targetAddress,
        },
    });

    const { data: profile, isLoading: profileLoading } = useReadContract({
        address: CONTRACT_ADDRESSES.CreditScoreOracle,
        abi: CREDIT_ORACLE_ABI,
        functionName: 'getCreditProfile',
        args: targetAddress ? [targetAddress] : undefined,
        query: {
            enabled: !!targetAddress,
        },
    });

    return {
        score: score ? Number(score) : 500, // Default to 500 for new users
        discountRate: discountRate ? Number(discountRate) : 0,
        profile: profile
            ? {
                score: Number(profile.score),
                lastUpdated: Number(profile.lastUpdated),
                totalInvoices: Number(profile.totalInvoices),
                successfulRepayments: Number(profile.successfulRepayments),
                defaults: Number(profile.defaults),
            }
            : null,
        isLoading: scoreLoading || discountLoading || profileLoading,
    };
}

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, INVOICE_NFT_ABI, GOVERNANCE_ABI } from '@/lib/contracts';

export function usePlatformStats() {
    const { data: nextTokenId, isLoading: tokenIdLoading } = useReadContract({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        functionName: 'nextTokenId',
    });

    const { data: treasuryBalance, isLoading: treasuryLoading } = useReadContract({
        address: CONTRACT_ADDRESSES.PlatformGovernance,
        abi: GOVERNANCE_ABI,
        functionName: 'getTreasuryBalance',
    });

    const totalInvoices = nextTokenId ? Number(nextTokenId) : 0;

    return {
        totalInvoices,
        treasuryBalance: treasuryBalance || 0n,
        isLoading: tokenIdLoading || treasuryLoading,
    };
}

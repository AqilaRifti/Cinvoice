import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, GOVERNANCE_ABI, INVOICE_NFT_ABI } from '@/lib/contracts';

export type UserRole = 'admin' | 'smb' | 'investor' | 'guest';

export function useUserRole() {
    const { address, isConnected } = useAccount();

    // Check if user is admin (check all 3 admin slots)
    const { data: admin0 } = useReadContract({
        address: CONTRACT_ADDRESSES.PlatformGovernance,
        abi: GOVERNANCE_ABI,
        functionName: 'admins',
        args: [0n],
    });

    const { data: admin1 } = useReadContract({
        address: CONTRACT_ADDRESSES.PlatformGovernance,
        abi: GOVERNANCE_ABI,
        functionName: 'admins',
        args: [1n],
    });

    const { data: admin2 } = useReadContract({
        address: CONTRACT_ADDRESSES.PlatformGovernance,
        abi: GOVERNANCE_ABI,
        functionName: 'admins',
        args: [2n],
    });

    // Check if user owns any invoices (SMB)
    const { data: invoiceBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && isConnected,
        },
    });

    if (!isConnected || !address) {
        return { role: 'guest' as UserRole, isAdmin: false, isSMB: false, isInvestor: false };
    }

    const isAdmin =
        address === admin0 || address === admin1 || address === admin2;

    const isSMB = invoiceBalance !== undefined && invoiceBalance > 0n;

    // For now, anyone connected who isn't admin or SMB can be investor
    // In production, you might want more sophisticated logic
    const isInvestor = !isAdmin && !isSMB;

    let role: UserRole = 'guest';
    if (isAdmin) role = 'admin';
    else if (isSMB) role = 'smb';
    else if (isInvestor) role = 'investor';

    return { role, isAdmin, isSMB, isInvestor };
}

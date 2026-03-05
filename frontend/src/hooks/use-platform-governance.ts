import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { waitForTransactionReceipt, readContract } from 'wagmi/actions';
import { CONTRACT_ADDRESSES, GOVERNANCE_ABI } from '@/lib/contracts';
import { queryKeys } from '@/lib/query-client';
import { config } from '@/lib/wagmi';

// ============================================================================
// Types
// ============================================================================

export enum ProposalType {
    Pause = 0,
    Unpause = 1,
    FeeAdjustment = 2,
    Whitelist = 3,
    Blacklist = 4,
    RemoveFromBlacklist = 5,
    TreasuryWithdraw = 6,
    DisputeResolution = 7,
}

export interface Proposal {
    proposalId: number;
    proposalType: ProposalType;
    target: `0x${string}`;
    data: `0x${string}`;
    value: bigint;
    approvers: `0x${string}`[];
    executed: boolean;
    createdAt: number;
}

export interface CreateProposalParams {
    proposalType: ProposalType;
    target: `0x${string}`;
    data: `0x${string}`;
    value: bigint;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to create a new governance proposal
 * 
 * @returns Mutation object with mutateAsync function to create proposal
 * 
 * @example
 * const { mutateAsync, isPending } = useCreateProposal();
 * 
 * await mutateAsync({
 *   proposalType: ProposalType.Pause,
 *   target: '0x0000000000000000000000000000000000000000',
 *   data: '0x',
 *   value: 0n
 * });
 */
export function useCreateProposal() {
    const queryClient = useQueryClient();
    const { writeContractAsync } = useWriteContract();

    return useMutation({
        mutationFn: async (params: CreateProposalParams) => {
            // Submit transaction
            const hash = await writeContractAsync({
                address: CONTRACT_ADDRESSES.PlatformGovernance,
                abi: GOVERNANCE_ABI,
                functionName: 'proposeAction',
                args: [params.proposalType, params.target, params.data, params.value],
            });

            // Wait for confirmation
            const receipt = await waitForTransactionReceipt(config, { hash });
            return receipt;
        },
        onSuccess: () => {
            // Invalidate relevant queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.governance.proposals() });
        },
        onError: (error) => {
            console.error('Failed to create proposal:', error);
        },
    });
}

/**
 * Hook to approve a governance proposal
 * 
 * @returns Mutation object with mutateAsync function to approve proposal
 * 
 * @example
 * const { mutateAsync, isPending } = useApproveProposal();
 * 
 * await mutateAsync(1); // Approve proposal with ID 1
 */
export function useApproveProposal() {
    const queryClient = useQueryClient();
    const { writeContractAsync } = useWriteContract();

    return useMutation({
        mutationFn: async (proposalId: number) => {
            // Submit transaction
            const hash = await writeContractAsync({
                address: CONTRACT_ADDRESSES.PlatformGovernance,
                abi: GOVERNANCE_ABI,
                functionName: 'approveProposal',
                args: [BigInt(proposalId)],
            });

            // Wait for confirmation
            const receipt = await waitForTransactionReceipt(config, { hash });
            return receipt;
        },
        onSuccess: (_, proposalId) => {
            // Invalidate relevant queries to trigger refetch
            queryClient.invalidateQueries({
                queryKey: queryKeys.governance.proposal(proposalId),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.governance.proposals() });
        },
        onError: (error) => {
            console.error('Failed to approve proposal:', error);
        },
    });
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch details for a specific proposal
 * 
 * @param proposalId - The ID of the proposal
 * @returns Query object with proposal details
 * 
 * @example
 * const { proposal, isLoading, error } = useProposal(1);
 */
export function useProposal(proposalId: number) {
    const query = useQuery({
        queryKey: queryKeys.governance.proposal(proposalId),
        queryFn: async () => {
            const proposal = await readContract(config, {
                address: CONTRACT_ADDRESSES.PlatformGovernance,
                abi: GOVERNANCE_ABI,
                functionName: 'getProposal',
                args: [BigInt(proposalId)],
            });

            if (!proposal) {
                throw new Error(`Proposal ${proposalId} not found`);
            }

            return {
                proposalId,
                proposalType: proposal.proposalType as ProposalType,
                target: proposal.target,
                data: proposal.data,
                value: proposal.value,
                approvers: proposal.approvers,
                executed: proposal.executed,
                createdAt: Number(proposal.createdAt),
            } as Proposal;
        },
        staleTime: 30_000, // 30 seconds
        enabled: proposalId >= 0,
    });

    return {
        proposal: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook to fetch the treasury balance
 * 
 * @returns Query object with treasury balance
 * 
 * @example
 * const { treasuryBalance, isLoading } = useTreasuryBalance();
 */
export function useTreasuryBalance() {
    const query = useQuery({
        queryKey: queryKeys.governance.treasury(),
        queryFn: async () => {
            const balance = await readContract(config, {
                address: CONTRACT_ADDRESSES.PlatformGovernance,
                abi: GOVERNANCE_ABI,
                functionName: 'getTreasuryBalance',
            });

            return balance;
        },
        staleTime: 30_000, // 30 seconds
    });

    return {
        treasuryBalance: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook to check if an address is an admin
 * 
 * @param address - Optional address to check (defaults to connected wallet)
 * @returns Query object with admin status
 * 
 * @example
 * const { isAdmin, isLoading } = useIsAdmin();
 * const { isAdmin: isOtherAdmin } = useIsAdmin('0x123...');
 */
export function useIsAdmin(address?: `0x${string}`) {
    const { address: connectedAddress } = useAccount();
    const targetAddress = address || connectedAddress;

    const { data, isLoading, error } = useReadContract({
        address: CONTRACT_ADDRESSES.PlatformGovernance,
        abi: GOVERNANCE_ABI,
        functionName: 'isAdmin',
        args: targetAddress ? [targetAddress] : undefined,
        query: {
            enabled: !!targetAddress,
            staleTime: 60_000, // 1 minute (admin status changes infrequently)
        },
    });

    return {
        isAdmin: data ?? false,
        isLoading,
        error,
    };
}

/**
 * Hook to check if the platform is paused
 * 
 * @returns Query object with paused status
 * 
 * @example
 * const { isPaused, isLoading } = useIsPaused();
 */
export function useIsPaused() {
    const query = useQuery({
        queryKey: queryKeys.platform.paused(),
        queryFn: async () => {
            const paused = await readContract(config, {
                address: CONTRACT_ADDRESSES.PlatformGovernance,
                abi: GOVERNANCE_ABI,
                functionName: 'paused',
            });

            return paused;
        },
        staleTime: 30_000, // 30 seconds
    });

    return {
        isPaused: query.data ?? false,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

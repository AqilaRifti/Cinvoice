import { isAddress } from 'viem';

// ============================================================================
// Network Configuration
// ============================================================================

export type NetworkName = 'creditcoin-testnet' | 'creditcoin-mainnet' | 'local';

export interface NetworkConfig {
    name: NetworkName;
    chainId: number;
    rpcUrl: string;
    blockExplorer?: string;
}

// Network configurations
export const NETWORKS: Record<NetworkName, NetworkConfig> = {
    'creditcoin-testnet': {
        name: 'creditcoin-testnet',
        chainId: 102031,
        rpcUrl: 'https://rpc.cc3-testnet.creditcoin.network',
        blockExplorer: 'https://creditcoin-testnet.blockscout.com',
    },
    'creditcoin-mainnet': {
        name: 'creditcoin-mainnet',
        chainId: 102030,
        rpcUrl: 'https://rpc.mainnet.creditcoin.network',
        blockExplorer: 'https://creditcoin.blockscout.com',
    },
    'local': {
        name: 'local',
        chainId: 31337,
        rpcUrl: 'http://localhost:8545',
    },
} as const;

// Get current network from environment
export function getCurrentNetwork(): NetworkConfig {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;

    if (!chainId) {
        console.warn('NEXT_PUBLIC_CHAIN_ID not set, defaulting to creditcoin-testnet');
        return NETWORKS['creditcoin-testnet'];
    }

    const network = Object.values(NETWORKS).find(n => n.chainId === Number(chainId));

    if (!network) {
        console.warn(`Unknown chain ID ${chainId}, defaulting to creditcoin-testnet`);
        return NETWORKS['creditcoin-testnet'];
    }

    return network;
}

// ============================================================================
// Contract Addresses
// ============================================================================

export interface ContractAddresses {
    CreditScoreOracle: `0x${string}`;
    PlatformGovernance: `0x${string}`;
    InvoiceNFT: `0x${string}`;
    FinancingPool: `0x${string}`;
}

// Contract addresses - loaded from environment variables
export const CONTRACT_ADDRESSES: ContractAddresses = {
    CreditScoreOracle: (process.env.NEXT_PUBLIC_CREDIT_ORACLE_ADDRESS || '0x') as `0x${string}`,
    PlatformGovernance: (process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS || '0x') as `0x${string}`,
    InvoiceNFT: (process.env.NEXT_PUBLIC_INVOICE_NFT_ADDRESS || '0x') as `0x${string}`,
    FinancingPool: (process.env.NEXT_PUBLIC_FINANCING_POOL_ADDRESS || '0x') as `0x${string}`,
} as const;

/**
 * Validate contract addresses using viem's isAddress function
 * @throws Error if any address is invalid
 */
export function validateContractAddresses(): void {
    const errors: string[] = [];

    Object.entries(CONTRACT_ADDRESSES).forEach(([name, address]) => {
        if (!address || address === '0x') {
            errors.push(`Missing contract address for ${name}`);
        } else if (!isAddress(address)) {
            errors.push(`Invalid contract address for ${name}: ${address}`);
        }
    });

    if (errors.length > 0) {
        const errorMessage = `Contract configuration errors:\n${errors.join('\n')}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    console.log('✓ All contract addresses validated successfully');
}

/**
 * Get block explorer URL for a transaction
 */
export function getExplorerUrl(txHash: string): string | undefined {
    const network = getCurrentNetwork();
    return network.blockExplorer ? `${network.blockExplorer}/tx/${txHash}` : undefined;
}

/**
 * Get block explorer URL for an address
 */
export function getAddressExplorerUrl(address: string): string | undefined {
    const network = getCurrentNetwork();
    return network.blockExplorer ? `${network.blockExplorer}/address/${address}` : undefined;
}

// ============================================================================
// Contract ABIs
// ============================================================================

// Contract ABIs - simplified versions for frontend use
export const CREDIT_ORACLE_ABI = [
    {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'getCreditScore',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'smb', type: 'address' }],
        name: 'getDiscountRate',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'getCreditProfile',
        outputs: [
            {
                components: [
                    { name: 'score', type: 'uint256' },
                    { name: 'lastUpdated', type: 'uint256' },
                    { name: 'totalInvoices', type: 'uint256' },
                    { name: 'successfulRepayments', type: 'uint256' },
                    { name: 'defaults', type: 'uint256' },
                ],
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

export const INVOICE_NFT_ABI = [
    {
        inputs: [
            { name: 'metadataURI', type: 'string' },
            { name: 'faceValue', type: 'uint256' },
            { name: 'repaymentDate', type: 'uint256' },
        ],
        name: 'mintInvoice',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'getInvoiceDetails',
        outputs: [
            {
                components: [
                    { name: 'faceValue', type: 'uint256' },
                    { name: 'repaymentDate', type: 'uint256' },
                    { name: 'smb', type: 'address' },
                    { name: 'state', type: 'uint8' },
                    { name: 'metadataURI', type: 'string' },
                    { name: 'creditScoreAtMinting', type: 'uint256' },
                ],
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'nextTokenId',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'ownerOf',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'tokenId', type: 'uint256' },
            { indexed: true, name: 'smb', type: 'address' },
            { indexed: false, name: 'faceValue', type: 'uint256' },
            { indexed: false, name: 'repaymentDate', type: 'uint256' },
        ],
        name: 'InvoiceMinted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'tokenId', type: 'uint256' },
            { indexed: false, name: 'newState', type: 'uint8' },
        ],
        name: 'InvoiceStateChanged',
        type: 'event',
    },
] as const;

export const FINANCING_POOL_ABI = [
    {
        inputs: [
            { name: 'tokenId', type: 'uint256' },
        ],
        name: 'calculatePurchasePrice',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'tokenId', type: 'uint256' },
        ],
        name: 'purchaseInvoice',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'repayInvoice',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'markAsDefaulted',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'getInvestment',
        outputs: [
            {
                components: [
                    { name: 'investor', type: 'address' },
                    { name: 'purchasePrice', type: 'uint256' },
                    { name: 'purchaseTimestamp', type: 'uint256' },
                ],
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'platformFeePercent',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'tokenId', type: 'uint256' },
            { indexed: true, name: 'investor', type: 'address' },
            { indexed: false, name: 'purchasePrice', type: 'uint256' },
        ],
        name: 'InvoicePurchased',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'tokenId', type: 'uint256' },
            { indexed: true, name: 'smb', type: 'address' },
            { indexed: false, name: 'amount', type: 'uint256' },
        ],
        name: 'InvoiceRepaid',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'tokenId', type: 'uint256' },
            { indexed: true, name: 'smb', type: 'address' },
        ],
        name: 'InvoiceDefaulted',
        type: 'event',
    },
] as const;

export const GOVERNANCE_ABI = [
    {
        inputs: [],
        name: 'paused',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'isBlacklisted',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'isWhitelisted',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: '', type: 'uint256' }],
        name: 'admins',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'admin', type: 'address' }],
        name: 'isAdmin',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getTreasuryBalance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'proposalType', type: 'uint8' },
            { name: 'target', type: 'address' },
            { name: 'data', type: 'bytes' },
            { name: 'value', type: 'uint256' },
        ],
        name: 'proposeAction',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'uint256' }],
        name: 'approveProposal',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'proposalId', type: 'uint256' }],
        name: 'getProposal',
        outputs: [
            {
                components: [
                    { name: 'proposalType', type: 'uint8' },
                    { name: 'target', type: 'address' },
                    { name: 'data', type: 'bytes' },
                    { name: 'value', type: 'uint256' },
                    { name: 'approvers', type: 'address[]' },
                    { name: 'executed', type: 'bool' },
                    { name: 'createdAt', type: 'uint256' },
                ],
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

// ============================================================================
// Invoice State Enum
// ============================================================================

// Invoice state enum
export enum InvoiceState {
    Pending = 0,
    Funded = 1,
    Repaid = 2,
    Defaulted = 3,
}

// Helper to get state label
export function getInvoiceStateLabel(state: InvoiceState): string {
    return InvoiceState[state];
}

// Helper to get state color
export function getInvoiceStateColor(state: InvoiceState): string {
    switch (state) {
        case InvoiceState.Pending:
            return 'blue';
        case InvoiceState.Funded:
            return 'yellow';
        case InvoiceState.Repaid:
            return 'green';
        case InvoiceState.Defaulted:
            return 'red';
        default:
            return 'gray';
    }
}

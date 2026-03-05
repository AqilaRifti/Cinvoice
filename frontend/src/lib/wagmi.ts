import { http } from 'wagmi';
import { defineChain } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// ============================================================================
// Chain Configuration
// ============================================================================

// Define Creditcoin Testnet chain
export const creditcoinTestnet = defineChain({
    id: 102031,
    name: 'Creditcoin Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Creditcoin',
        symbol: 'CTC',
    },
    rpcUrls: {
        default: {
            http: [
                'https://rpc.cc3-testnet.creditcoin.network',
                // Add fallback RPC endpoints if available
            ],
        },
        public: {
            http: [
                'https://rpc.cc3-testnet.creditcoin.network',
            ],
        },
    },
    blockExplorers: {
        default: {
            name: 'Creditcoin Explorer',
            url: 'https://explorer.testnet.creditcoin.org',
        },
    },
    testnet: true,
});

// ============================================================================
// Wagmi Configuration
// ============================================================================

// Create wagmi config with RainbowKit
export const config = getDefaultConfig({
    appName: 'Creditcoin Invoice Financing',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [creditcoinTestnet],
    transports: {
        [creditcoinTestnet.id]: http(undefined, {
            retryCount: 5,
            retryDelay: 1000,
            timeout: 30000,
        }),
    },
    ssr: true,
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get block explorer URL for a transaction
 */
export function getBlockExplorerUrl(txHash: string): string {
    return `${creditcoinTestnet.blockExplorers.default.url}/tx/${txHash}`;
}

/**
 * Get block explorer URL for an address
 */
export function getAddressExplorerUrl(address: string): string {
    return `${creditcoinTestnet.blockExplorers.default.url}/address/${address}`;
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars = 4): string {
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

import { describe, it, expect, vi } from 'vitest';
import { getCurrentNetwork, getExplorerUrl, getAddressExplorerUrl } from '../contracts';

describe('Contract Configuration', () => {
    describe('getCurrentNetwork', () => {
        it('should return creditcoin-testnet for chain ID 102031', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '102031');
            const network = getCurrentNetwork();

            expect(network.name).toBe('creditcoin-testnet');
            expect(network.chainId).toBe(102031);
            vi.unstubAllEnvs();
        });

        it('should return creditcoin-mainnet for chain ID 102030', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '102030');
            const network = getCurrentNetwork();

            expect(network.name).toBe('creditcoin-mainnet');
            expect(network.chainId).toBe(102030);
            vi.unstubAllEnvs();
        });

        it('should return local for chain ID 31337', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '31337');
            const network = getCurrentNetwork();

            expect(network.name).toBe('local');
            expect(network.chainId).toBe(31337);
            vi.unstubAllEnvs();
        });

        it('should default to creditcoin-testnet for unknown chain ID', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '999999');
            const network = getCurrentNetwork();

            expect(network.name).toBe('creditcoin-testnet');
            vi.unstubAllEnvs();
        });

        it('should default to creditcoin-testnet when chain ID is not set', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '');
            const network = getCurrentNetwork();

            expect(network.name).toBe('creditcoin-testnet');
            vi.unstubAllEnvs();
        });
    });

    describe('getExplorerUrl', () => {
        it('should return explorer URL for testnet', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '102031');
            const url = getExplorerUrl('0x123abc');

            expect(url).toBe('https://creditcoin-testnet.blockscout.com/tx/0x123abc');
            vi.unstubAllEnvs();
        });

        it('should return explorer URL for mainnet', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '102030');
            const url = getExplorerUrl('0x123abc');

            expect(url).toBe('https://creditcoin.blockscout.com/tx/0x123abc');
            vi.unstubAllEnvs();
        });

        it('should return undefined for local network', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '31337');
            const url = getExplorerUrl('0x123abc');

            expect(url).toBeUndefined();
            vi.unstubAllEnvs();
        });
    });

    describe('getAddressExplorerUrl', () => {
        it('should return address explorer URL for testnet', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '102031');
            const url = getAddressExplorerUrl('0xabc123');

            expect(url).toBe('https://creditcoin-testnet.blockscout.com/address/0xabc123');
            vi.unstubAllEnvs();
        });

        it('should return address explorer URL for mainnet', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '102030');
            const url = getAddressExplorerUrl('0xabc123');

            expect(url).toBe('https://creditcoin.blockscout.com/address/0xabc123');
            vi.unstubAllEnvs();
        });

        it('should return undefined for local network', () => {
            vi.stubEnv('NEXT_PUBLIC_CHAIN_ID', '31337');
            const url = getAddressExplorerUrl('0xabc123');

            expect(url).toBeUndefined();
            vi.unstubAllEnvs();
        });
    });
});

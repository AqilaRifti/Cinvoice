# Contract Configuration Guide

This document explains how contract addresses and ABIs are centralized and managed in the frontend application.

## Overview

All contract configuration is centralized in `src/lib/contracts.ts` for easy updates and maintenance. This includes:
- Contract addresses
- Contract ABIs
- Network configurations
- Validation utilities

## Environment Variables

Contract addresses are loaded from environment variables. Create a `.env` file in the frontend directory with the following variables:

```env
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=102031
NEXT_PUBLIC_CREDITCOIN_RPC=https://rpc.cc3-testnet.creditcoin.network

# Contract Addresses
NEXT_PUBLIC_CREDIT_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0x...
NEXT_PUBLIC_INVOICE_NFT_ADDRESS=0x...
NEXT_PUBLIC_FINANCING_POOL_ADDRESS=0x...
```

## Supported Networks

The application supports multiple networks:

### Creditcoin Testnet (Default)
- Chain ID: 102031
- RPC: https://rpc.cc3-testnet.creditcoin.network
- Explorer: https://creditcoin-testnet.blockscout.com

### Creditcoin Mainnet
- Chain ID: 102030
- RPC: https://rpc.mainnet.creditcoin.network
- Explorer: https://creditcoin.blockscout.com

### Local Development
- Chain ID: 31337
- RPC: http://localhost:8545

## Address Validation

Contract addresses are validated on application startup using viem's `isAddress` function. The validation:

1. Checks that all required addresses are present
2. Validates that each address is a valid Ethereum address format
3. Throws an error if any validation fails, preventing the app from loading with invalid configuration

### Validation Process

The `ContractValidator` component runs validation when the app starts:

```typescript
import { validateContractAddresses } from '@/lib/contracts';

// This runs automatically on app startup
validateContractAddresses();
```

If validation fails, users see a clear error message explaining which addresses are invalid or missing.

## Using Contract Addresses

Import contract addresses from the centralized config:

```typescript
import { CONTRACT_ADDRESSES } from '@/lib/contracts';

// Use in wagmi hooks
const { data } = useReadContract({
  address: CONTRACT_ADDRESSES.InvoiceNFT,
  abi: INVOICE_NFT_ABI,
  functionName: 'nextTokenId',
});
```

## Using Contract ABIs

All contract ABIs are exported from the same file:

```typescript
import { 
  INVOICE_NFT_ABI,
  FINANCING_POOL_ABI,
  CREDIT_ORACLE_ABI,
  GOVERNANCE_ABI 
} from '@/lib/contracts';
```

## Network Utilities

Helper functions for working with networks:

```typescript
import { 
  getCurrentNetwork,
  getExplorerUrl,
  getAddressExplorerUrl 
} from '@/lib/contracts';

// Get current network info
const network = getCurrentNetwork();
console.log(network.name, network.chainId);

// Get block explorer URLs
const txUrl = getExplorerUrl('0x123...');
const addressUrl = getAddressExplorerUrl('0xabc...');
```

## Updating Contract Addresses

To update contract addresses after a new deployment:

1. Update the environment variables in `.env`
2. Restart the development server
3. The new addresses will be validated on startup

For production deployments, update the environment variables in your hosting platform (Vercel, Netlify, etc.).

## Type Safety

All contract addresses are typed as `0x${string}` for type safety with viem:

```typescript
export interface ContractAddresses {
  CreditScoreOracle: `0x${string}`;
  PlatformGovernance: `0x${string}`;
  InvoiceNFT: `0x${string}`;
  FinancingPool: `0x${string}`;
}
```

This ensures that only valid address formats can be used throughout the application.

## Error Handling

If contract addresses are invalid or missing:

1. The app will not load
2. A clear error message is displayed to the user
3. The error is logged to the console with details
4. The error message includes which addresses are problematic

This prevents the app from running with invalid configuration and makes debugging easier.

## Best Practices

1. **Never hardcode addresses** - Always use `CONTRACT_ADDRESSES` from the config
2. **Validate early** - The startup validation catches issues before users interact with the app
3. **Use environment variables** - Keep addresses configurable for different environments
4. **Document changes** - Update this file when adding new contracts or networks
5. **Type safety** - Use the exported types for contract addresses and ABIs

## Adding New Contracts

To add a new contract:

1. Add the environment variable to `.env`:
   ```env
   NEXT_PUBLIC_NEW_CONTRACT_ADDRESS=0x...
   ```

2. Add the address to `CONTRACT_ADDRESSES` in `src/lib/contracts.ts`:
   ```typescript
   export const CONTRACT_ADDRESSES = {
     // ... existing addresses
     NewContract: (process.env.NEXT_PUBLIC_NEW_CONTRACT_ADDRESS || '0x') as `0x${string}`,
   } as const;
   ```

3. Add the ABI:
   ```typescript
   export const NEW_CONTRACT_ABI = [
     // ... ABI definition
   ] as const;
   ```

4. Update the `ContractAddresses` interface:
   ```typescript
   export interface ContractAddresses {
     // ... existing contracts
     NewContract: `0x${string}`;
   }
   ```

The validation will automatically include the new contract on the next startup.

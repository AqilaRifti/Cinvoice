# Creditcoin Invoice Financing Platform - Smart Contracts

## Overview

This directory contains the smart contracts for the Creditcoin Invoice Financing Platform, a decentralized marketplace enabling SMBs to tokenize invoices as NFTs and sell them to investors for instant liquidity.

## Architecture

### Smart Contracts

1. **CreditScoreOracle.sol** - On-chain credit scoring system (300-850 range)
2. **InvoiceNFT.sol** - ERC-721 NFT contract for tokenized invoices
3. **FinancingPool.sol** - Investment pool managing purchases and repayments
4. **PlatformGovernance.sol** - Multi-sig governance (2-of-3 admins)

### Contract Interactions

```
SMB → InvoiceNFT.mintInvoice() → CreditScoreOracle.getCreditScore()
Investor → FinancingPool.purchaseInvoice() → InvoiceNFT.transferFrom()
SMB → FinancingPool.repayInvoice() → CreditScoreOracle.updateCreditScore()
Admin → PlatformGovernance.proposeAction() → Multi-sig approval
```

## Setup

### Prerequisites

- Node.js v18+
- pnpm v8+
- Creditcoin testnet account with CTC tokens

### Installation

```bash
pnpm install
```

### Configuration

1. Copy `.env.example` to `.env`
2. Add your private key and admin addresses
3. Configure Creditcoin testnet RPC URL

```env
CREDITCOIN_RPC_URL=https://rpc.cc3-testnet.creditcoin.network
PRIVATE_KEY=your_private_key_here
ADMIN1_ADDRESS=0x...
ADMIN2_ADDRESS=0x...
ADMIN3_ADDRESS=0x...
```

## Development

### Compile Contracts

```bash
pnpm compile
```

### Run Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage
```

### Deploy to Creditcoin Testnet

```bash
pnpm deploy:testnet
```

### Verify Contracts

```bash
pnpm verify:testnet
```

## Testing

The project includes comprehensive testing:

- **Unit Tests**: Test individual contract functions
- **Integration Tests**: Test complete user flows
- **Property-Based Tests**: Test invariants with fast-check
- **Coverage Target**: >80% code coverage

## Deployment

Contracts are deployed in the following order:

1. CreditScoreOracle
2. PlatformGovernance (with 3 admin addresses)
3. InvoiceNFT (references PlatformGovernance)
4. FinancingPool (references all contracts)

Deployed addresses are saved to `deployments.json`.

## Security

- ReentrancyGuard on all payable functions
- Access control with role-based permissions
- Multi-sig governance for critical operations
- Comprehensive input validation
- Audited OpenZeppelin contracts

## License

MIT

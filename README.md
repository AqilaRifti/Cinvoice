# Creditcoin Invoice Financing Platform

A decentralized marketplace enabling SMBs to tokenize invoices as NFTs and sell them to investors for instant liquidity, built on the Creditcoin blockchain.

## Overview

The Creditcoin Invoice Financing Platform bridges traditional invoice financing with blockchain technology, providing:

- **For SMBs**: Convert unpaid invoices into instant liquidity by tokenizing them as NFTs
- **For Investors**: Access a marketplace of invoice-backed investment opportunities with transparent credit scoring
- **For the Ecosystem**: Decentralized, transparent, and efficient invoice financing with on-chain credit scoring

## Architecture

This is a full-stack decentralized application consisting of:

- **Smart Contracts** (`/contracts`): Solidity contracts deployed on Creditcoin testnet
- **Frontend** (`/frontend`): Next.js 16 web application with Web3 integration

### Smart Contracts

1. **CreditScoreOracle.sol** - On-chain credit scoring system (300-850 range)
2. **InvoiceNFT.sol** - ERC-721 NFT contract for tokenized invoices
3. **FinancingPool.sol** - Investment pool managing purchases and repayments
4. **PlatformGovernance.sol** - Multi-sig governance (2-of-3 admins)

### Frontend Features

- 🔐 Wallet-based authentication with RainbowKit
- 🌐 Creditcoin Testnet integration via wagmi
- 📊 Three role-based dashboards (SMB, Investor, Admin)
- 🎨 Modern UI with shadcn/ui components
- 🌙 Dark/Light theme support
- 📱 Fully responsive design

## Quick Start

### Prerequisites

- Node.js v18+
- pnpm v8+
- Creditcoin testnet account with CTC tokens

### 1. Clone the Repository

```bash
git clone <repository-url>
cd creditcoin-invoice-financing
```

### 2. Setup Smart Contracts

```bash
cd contracts
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your private key and admin addresses

# Compile contracts
pnpm compile

# Run tests
pnpm test

# Deploy to Creditcoin testnet
pnpm deploy:testnet
```

### 3. Setup Frontend

```bash
cd ../frontend
pnpm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with contract addresses and WalletConnect Project ID

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
.
├── contracts/              # Smart contracts
│   ├── contracts/         # Solidity source files
│   ├── scripts/           # Deployment and configuration scripts
│   ├── test/              # Contract tests
│   └── hardhat.config.js  # Hardhat configuration
│
└── frontend/              # Next.js frontend
    ├── src/
    │   ├── app/           # Next.js 16 app directory
    │   ├── components/    # React components
    │   ├── hooks/         # Custom React hooks
    │   └── lib/           # Utilities and configurations
    └── public/            # Static assets
```

## User Flows

### SMB Flow
1. Connect wallet to platform
2. View credit score from CreditScoreOracle
3. Upload invoice details and mint as NFT
4. List invoice on marketplace
5. Receive instant liquidity when investor purchases
6. Repay invoice when customer pays

### Investor Flow
1. Connect wallet to platform
2. Browse invoice marketplace
3. Filter by credit score, amount, and terms
4. Purchase invoice NFT
5. Receive repayment with interest when SMB repays

### Admin Flow
1. Connect with admin wallet
2. View platform metrics and analytics
3. Create and vote on governance proposals
4. Manage platform parameters (fees, limits)
5. Control platform status (pause/unpause)

## Development

### Smart Contracts

```bash
cd contracts

# Compile
pnpm compile

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Deploy to testnet
pnpm deploy:testnet

# Verify contracts
pnpm verify:testnet
```

### Frontend

```bash
cd frontend

# Development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## Testing

The project includes comprehensive testing:

- **Unit Tests**: Test individual contract functions and components
- **Integration Tests**: Test complete user flows
- **Property-Based Tests**: Test invariants with fast-check
- **Coverage Target**: >80% code coverage

## Deployment

### Smart Contracts

Contracts are deployed to Creditcoin testnet in the following order:

1. CreditScoreOracle
2. PlatformGovernance (with 3 admin addresses)
3. InvoiceNFT (references PlatformGovernance)
4. FinancingPool (references all contracts)

Deployed addresses are saved to `contracts/deployments/creditcoinTestnet.json`.

### Frontend

Deploy to Vercel (recommended):

1. Push to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy

## Security

- ReentrancyGuard on all payable functions
- Access control with role-based permissions
- Multi-sig governance for critical operations
- Comprehensive input validation
- Audited OpenZeppelin contracts

## Tech Stack

### Smart Contracts
- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- Ethers.js v6
- fast-check (property-based testing)

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- wagmi v3 & viem
- RainbowKit
- shadcn/ui & Tailwind CSS
- TanStack Query

## Documentation

- [Contracts README](./contracts/README.md)
- [Frontend README](./frontend/README.md)
- [Creditcoin Documentation](https://docs.creditcoin.org)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT

## Support

For questions and support:
- Creditcoin Docs: https://docs.creditcoin.org
- WalletConnect Docs: https://docs.walletconnect.com
- wagmi Docs: https://wagmi.sh

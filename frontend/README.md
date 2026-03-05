# Creditcoin Invoice Financing - Frontend

Next.js 16 frontend for the Creditcoin Invoice Financing Platform.

## Features

- 🔐 Wallet-based authentication with RainbowKit
- 🌐 Creditcoin Testnet integration via wagmi
- 📊 Three role-based dashboards (SMB, Investor, Admin)
- 🎨 Modern UI with shadcn/ui components
- 🌙 Dark/Light theme support
- 📱 Fully responsive design

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Contract addresses from deployment
NEXT_PUBLIC_CREDIT_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0x...
NEXT_PUBLIC_INVOICE_NFT_ADDRESS=0x...
NEXT_PUBLIC_FINANCING_POOL_ADDRESS=0x...

# WalletConnect Project ID
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Pinata for IPFS (optional for now)
NEXT_PUBLIC_PINATA_JWT=your_jwt
```

### 3. Get Contract Addresses

After deploying contracts, copy addresses from:
```bash
cat ../contracts/deployments/creditcoinTestnet.json
```

### 4. Get WalletConnect Project ID

1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy the Project ID
4. Add to `.env.local`

### 5. Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/                    # Next.js 16 app directory
│   ├── page.tsx           # Landing page
│   └── dashboard/
│       ├── smb/           # SMB dashboard
│       ├── investor/      # Investor dashboard
│       └── admin/         # Admin dashboard
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── providers/         # Web3Provider
│   └── wallet-connect-button.tsx
├── hooks/
│   └── use-user-role.ts   # Role determination
└── lib/
    ├── wagmi.ts           # Wagmi config
    └── contracts.ts       # Contract ABIs & addresses
```

## Dashboards

### SMB Dashboard (`/dashboard/smb`)
- View credit score
- Upload and mint invoices
- Track invoice status
- Repay funded invoices

### Investor Dashboard (`/dashboard/investor`)
- Browse invoice marketplace
- Filter by credit score, terms
- Purchase invoices
- Track portfolio and returns

### Admin Dashboard (`/dashboard/admin`)
- View platform metrics
- Manage governance proposals
- Control platform status
- Adjust fees and settings

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Web3**: wagmi v3, viem, RainbowKit
- **UI**: shadcn/ui, Tailwind CSS
- **State**: TanStack Query
- **Theme**: next-themes

## Development

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

### Build

```bash
pnpm build
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- Contract addresses
- WalletConnect Project ID
- Pinata credentials (when IPFS is integrated)

## Next Steps

1. ✅ Basic wallet integration
2. ✅ Dashboard layouts
3. 🔄 Implement credit score display
4. 🔄 Add invoice minting functionality
5. 🔄 Build marketplace with filtering
6. 🔄 Integrate IPFS for document storage
7. 🔄 Add real-time updates with events

## Support

- Creditcoin Docs: https://docs.creditcoin.org
- WalletConnect Docs: https://docs.walletconnect.com
- wagmi Docs: https://wagmi.sh

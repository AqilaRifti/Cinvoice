# SMB Dashboard

## Overview

The SMB (Small and Medium Business) Dashboard is a comprehensive interface for businesses to manage their invoice financing lifecycle on the Creditcoin platform.

## Features

### 1. Role-Based Access Control
- **Access Requirements**: Only users with SMB role or Admin role can access this dashboard
- **Automatic Detection**: Users are automatically identified as SMBs when they mint their first invoice
- **Access Denied Screen**: Non-SMB users see a clear message explaining access requirements

### 2. Dashboard Components

#### Credit Score Card (`CreditScoreCard`)
- Displays user's on-chain credit score (300-850 range)
- Circular progress indicator with color coding:
  - Green (≥700): Excellent
  - Yellow (550-699): Good/Fair
  - Red (<550): Poor
- Shows current discount rate applied to invoices
- Displays repayment success rate
- Mini sparkline chart showing 7-day score trend
- Profile statistics (total invoices, successful repayments, defaults)

#### Invoice Statistics (`InvoiceStats`)
- Four key metrics cards:
  1. **Total Invoices**: Count of all minted invoices
  2. **Pending Invoices**: Invoices awaiting funding
  3. **Funded Invoices**: Invoices that have been purchased by investors
  4. **Total Raised**: Sum of all funding received
- Each card shows percentage change from previous period
- Animated counters for visual appeal
- Hover effects for better UX

#### Invoices Table (`InvoicesTable`)
- Comprehensive table with sortable columns:
  - Token ID
  - Face Value
  - Status (with color-coded badges)
  - Repayment Date (with relative time)
  - Credit Score at Minting
  - Actions
- Features:
  - Global search across all invoice data
  - Filter by invoice state (Pending, Funded, Repaid, Defaulted)
  - Active filter badges with quick removal
  - Pagination for large datasets
  - Repay button for funded invoices
  - View details and IPFS metadata links
- Empty states for no invoices or no search results

#### Mint Invoice Dialog (`MintInvoiceDialog`)
- Multi-step form for creating new invoice NFTs:
  1. **Upload PDF**: Drag-and-drop invoice document
  2. **Enter Details**: Invoice number, face value, repayment date, description
  3. **Review & Mint**: Confirm details and submit transaction
- Form validation with Zod schema
- Transaction status feedback
- Success animation with confetti effect

#### Repay Invoice Dialog (`RepayInvoiceDialog`)
- Simple form for repaying funded invoices
- Displays calculated repayment amount
- Transaction cost estimation
- Confirmation step before submission

### 3. Tab Navigation

The dashboard uses a tabbed interface for better organization:

1. **Overview Tab** (Default)
   - Credit Score Card
   - Invoice Statistics

2. **Invoices Tab**
   - Complete invoices table with all functionality

3. **Mint New Tab**
   - Mint invoice dialog for creating new invoices

### 4. Complete Invoice Lifecycle

The dashboard supports the full invoice lifecycle:

1. **Mint**: Create a new invoice NFT
   - Upload invoice PDF to IPFS
   - Enter invoice details
   - Submit transaction to mint NFT
   - Invoice appears in table with "Pending" status

2. **List**: View all invoices
   - See all minted invoices in the table
   - Filter and search invoices
   - View invoice details and metadata

3. **Fund**: (Handled by investors)
   - Invoice status changes to "Funded" when purchased
   - Repay button becomes available

4. **Repay**: Pay back the invoice
   - Click "Repay" button on funded invoice
   - Confirm repayment amount
   - Submit transaction
   - Invoice status changes to "Repaid"

## Technical Implementation

### State Management
- Uses React hooks for local state
- Wagmi hooks for blockchain interactions
- TanStack Query for data caching and refetching

### Data Flow
1. `useAccount` - Check wallet connection
2. `useUserRole` - Verify user has SMB or Admin role
3. `useUserInvoices` - Fetch user's invoices from blockchain
4. `useCreditScore` - Fetch user's credit score and profile

### Access Control Logic
```typescript
// Wallet not connected -> Show connect prompt
if (!isConnected) {
  return <ConnectWalletPrompt />;
}

// Connected but not SMB/Admin -> Show access denied
if (isConnected && !isSMB && role !== 'admin') {
  return <AccessDenied />;
}

// SMB or Admin -> Show dashboard
return <Dashboard />;
```

### Component Integration
All components are properly wired together:
- Credit score data flows to `CreditScoreCard`
- Invoice data flows to `InvoiceStats` and `InvoicesTable`
- Repay action opens `RepayInvoiceDialog` with selected invoice
- All components use shared hooks for consistent data

## Testing

Comprehensive test suite covers:
- Wallet connection flow
- Role-based access control
- Dashboard component rendering
- Complete invoice lifecycle
- Tab navigation
- Loading states
- Error handling

Test file: `__tests__/page.test.tsx`

## Requirements Validation

This implementation satisfies all requirements from the spec:

✅ **Requirement 3.1**: Credit score card with circular progress indicator
✅ **Requirement 3.2**: Credit score trend with sparkline chart
✅ **Requirement 3.3**: Invoice statistics cards
✅ **Requirement 3.4**: Create invoice button with multi-step dialog
✅ **Requirement 3.5**: Multi-step invoice creation (Upload, Details, Review)
✅ **Requirement 3.6**: Invoices table with sortable columns
✅ **Requirement 3.7**: Invoice state badges with color coding
✅ **Requirement 3.8**: Repay button for funded invoices
✅ **Requirement 3.9**: Filtering options for invoice state and date
✅ **Requirement 3.10**: Empty state with "Create Your First Invoice" CTA

## Future Enhancements

Potential improvements for future iterations:
- Real-time notifications for invoice state changes
- Bulk invoice operations
- Export invoice data to CSV
- Advanced analytics and reporting
- Invoice templates for faster creation
- Integration with accounting software

/**
 * SMB Dashboard Page Tests
 * 
 * Tests the complete invoice lifecycle:
 * 1. Wallet connection
 * 2. Role-based access control
 * 3. Credit score display
 * 4. Invoice statistics
 * 5. Invoice minting
 * 6. Invoice listing
 * 7. Invoice repayment
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SMBDashboard from '../page';
import { useAccount } from 'wagmi';
import { useUserRole } from '@/hooks/use-user-role';
import { useUserInvoices } from '@/hooks/use-invoices';
import { InvoiceState } from '@/lib/contracts';

// Mock dependencies
vi.mock('wagmi', () => ({
    useAccount: vi.fn(),
}));

vi.mock('@/hooks/use-user-role', () => ({
    useUserRole: vi.fn(),
}));

vi.mock('@/hooks/use-invoices', () => ({
    useUserInvoices: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
}));

// Mock child components
vi.mock('@/components/smb/credit-score-card', () => ({
    CreditScoreCard: () => <div data-testid="credit-score-card">Credit Score Card</div>,
}));

vi.mock('@/components/smb/invoice-stats', () => ({
    InvoiceStats: () => <div data-testid="invoice-stats">Invoice Stats</div>,
}));

vi.mock('@/components/smb/invoices-table', () => ({
    InvoicesTable: ({ invoices, onRepay }: any) => (
        <div data-testid="invoices-table">
            <div>Invoices: {invoices.length}</div>
            {invoices.map((inv: any) => (
                <button
                    key={inv.tokenId}
                    data-testid={`repay-${inv.tokenId}`}
                    onClick={() => onRepay(inv.tokenId, inv.faceValue)}
                >
                    Repay #{inv.tokenId}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('@/components/smb/mint-invoice-dialog', () => ({
    MintInvoiceDialog: () => <div data-testid="mint-invoice-dialog">Mint Invoice Dialog</div>,
}));

vi.mock('@/components/smb/repay-invoice-dialog', () => ({
    RepayInvoiceDialog: ({ open, tokenId }: any) =>
        open ? <div data-testid="repay-dialog">Repay Dialog for #{tokenId}</div> : null,
}));

vi.mock('@/components/wallet-connect-button', () => ({
    WalletConnectButton: () => <button data-testid="wallet-connect">Connect Wallet</button>,
}));

describe('SMB Dashboard Page', () => {
    const mockInvoices = [
        {
            tokenId: 1,
            faceValue: 1000n,
            repaymentDate: Math.floor(Date.now() / 1000) + 86400 * 30,
            smb: '0x123' as `0x${string}`,
            state: InvoiceState.Pending,
            metadataURI: 'ipfs://test1',
            creditScoreAtMinting: 750,
        },
        {
            tokenId: 2,
            faceValue: 2000n,
            repaymentDate: Math.floor(Date.now() / 1000) + 86400 * 60,
            smb: '0x123' as `0x${string}`,
            state: InvoiceState.Funded,
            metadataURI: 'ipfs://test2',
            creditScoreAtMinting: 750,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Wallet Connection', () => {
        it('should show wallet connect prompt when not connected', () => {
            (useAccount as any).mockReturnValue({ isConnected: false });
            (useUserRole as any).mockReturnValue({ role: 'guest', isSMB: false });
            (useUserInvoices as any).mockReturnValue({ invoices: [], isLoading: false });

            render(<SMBDashboard />);

            expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
            expect(screen.getByTestId('wallet-connect')).toBeInTheDocument();
        });

        it('should show dashboard when wallet is connected and user is SMB', () => {
            (useAccount as any).mockReturnValue({ isConnected: true });
            (useUserRole as any).mockReturnValue({ role: 'smb', isSMB: true });
            (useUserInvoices as any).mockReturnValue({ invoices: mockInvoices, isLoading: false });

            render(<SMBDashboard />);

            expect(screen.getByText('SMB Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Manage your invoices and track your credit score')).toBeInTheDocument();
        });
    });

    describe('Role-Based Access Control', () => {
        it('should deny access to non-SMB users', () => {
            (useAccount as any).mockReturnValue({ isConnected: true });
            (useUserRole as any).mockReturnValue({ role: 'investor', isSMB: false });
            (useUserInvoices as any).mockReturnValue({ invoices: [], isLoading: false });

            render(<SMBDashboard />);

            expect(screen.getByText('Access Denied')).toBeInTheDocument();
            expect(screen.getByText(/This dashboard is only accessible to SMBs/)).toBeInTheDocument();
        });

        it('should allow access to admin users', () => {
            (useAccount as any).mockReturnValue({ isConnected: true });
            (useUserRole as any).mockReturnValue({ role: 'admin', isSMB: false });
            (useUserInvoices as any).mockReturnValue({ invoices: mockInvoices, isLoading: false });

            render(<SMBDashboard />);

            expect(screen.getByText('SMB Dashboard')).toBeInTheDocument();
            expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
        });

        it('should allow access to SMB users', () => {
            (useAccount as any).mockReturnValue({ isConnected: true });
            (useUserRole as any).mockReturnValue({ role: 'smb', isSMB: true });
            (useUserInvoices as any).mockReturnValue({ invoices: mockInvoices, isLoading: false });

            render(<SMBDashboard />);

            expect(screen.getByText('SMB Dashboard')).toBeInTheDocument();
            expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
        });
    });

    describe('Dashboard Components', () => {
        beforeEach(() => {
            (useAccount as any).mockReturnValue({ isConnected: true });
            (useUserRole as any).mockReturnValue({ role: 'smb', isSMB: true });
            (useUserInvoices as any).mockReturnValue({ invoices: mockInvoices, isLoading: false });
        });

        it('should render all dashboard components in overview tab', () => {
            render(<SMBDashboard />);

            expect(screen.getByTestId('credit-score-card')).toBeInTheDocument();
            expect(screen.getByTestId('invoice-stats')).toBeInTheDocument();
        });

        it('should render invoices table in invoices tab', async () => {
            const user = userEvent.setup();
            render(<SMBDashboard />);

            const invoicesTab = screen.getByRole('tab', { name: /invoices/i });
            await user.click(invoicesTab);

            await waitFor(() => {
                expect(screen.getByTestId('invoices-table')).toBeInTheDocument();
                expect(screen.getByText('Invoices: 2')).toBeInTheDocument();
            });
        });

        it('should render mint dialog in mint tab', async () => {
            const user = userEvent.setup();
            render(<SMBDashboard />);

            const mintTab = screen.getByRole('tab', { name: /mint new/i });
            await user.click(mintTab);

            await waitFor(() => {
                expect(screen.getByTestId('mint-invoice-dialog')).toBeInTheDocument();
            });
        });
    });

    describe('Complete Invoice Lifecycle', () => {
        beforeEach(() => {
            (useAccount as any).mockReturnValue({ isConnected: true });
            (useUserRole as any).mockReturnValue({ role: 'smb', isSMB: true });
        });

        it('should handle complete invoice lifecycle: mint -> list -> repay', async () => {
            const user = userEvent.setup();

            // Start with no invoices
            (useUserInvoices as any).mockReturnValue({ invoices: [], isLoading: false });
            const { rerender } = render(<SMBDashboard />);

            // Step 1: Navigate to mint tab
            const mintTab = screen.getByRole('tab', { name: /mint new/i });
            await user.click(mintTab);
            expect(screen.getByTestId('mint-invoice-dialog')).toBeInTheDocument();

            // Step 2: Simulate invoice minted (update mock data)
            (useUserInvoices as any).mockReturnValue({
                invoices: [mockInvoices[0]],
                isLoading: false
            });
            rerender(<SMBDashboard />);

            // Step 3: Navigate to invoices tab to see the minted invoice
            const invoicesTab = screen.getByRole('tab', { name: /invoices/i });
            await user.click(invoicesTab);

            await waitFor(() => {
                expect(screen.getByText('Invoices: 1')).toBeInTheDocument();
            });

            // Step 4: Simulate invoice getting funded
            (useUserInvoices as any).mockReturnValue({
                invoices: [mockInvoices[1]], // Funded invoice
                isLoading: false
            });
            rerender(<SMBDashboard />);

            // Step 5: Click repay button
            const repayButton = screen.getByTestId('repay-2');
            await user.click(repayButton);

            // Step 6: Verify repay dialog opens
            await waitFor(() => {
                expect(screen.getByTestId('repay-dialog')).toBeInTheDocument();
                expect(screen.getByText('Repay Dialog for #2')).toBeInTheDocument();
            });
        });

        it('should display invoices with different states correctly', () => {
            (useUserInvoices as any).mockReturnValue({
                invoices: mockInvoices,
                isLoading: false
            });

            render(<SMBDashboard />);

            // Both invoices should be listed
            expect(screen.getByText('Invoices: 2')).toBeInTheDocument();
        });

        it('should handle repayment action for funded invoices', async () => {
            const user = userEvent.setup();
            (useUserInvoices as any).mockReturnValue({
                invoices: [mockInvoices[1]], // Funded invoice
                isLoading: false
            });

            render(<SMBDashboard />);

            // Navigate to invoices tab
            const invoicesTab = screen.getByRole('tab', { name: /invoices/i });
            await user.click(invoicesTab);

            // Click repay button
            const repayButton = await screen.findByTestId('repay-2');
            await user.click(repayButton);

            // Verify repay dialog opens with correct invoice
            await waitFor(() => {
                expect(screen.getByTestId('repay-dialog')).toBeInTheDocument();
            });
        });
    });

    describe('Loading States', () => {
        it('should handle loading state', () => {
            (useAccount as any).mockReturnValue({ isConnected: true });
            (useUserRole as any).mockReturnValue({ role: 'smb', isSMB: true });
            (useUserInvoices as any).mockReturnValue({ invoices: [], isLoading: true });

            render(<SMBDashboard />);

            // Dashboard should still render with loading state passed to components
            expect(screen.getByText('SMB Dashboard')).toBeInTheDocument();
        });
    });

    describe('Tab Navigation', () => {
        beforeEach(() => {
            (useAccount as any).mockReturnValue({ isConnected: true });
            (useUserRole as any).mockReturnValue({ role: 'smb', isSMB: true });
            (useUserInvoices as any).mockReturnValue({ invoices: mockInvoices, isLoading: false });
        });

        it('should switch between tabs correctly', async () => {
            const user = userEvent.setup();
            render(<SMBDashboard />);

            // Default tab should be overview
            expect(screen.getByTestId('credit-score-card')).toBeInTheDocument();

            // Switch to invoices tab
            const invoicesTab = screen.getByRole('tab', { name: /invoices/i });
            await user.click(invoicesTab);
            await waitFor(() => {
                expect(screen.getByTestId('invoices-table')).toBeInTheDocument();
            });

            // Switch to mint tab
            const mintTab = screen.getByRole('tab', { name: /mint new/i });
            await user.click(mintTab);
            await waitFor(() => {
                expect(screen.getByTestId('mint-invoice-dialog')).toBeInTheDocument();
            });

            // Switch back to overview
            const overviewTab = screen.getByRole('tab', { name: /overview/i });
            await user.click(overviewTab);
            await waitFor(() => {
                expect(screen.getByTestId('credit-score-card')).toBeInTheDocument();
            });
        });
    });
});

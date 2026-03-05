/**
 * Unit tests for TransactionDialog component
 * Tests component rendering, state transitions, and user interactions
 * 
 * Note: This test file requires React Testing Library to be installed.
 * Run: npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
 */

import { describe, it, expect } from '@jest/globals';

// Mock the wagmi module
jest.mock('@/lib/wagmi', () => ({
    getBlockExplorerUrl: (hash: string) => `https://explorer.testnet.creditcoin.org/tx/${hash}`,
}));

// Mock the errors module
jest.mock('@/lib/errors', () => ({
    parseContractError: (error: Error) => error.message,
}));

// Note: Actual test implementation requires @testing-library/react
// Uncomment the following when testing libraries are installed:
/*
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionDialog, TransactionStatus } from '../transaction-dialog';
*/

describe('TransactionDialog', () => {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        status: 'idle' as TransactionStatus,
    };

    it('should render with idle status', () => {
        render(<TransactionDialog {...defaultProps} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display pending state correctly', () => {
        render(<TransactionDialog {...defaultProps} status="pending" />);

        expect(screen.getByText('Transaction')).toBeInTheDocument();
        expect(screen.getByText('Please wait while we process your transaction')).toBeInTheDocument();
        expect(screen.getByText('Processing your transaction...')).toBeInTheDocument();
    });

    it('should display success state with transaction hash', () => {
        const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

        render(
            <TransactionDialog
                {...defaultProps}
                status="success"
                txHash={txHash}
            />
        );

        expect(screen.getByText('Your transaction has been confirmed')).toBeInTheDocument();
        expect(screen.getByText('Transaction completed successfully!')).toBeInTheDocument();
        expect(screen.getByText(/0x12345678/)).toBeInTheDocument();
        expect(screen.getByText('View on Explorer')).toBeInTheDocument();
    });

    it('should display error state with error message', () => {
        const error = new Error('Insufficient funds');

        render(
            <TransactionDialog
                {...defaultProps}
                status="error"
                error={error}
            />
        );

        expect(screen.getByText('There was an issue with your transaction')).toBeInTheDocument();
        expect(screen.getByText('Transaction failed')).toBeInTheDocument();
        expect(screen.getByText('Insufficient funds')).toBeInTheDocument();
    });

    it('should show retry button on error when onRetry is provided', () => {
        const onRetry = vi.fn();
        const error = new Error('Transaction failed');

        render(
            <TransactionDialog
                {...defaultProps}
                status="error"
                error={error}
                onRetry={onRetry}
            />
        );

        expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
        const user = userEvent.setup();
        const onRetry = vi.fn();
        const error = new Error('Transaction failed');

        render(
            <TransactionDialog
                {...defaultProps}
                status="error"
                error={error}
                onRetry={onRetry}
            />
        );

        const retryButton = screen.getByText('Retry');
        await user.click(retryButton);

        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenChange when close button is clicked', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();

        render(
            <TransactionDialog
                {...defaultProps}
                status="success"
                onOpenChange={onOpenChange}
            />
        );

        const closeButton = screen.getByText('Close');
        await user.click(closeButton);

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should use custom messages when provided', () => {
        render(
            <TransactionDialog
                {...defaultProps}
                status="pending"
                title="Mint Invoice"
                pendingMessage="Minting your invoice NFT..."
            />
        );

        expect(screen.getByText('Mint Invoice')).toBeInTheDocument();
        expect(screen.getByText('Minting your invoice NFT...')).toBeInTheDocument();
    });

    it('should display transaction hash link with correct URL', () => {
        const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

        render(
            <TransactionDialog
                {...defaultProps}
                status="success"
                txHash={txHash}
            />
        );

        const link = screen.getByText('View on Explorer').closest('a');
        expect(link).toHaveAttribute('href', `https://explorer.testnet.creditcoin.org/tx/${txHash}`);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should not show close button during pending state', () => {
        render(<TransactionDialog {...defaultProps} status="pending" />);

        expect(screen.queryByText('Close')).not.toBeInTheDocument();
    });

    it('should show both retry and close buttons on error with retry handler', () => {
        const onRetry = vi.fn();
        const error = new Error('Transaction failed');

        render(
            <TransactionDialog
                {...defaultProps}
                status="error"
                error={error}
                onRetry={onRetry}
            />
        );

        expect(screen.getByText('Retry')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should handle custom error message override', () => {
        const error = new Error('Original error');

        render(
            <TransactionDialog
                {...defaultProps}
                status="error"
                error={error}
                errorMessage="Custom error message"
            />
        );

        expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should display success message with custom text', () => {
        render(
            <TransactionDialog
                {...defaultProps}
                status="success"
                successMessage="Invoice minted successfully!"
            />
        );

        expect(screen.getByText('Invoice minted successfully!')).toBeInTheDocument();
    });

    it('should show warning message during pending state', () => {
        render(<TransactionDialog {...defaultProps} status="pending" />);

        expect(screen.getByText(/This may take a few moments/)).toBeInTheDocument();
        expect(screen.getByText(/don't close this window/)).toBeInTheDocument();
    });

    it('should display transaction receipt on success', () => {
        const receipt = {
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            blockNumber: 12345678n,
            gasUsed: 21000n,
            effectiveGasPrice: 50000000000n,
            status: 'success' as const,
        };

        render(
            <TransactionDialog
                {...defaultProps}
                status="success"
                txHash={receipt.transactionHash}
                receipt={receipt}
            />
        );

        // Should display receipt component
        expect(screen.getByText('Transaction Receipt')).toBeInTheDocument();
        expect(screen.getByText('12345678')).toBeInTheDocument();
        expect(screen.getByText('21000')).toBeInTheDocument();
    });

    it('should show transaction hash link during pending without receipt', () => {
        const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

        render(
            <TransactionDialog
                {...defaultProps}
                status="pending"
                txHash={txHash}
            />
        );

        // Should show simplified hash link during pending
        expect(screen.getByText(/0x12345678/)).toBeInTheDocument();
        expect(screen.getByText('View on Explorer')).toBeInTheDocument();
    });
});

describe('TransactionDialog - Status Transitions', () => {
    it('should handle transition from pending to success', async () => {
        const { rerender } = render(
            <TransactionDialog
                open={true}
                onOpenChange={vi.fn()}
                status="pending"
            />
        );

        expect(screen.getByText('Processing your transaction...')).toBeInTheDocument();

        rerender(
            <TransactionDialog
                open={true}
                onOpenChange={vi.fn()}
                status="success"
                txHash="0x123"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Transaction completed successfully!')).toBeInTheDocument();
        });
    });

    it('should handle transition from pending to error', async () => {
        const { rerender } = render(
            <TransactionDialog
                open={true}
                onOpenChange={vi.fn()}
                status="pending"
            />
        );

        expect(screen.getByText('Processing your transaction...')).toBeInTheDocument();

        const error = new Error('Transaction failed');
        rerender(
            <TransactionDialog
                open={true}
                onOpenChange={vi.fn()}
                status="error"
                error={error}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Transaction failed')).toBeInTheDocument();
        });
    });
});

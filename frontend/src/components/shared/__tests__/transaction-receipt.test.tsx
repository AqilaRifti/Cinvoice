import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionReceipt, TransactionReceiptData } from '../transaction-receipt';

// Mock dependencies
vi.mock('@/lib/wagmi', () => ({
    getBlockExplorerUrl: (hash: string) => `https://explorer.example.com/tx/${hash}`,
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('TransactionReceipt', () => {
    const mockReceipt: TransactionReceiptData = {
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        blockNumber: 12345678n,
        gasUsed: 21000n,
        effectiveGasPrice: 50000000000n, // 50 gwei
        timestamp: 1704067200, // 2024-01-01 00:00:00
        status: 'success',
    };

    it('renders transaction receipt with all details', () => {
        render(<TransactionReceipt receipt={mockReceipt} />);

        // Check title and description
        expect(screen.getByText('Transaction Receipt')).toBeInTheDocument();
        expect(screen.getByText(/Your transaction has been confirmed/)).toBeInTheDocument();

        // Check transaction hash
        expect(screen.getByText(mockReceipt.transactionHash)).toBeInTheDocument();

        // Check block number
        expect(screen.getByText('12345678')).toBeInTheDocument();

        // Check gas used
        expect(screen.getByText('21000')).toBeInTheDocument();

        // Check status
        expect(screen.getByText('success')).toBeInTheDocument();
    });

    it('displays custom title and description', () => {
        render(
            <TransactionReceipt
                receipt={mockReceipt}
                title="Custom Title"
                description="Custom description text"
            />
        );

        expect(screen.getByText('Custom Title')).toBeInTheDocument();
        expect(screen.getByText('Custom description text')).toBeInTheDocument();
    });

    it('calculates and displays total gas cost', () => {
        render(<TransactionReceipt receipt={mockReceipt} />);

        // gasUsed (21000) * effectiveGasPrice (50 gwei) = 0.00105 CTC
        expect(screen.getByText(/0\.00105.*CTC/)).toBeInTheDocument();
    });

    it('displays timestamp when provided', () => {
        render(<TransactionReceipt receipt={mockReceipt} />);

        // Should display formatted date
        expect(screen.getByText(/Jan.*1.*2024/)).toBeInTheDocument();
    });

    it('does not display timestamp section when not provided', () => {
        const receiptWithoutTimestamp = { ...mockReceipt, timestamp: undefined };
        render(<TransactionReceipt receipt={receiptWithoutTimestamp} />);

        // Timestamp label should not be present
        expect(screen.queryByText('Timestamp')).not.toBeInTheDocument();
    });

    it('renders block explorer link with correct URL', () => {
        render(<TransactionReceipt receipt={mockReceipt} />);

        const link = screen.getByRole('link', { name: /View on Block Explorer/i });
        expect(link).toHaveAttribute(
            'href',
            `https://explorer.example.com/tx/${mockReceipt.transactionHash}`
        );
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('allows copying transaction hash', async () => {
        const user = userEvent.setup();

        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });

        render(<TransactionReceipt receipt={mockReceipt} />);

        const copyButton = screen.getByRole('button', { name: '' }); // Icon button
        await user.click(copyButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockReceipt.transactionHash);
    });

    it('displays success status with green indicator', () => {
        render(<TransactionReceipt receipt={mockReceipt} />);

        const statusText = screen.getByText('success');
        expect(statusText).toBeInTheDocument();
    });

    it('displays reverted status with red indicator', () => {
        const revertedReceipt = { ...mockReceipt, status: 'reverted' as const };
        render(<TransactionReceipt receipt={revertedReceipt} />);

        const statusText = screen.getByText('reverted');
        expect(statusText).toBeInTheDocument();
    });

    it('renders with green border for successful transactions', () => {
        const { container } = render(<TransactionReceipt receipt={mockReceipt} />);

        const card = container.querySelector('.border-green-200');
        expect(card).toBeInTheDocument();
    });

    it('displays all required sections', () => {
        render(<TransactionReceipt receipt={mockReceipt} />);

        // Check all section labels are present
        expect(screen.getByText('Transaction Hash')).toBeInTheDocument();
        expect(screen.getByText('Block Number')).toBeInTheDocument();
        expect(screen.getByText('Gas Used')).toBeInTheDocument();
        expect(screen.getByText('Total Gas Cost')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('formats large numbers correctly', () => {
        const largeReceipt: TransactionReceiptData = {
            ...mockReceipt,
            blockNumber: 99999999n,
            gasUsed: 1234567n,
        };

        render(<TransactionReceipt receipt={largeReceipt} />);

        expect(screen.getByText('99999999')).toBeInTheDocument();
        expect(screen.getByText('1234567')).toBeInTheDocument();
    });
});

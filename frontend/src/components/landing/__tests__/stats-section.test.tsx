import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsSection } from '../stats-section';
import * as usePlatformStatsModule from '@/hooks/use-platform-stats';

// Mock the hooks
vi.mock('@/hooks/use-platform-stats');
vi.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: vi.fn(),
    }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
    useInView: () => true,
}));

describe('StatsSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders section header', () => {
        vi.mocked(usePlatformStatsModule.usePlatformStats).mockReturnValue({
            totalInvoices: 0,
            treasuryBalance: 0n,
            isLoading: false,
        });

        render(<StatsSection />);

        expect(screen.getByText('Platform Statistics')).toBeInTheDocument();
        expect(
            screen.getByText('Real-time metrics from the Creditcoin Invoice Financing Platform')
        ).toBeInTheDocument();
    });

    it('displays all stat labels', () => {
        vi.mocked(usePlatformStatsModule.usePlatformStats).mockReturnValue({
            totalInvoices: 0,
            treasuryBalance: 0n,
            isLoading: false,
        });

        render(<StatsSection />);

        expect(screen.getByText('Total Invoices')).toBeInTheDocument();
        expect(screen.getByText('Total Volume')).toBeInTheDocument();
        expect(screen.getByText('Active Investments')).toBeInTheDocument();
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });

    it('shows skeleton loaders when loading', () => {
        vi.mocked(usePlatformStatsModule.usePlatformStats).mockReturnValue({
            totalInvoices: 0,
            treasuryBalance: 0n,
            isLoading: true,
        });

        const { container } = render(<StatsSection />);

        // Check for skeleton elements (they have specific classes)
        const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('displays platform stats when loaded', () => {
        vi.mocked(usePlatformStatsModule.usePlatformStats).mockReturnValue({
            totalInvoices: 42,
            treasuryBalance: 1000000000000000000n, // 1 CTC in wei
            isLoading: false,
        });

        render(<StatsSection />);

        // The component should display the stats
        expect(screen.getByText('Total Invoices')).toBeInTheDocument();
        expect(screen.getByText('Total Volume')).toBeInTheDocument();
    });

    it('handles zero values correctly', () => {
        vi.mocked(usePlatformStatsModule.usePlatformStats).mockReturnValue({
            totalInvoices: 0,
            treasuryBalance: 0n,
            isLoading: false,
        });

        render(<StatsSection />);

        // Should render without errors
        expect(screen.getByText('Total Invoices')).toBeInTheDocument();
    });
});

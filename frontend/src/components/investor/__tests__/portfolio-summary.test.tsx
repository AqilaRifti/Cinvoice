import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PortfolioSummary } from '../portfolio-summary';
import { InvoiceState } from '@/lib/contracts';

// Mock the hooks
vi.mock('@/hooks/use-user-investments', () => ({
    useUserInvestments: vi.fn(),
}));

// Mock framer-motion to avoid animation timing issues in tests
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: {
            div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
            span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
        },
        useSpring: (value: number) => ({
            set: vi.fn(),
            on: vi.fn(() => vi.fn()),
            get: () => value,
        }),
    };
});

// Mock AnimatedCounter to avoid animation complexity in tests
vi.mock('@/components/shared/animated-counter', () => ({
    AnimatedCounter: ({ value }: { value: number }) => <span>{value}</span>,
    PercentageCounter: ({ value }: { value: number }) => <span>{value}%</span>,
}));

import { useUserInvestments } from '@/hooks/use-user-investments';

describe('PortfolioSummary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Loading State', () => {
        it('renders skeleton loaders when loading', () => {
            vi.mocked(useUserInvestments).mockReturnValue({
                investments: [],
                stats: null,
                isLoading: true,
                error: null,
                refetch: vi.fn(),
            });

            const { container } = render(<PortfolioSummary />);

            // Check for skeleton loaders (animated pulse elements)
            const skeletons = container.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBeGreaterThan(0);
        });
    });

    describe('Empty State', () => {
        it('renders zero values when no investments', () => {
            vi.mocked(useUserInvestments).mockReturnValue({
                investments: [],
                stats: {
                    totalInvested: 0n,
                    totalReturned: 0n,
                    activeInvestments: 0,
                    roi: 0,
                },
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            });

            render(<PortfolioSummary />);

            expect(screen.getByText('Total Invested')).toBeInTheDocument();
            expect(screen.getByText('Total Returned')).toBeInTheDocument();
            expect(screen.getByText('Active Investments')).toBeInTheDocument();
            expect(screen.getByText('Overall ROI')).toBeInTheDocument();
        });
    });

    describe('With Data', () => {
        it('renders portfolio statistics correctly', () => {
            vi.mocked(useUserInvestments).mockReturnValue({
                investments: [
                    {
                        tokenId: 1,
                        faceValue: 100000000000000000000n, // 100 CTC
                        purchasePrice: 95000000000000000000n, // 95 CTC
                        purchaseTimestamp: Date.now() / 1000,
                        repaymentDate: Date.now() / 1000 + 86400 * 30,
                        state: InvoiceState.Funded,
                        smb: '0x123' as `0x${string}`,
                    },
                ],
                stats: {
                    totalInvested: 95000000000000000000n, // 95 CTC
                    totalReturned: 0n,
                    activeInvestments: 1,
                    roi: 5.26, // ~5.26% ROI
                },
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            });

            render(<PortfolioSummary />);

            // Check that all metric titles are present
            expect(screen.getByText('Total Invested')).toBeInTheDocument();
            expect(screen.getByText('Total Returned')).toBeInTheDocument();
            expect(screen.getByText('Active Investments')).toBeInTheDocument();
            expect(screen.getByText('Overall ROI')).toBeInTheDocument();

            // Check that values are displayed (mocked AnimatedCounter shows raw values)
            expect(screen.getByText('1')).toBeInTheDocument(); // Active investments
            expect(screen.getByText('5.26%')).toBeInTheDocument(); // ROI
        });

        it('displays multiple active investments', () => {
            vi.mocked(useUserInvestments).mockReturnValue({
                investments: [],
                stats: {
                    totalInvested: 200000000000000000000n,
                    totalReturned: 50000000000000000000n,
                    activeInvestments: 3,
                    roi: 10.5,
                },
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            });

            render(<PortfolioSummary />);

            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('10.5%')).toBeInTheDocument();
        });

        it('displays negative ROI correctly', () => {
            vi.mocked(useUserInvestments).mockReturnValue({
                investments: [],
                stats: {
                    totalInvested: 100000000000000000000n,
                    totalReturned: 0n,
                    activeInvestments: 1,
                    roi: -5.0,
                },
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            });

            render(<PortfolioSummary />);

            expect(screen.getByText('-5%')).toBeInTheDocument();
        });
    });

    describe('Layout', () => {
        it('renders four metric cards', () => {
            vi.mocked(useUserInvestments).mockReturnValue({
                investments: [],
                stats: {
                    totalInvested: 0n,
                    totalReturned: 0n,
                    activeInvestments: 0,
                    roi: 0,
                },
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            });

            render(<PortfolioSummary />);

            // Check that all four cards are rendered
            expect(screen.getByText('Total Invested')).toBeInTheDocument();
            expect(screen.getByText('Total Returned')).toBeInTheDocument();
            expect(screen.getByText('Active Investments')).toBeInTheDocument();
            expect(screen.getByText('Overall ROI')).toBeInTheDocument();
        });

        it('applies responsive grid classes', () => {
            vi.mocked(useUserInvestments).mockReturnValue({
                investments: [],
                stats: {
                    totalInvested: 0n,
                    totalReturned: 0n,
                    activeInvestments: 0,
                    roi: 0,
                },
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            });

            const { container } = render(<PortfolioSummary />);

            // Check for responsive grid classes
            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).toHaveClass('grid-cols-2');
            expect(gridContainer).toHaveClass('md:grid-cols-4');
        });
    });

    describe('Icons', () => {
        it('renders appropriate icons for each metric', () => {
            vi.mocked(useUserInvestments).mockReturnValue({
                investments: [],
                stats: {
                    totalInvested: 0n,
                    totalReturned: 0n,
                    activeInvestments: 0,
                    roi: 0,
                },
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            });

            const { container } = render(<PortfolioSummary />);

            // Check that SVG icons are present (lucide-react renders as SVG)
            const svgs = container.querySelectorAll('svg');
            expect(svgs.length).toBeGreaterThanOrEqual(4); // At least 4 icons for the metrics
        });
    });
});

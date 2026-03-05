import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    AnimatedCounter,
    CurrencyCounter,
    PercentageCounter,
    CompactCounter,
    IntegerCounter,
} from '../animated-counter';

// Mock framer-motion to avoid animation timing issues in tests
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: {
            span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
        },
        useSpring: (value: number) => ({
            set: vi.fn(),
            on: vi.fn(() => vi.fn()),
            get: () => value,
        }),
    };
});

describe('AnimatedCounter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('renders with default format', () => {
            render(<AnimatedCounter value={1234} />);
            expect(screen.getByText('1,234')).toBeInTheDocument();
        });

        it('renders with custom className', () => {
            const { container } = render(
                <AnimatedCounter value={100} className="custom-class" />
            );
            expect(container.querySelector('.custom-class')).toBeInTheDocument();
        });

        it('renders with prefix and suffix', () => {
            render(<AnimatedCounter value={42} prefix="+" suffix=" items" />);
            expect(screen.getByText(/\+42 items/)).toBeInTheDocument();
        });
    });

    describe('Number Formatting', () => {
        it('formats as currency', () => {
            render(
                <AnimatedCounter
                    value={100.5}
                    format="currency"
                    currency="CTC"
                    decimals={2}
                />
            );
            expect(screen.getByText('100.50 CTC')).toBeInTheDocument();
        });

        it('formats as percentage', () => {
            render(<AnimatedCounter value={75.5} format="percentage" decimals={1} />);
            expect(screen.getByText('75.5%')).toBeInTheDocument();
        });

        it('formats as decimal', () => {
            render(<AnimatedCounter value={3.14159} format="decimal" decimals={2} />);
            expect(screen.getByText('3.14')).toBeInTheDocument();
        });

        it('formats as compact notation for thousands', () => {
            render(<AnimatedCounter value={1500} format="compact" decimals={1} />);
            expect(screen.getByText('1.5K')).toBeInTheDocument();
        });

        it('formats as compact notation for millions', () => {
            render(<AnimatedCounter value={2500000} format="compact" decimals={1} />);
            expect(screen.getByText('2.5M')).toBeInTheDocument();
        });

        it('formats as compact notation for billions', () => {
            render(
                <AnimatedCounter value={3500000000} format="compact" decimals={1} />
            );
            expect(screen.getByText('3.5B')).toBeInTheDocument();
        });

        it('formats small numbers in compact notation without suffix', () => {
            render(<AnimatedCounter value={500} format="compact" decimals={0} />);
            expect(screen.getByText('500')).toBeInTheDocument();
        });

        it('handles negative numbers in compact notation', () => {
            render(<AnimatedCounter value={-1500} format="compact" decimals={1} />);
            expect(screen.getByText('-1.5K')).toBeInTheDocument();
        });
    });

    describe('Specialized Counter Components', () => {
        it('CurrencyCounter renders with default CTC currency', () => {
            render(<CurrencyCounter value={100.5} />);
            expect(screen.getByText('100.50 CTC')).toBeInTheDocument();
        });

        it('CurrencyCounter accepts custom currency', () => {
            render(<CurrencyCounter value={50} currency="USD" />);
            expect(screen.getByText('50.00 USD')).toBeInTheDocument();
        });

        it('PercentageCounter renders with percentage format', () => {
            render(<PercentageCounter value={75.5} />);
            expect(screen.getByText('75.5%')).toBeInTheDocument();
        });

        it('CompactCounter renders with compact format', () => {
            render(<CompactCounter value={1500} />);
            expect(screen.getByText('1.5K')).toBeInTheDocument();
        });

        it('IntegerCounter renders without decimals', () => {
            render(<IntegerCounter value={1234.56} />);
            expect(screen.getByText('1,234')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('handles zero value', () => {
            render(<AnimatedCounter value={0} />);
            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('handles negative values', () => {
            render(<AnimatedCounter value={-100} />);
            expect(screen.getByText('-100')).toBeInTheDocument();
        });

        it('handles very large numbers', () => {
            render(<AnimatedCounter value={999999999} />);
            expect(screen.getByText('999,999,999')).toBeInTheDocument();
        });

        it('handles decimal precision correctly', () => {
            render(<AnimatedCounter value={1.999} format="decimal" decimals={2} />);
            expect(screen.getByText('2.00')).toBeInTheDocument();
        });

        it('handles zero decimals', () => {
            render(<AnimatedCounter value={123.456} format="decimal" decimals={0} />);
            expect(screen.getByText('123')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('renders as a span element', () => {
            const { container } = render(<AnimatedCounter value={100} />);
            expect(container.querySelector('span')).toBeInTheDocument();
        });

        it('displays the formatted value as text content', () => {
            render(<AnimatedCounter value={1234} />);
            const span = screen.getByText('1,234');
            expect(span.textContent).toBe('1,234');
        });
    });

    describe('Props Validation', () => {
        it('uses default duration when not specified', () => {
            render(<AnimatedCounter value={100} />);
            expect(screen.getByText('100')).toBeInTheDocument();
        });

        it('accepts custom duration', () => {
            render(<AnimatedCounter value={100} duration={2000} />);
            expect(screen.getByText('100')).toBeInTheDocument();
        });

        it('uses default format when not specified', () => {
            render(<AnimatedCounter value={1234} />);
            expect(screen.getByText('1,234')).toBeInTheDocument();
        });

        it('uses default currency when not specified', () => {
            render(<AnimatedCounter value={100} format="currency" decimals={2} />);
            expect(screen.getByText('100.00 CTC')).toBeInTheDocument();
        });

        it('uses default decimals when not specified', () => {
            render(<AnimatedCounter value={123.456} />);
            expect(screen.getByText('123')).toBeInTheDocument();
        });
    });

    describe('Multiple Formats', () => {
        it('renders multiple counters with different formats', () => {
            const { container } = render(
                <div>
                    <AnimatedCounter value={1234} />
                    <CurrencyCounter value={100.5} />
                    <PercentageCounter value={75} />
                </div>
            );

            expect(screen.getByText('1,234')).toBeInTheDocument();
            expect(screen.getByText('100.50 CTC')).toBeInTheDocument();
            expect(screen.getByText('75.0%')).toBeInTheDocument();
        });
    });
});

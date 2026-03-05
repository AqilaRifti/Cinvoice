import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EarningsChart } from '../earnings-chart';

describe('EarningsChart', () => {
    it('renders the chart title', () => {
        render(<EarningsChart />);
        expect(screen.getByText('Earnings Over Time')).toBeInTheDocument();
    });

    it('renders time range selector buttons', () => {
        render(<EarningsChart />);
        expect(screen.getByLabelText('7 days')).toBeInTheDocument();
        expect(screen.getByLabelText('30 days')).toBeInTheDocument();
        expect(screen.getByLabelText('90 days')).toBeInTheDocument();
        expect(screen.getByLabelText('All time')).toBeInTheDocument();
    });

    it('displays current earnings value', () => {
        render(<EarningsChart />);
        // Should display a value with "CTC" suffix
        const earningsText = screen.getByText(/CTC$/);
        expect(earningsText).toBeInTheDocument();
    });

    it('displays percentage change', () => {
        render(<EarningsChart />);
        // Should display a percentage change
        const percentageText = screen.getByText(/%$/);
        expect(percentageText).toBeInTheDocument();
    });

    it('renders the chart icon', () => {
        render(<EarningsChart />);
        const icon = screen.getByRole('img', { hidden: true });
        expect(icon).toBeInTheDocument();
    });
});

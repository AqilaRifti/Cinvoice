import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from '../page';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

// Mock the landing components
vi.mock('@/components/landing', () => ({
    HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
    FeaturesSection: () => <div data-testid="features-section">Features Section</div>,
    StatsSection: () => <div data-testid="stats-section">Stats Section</div>,
    HowItWorksSection: () => <div data-testid="how-it-works-section">How It Works Section</div>,
    Footer: () => <div data-testid="footer">Footer</div>,
}));

describe('LandingPage', () => {
    it('renders all main sections', () => {
        render(<LandingPage />);

        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
        expect(screen.getByTestId('features-section')).toBeInTheDocument();
        expect(screen.getByTestId('stats-section')).toBeInTheDocument();
        expect(screen.getByTestId('how-it-works-section')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders the technology stack section', () => {
        render(<LandingPage />);

        expect(screen.getByText('Built on Creditcoin')).toBeInTheDocument();
        expect(screen.getByText('On-Chain')).toBeInTheDocument();
        expect(screen.getByText('NFT-Based')).toBeInTheDocument();
        expect(screen.getByText('Multi-Sig')).toBeInTheDocument();
        expect(screen.getByText('IPFS')).toBeInTheDocument();
    });

    it('renders technology descriptions', () => {
        render(<LandingPage />);

        expect(screen.getByText('Credit Scoring')).toBeInTheDocument();
        expect(screen.getByText('Invoice Tokens')).toBeInTheDocument();
        expect(screen.getByText('Governance')).toBeInTheDocument();
        expect(screen.getByText('Document Storage')).toBeInTheDocument();
    });

    it('has proper structure with gradient background', () => {
        const { container } = render(<LandingPage />);

        const mainDiv = container.firstChild as HTMLElement;
        expect(mainDiv).toHaveClass('min-h-screen');
        expect(mainDiv).toHaveClass('bg-gradient-to-b');
    });
});

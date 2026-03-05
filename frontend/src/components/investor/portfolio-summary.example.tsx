/**
 * PortfolioSummary Component Example
 * 
 * This file demonstrates how to use the PortfolioSummary component
 * in an Investor dashboard.
 */

import { PortfolioSummary } from './portfolio-summary';

// ============================================================================
// Basic Usage
// ============================================================================

/**
 * Example 1: Basic usage in an Investor dashboard
 * 
 * The component automatically fetches and displays portfolio statistics
 * for the connected wallet address.
 */
export function InvestorDashboardExample() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Investor Dashboard</h1>
                <p className="text-muted-foreground">
                    Track your investments and portfolio performance
                </p>
            </div>

            {/* Portfolio Summary Cards */}
            <PortfolioSummary />

            {/* Other dashboard components would go here */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Earnings chart, portfolio table, etc. */}
            </div>
        </div>
    );
}

// ============================================================================
// With Additional Context
// ============================================================================

/**
 * Example 2: Portfolio summary with additional context
 * 
 * Shows how to combine the PortfolioSummary with other dashboard elements
 * for a complete investor view.
 */
export function CompleteInvestorDashboardExample() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Portfolio Overview</h1>
                    <p className="text-muted-foreground">
                        Monitor your investments and returns
                    </p>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    Browse Marketplace
                </button>
            </div>

            {/* Portfolio Summary - The main component */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
                <PortfolioSummary />
            </section>

            {/* Additional sections would follow */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Performance Chart</h2>
                {/* EarningsChart component would go here */}
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">Your Investments</h2>
                {/* PortfolioTable component would go here */}
            </section>
        </div>
    );
}

// ============================================================================
// Responsive Layout Example
// ============================================================================

/**
 * Example 3: Responsive dashboard layout
 * 
 * Demonstrates how the PortfolioSummary adapts to different screen sizes:
 * - Mobile: 2x2 grid
 * - Desktop: 4x1 grid
 */
export function ResponsiveDashboardExample() {
    return (
        <div className="min-h-screen bg-background">
            {/* Mobile-friendly container */}
            <div className="container mx-auto px-4 py-6 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Investment Portfolio
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Your investment performance at a glance
                    </p>
                </div>

                {/* 
                 * PortfolioSummary automatically adapts:
                 * - Mobile: 2 columns (grid-cols-2)
                 * - Desktop: 4 columns (md:grid-cols-4)
                 */}
                <PortfolioSummary />

                {/* Rest of the dashboard */}
                <div className="space-y-6">
                    {/* Additional components */}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Integration Notes
// ============================================================================

/**
 * INTEGRATION CHECKLIST:
 * 
 * 1. Wallet Connection Required:
 *    - Component requires a connected wallet via wagmi
 *    - Shows loading state while fetching data
 *    - Displays zero values when no investments exist
 * 
 * 2. Smart Contract Dependencies:
 *    - InvoiceNFT contract (for invoice details)
 *    - FinancingPool contract (for investment data)
 *    - Requires proper contract addresses in environment variables
 * 
 * 3. Styling:
 *    - Uses shadcn-ui Card components
 *    - Respects active theme (light/dark mode)
 *    - Responsive grid layout built-in
 * 
 * 4. Animations:
 *    - Framer Motion for card animations
 *    - AnimatedCounter for smooth number transitions
 *    - Respects prefers-reduced-motion setting
 * 
 * 5. Performance:
 *    - Data cached via TanStack Query (30s stale time)
 *    - Automatic refetch on wallet change
 *    - Optimized contract reads
 */

// ============================================================================
// Common Patterns
// ============================================================================

/**
 * Pattern 1: Conditional rendering based on wallet connection
 */
export function ConditionalRenderExample() {
    // This would typically use useAccount from wagmi
    const isConnected = true; // Replace with actual hook

    return (
        <div className="container mx-auto p-6">
            {isConnected ? (
                <>
                    <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1>
                    <PortfolioSummary />
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        Connect your wallet to view your portfolio
                    </p>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                        Connect Wallet
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Pattern 2: Side-by-side with other metrics
 */
export function SideBySideLayoutExample() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Main metrics */}
            <PortfolioSummary />

            {/* Secondary metrics in a grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Additional metric cards or charts */}
            </div>
        </div>
    );
}

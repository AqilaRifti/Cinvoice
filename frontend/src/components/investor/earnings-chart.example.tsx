/**
 * EarningsChart Component Examples
 * 
 * This file demonstrates various usage patterns for the EarningsChart component.
 */

import { EarningsChart } from './earnings-chart';

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

export function BasicEarningsChart() {
    return (
        <div className="container mx-auto p-6">
            <EarningsChart />
        </div>
    );
}

// ============================================================================
// Example 2: In Dashboard Layout
// ============================================================================

export function InvestorDashboardWithChart() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Portfolio Summary Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {/* Stats cards would go here */}
            </div>

            {/* Earnings Chart */}
            <EarningsChart />

            {/* Portfolio Table */}
            <div>
                {/* Portfolio table would go here */}
            </div>
        </div>
    );
}

// ============================================================================
// Example 3: With Custom Styling
// ============================================================================

export function StyledEarningsChart() {
    return (
        <div className="container mx-auto p-6">
            <EarningsChart className="shadow-xl" />
        </div>
    );
}

// ============================================================================
// Example 4: In Grid Layout
// ============================================================================

export function GridLayoutWithChart() {
    return (
        <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Chart takes 2/3 width */}
                <div className="lg:col-span-2">
                    <EarningsChart />
                </div>

                {/* Right column - Additional info */}
                <div className="space-y-4">
                    {/* Other components */}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Example 5: Responsive Layout
// ============================================================================

export function ResponsiveEarningsChart() {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {/* Mobile: Full width */}
            {/* Tablet: Full width */}
            {/* Desktop: Part of grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EarningsChart />
                <div>
                    {/* Other dashboard components */}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Example 6: With Loading State (for testing)
// ============================================================================

export function EarningsChartLoadingState() {
    // In real usage, loading state is handled internally
    // This example shows what the loading state looks like
    return (
        <div className="container mx-auto p-6">
            <EarningsChart />
        </div>
    );
}

// ============================================================================
// Example 7: Full Investor Dashboard Page
// ============================================================================

export function FullInvestorDashboard() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Investor Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Track your investments and earnings
                </p>
            </div>

            {/* Portfolio Summary */}
            <section>
                {/* PortfolioSummary component */}
            </section>

            {/* Earnings Chart */}
            <section>
                <EarningsChart />
            </section>

            {/* Portfolio Table */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Your Investments</h2>
                {/* PortfolioTable component */}
            </section>
        </div>
    );
}

// ============================================================================
// Example 8: With Animation Wrapper
// ============================================================================

import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';

export function AnimatedDashboard() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="container mx-auto p-6 space-y-6"
        >
            <motion.div variants={fadeInUp}>
                {/* Portfolio Summary */}
            </motion.div>

            <motion.div variants={fadeInUp}>
                <EarningsChart />
            </motion.div>

            <motion.div variants={fadeInUp}>
                {/* Portfolio Table */}
            </motion.div>
        </motion.div>
    );
}

// ============================================================================
// Example 9: Conditional Rendering Based on User State
// ============================================================================

export function ConditionalEarningsChart() {
    const hasInvestments = true; // Replace with actual check

    return (
        <div className="container mx-auto p-6">
            {hasInvestments ? (
                <EarningsChart />
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        Start investing to see your earnings chart
                    </p>
                    <button className="btn btn-primary">
                        Browse Marketplace
                    </button>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Example 10: Integration with Real Data Hook (Future)
// ============================================================================

/**
 * This example shows how to integrate with real blockchain data
 * once the useEarningsData hook is implemented
 */

/*
import { useEarningsData } from '@/hooks/use-earnings-data';

export function RealDataEarningsChart() {
  const { data, isLoading, error } = useEarningsData();

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Failed to load earnings data
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <EarningsChart />
    </div>
  );
}
*/

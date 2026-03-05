import { formatEther, parseEther } from 'viem';
import { formatDistanceToNow, format, isPast, differenceInDays } from 'date-fns';

// ============================================================================
// Invoice Calculations
// ============================================================================

/**
 * Calculate purchase price based on face value and discount rate
 * @param faceValue - Invoice face value in wei
 * @param discountRate - Discount rate in basis points (e.g., 500 = 5%)
 * @returns Purchase price in wei
 */
export function calculatePurchasePrice(
    faceValue: bigint,
    discountRate: number
): bigint {
    // Purchase price = faceValue * (10000 - discountRate) / 10000
    const discountMultiplier = BigInt(10000 - discountRate);
    return (faceValue * discountMultiplier) / 10000n;
}

/**
 * Calculate ROI percentage
 * @param purchasePrice - Purchase price in wei
 * @param faceValue - Face value in wei
 * @returns ROI as a percentage (e.g., 5.5 for 5.5%)
 */
export function calculateROI(
    purchasePrice: bigint,
    faceValue: bigint
): number {
    if (purchasePrice === 0n) return 0;

    const profit = faceValue - purchasePrice;
    const roiBigInt = (profit * 10000n) / purchasePrice;

    return Number(roiBigInt) / 100;
}

/**
 * Calculate expected return
 * @param purchasePrice - Purchase price in wei
 * @param faceValue - Face value in wei
 * @returns Expected return in wei
 */
export function calculateExpectedReturn(
    purchasePrice: bigint,
    faceValue: bigint
): bigint {
    return faceValue - purchasePrice;
}

/**
 * Calculate discount rate from purchase price and face value
 * @param purchasePrice - Purchase price in wei
 * @param faceValue - Face value in wei
 * @returns Discount rate in basis points
 */
export function calculateDiscountRate(
    purchasePrice: bigint,
    faceValue: bigint
): number {
    if (faceValue === 0n) return 0;

    const discount = faceValue - purchasePrice;
    const discountRate = (discount * 10000n) / faceValue;

    return Number(discountRate);
}

/**
 * Calculate days until repayment
 * @param repaymentDate - Repayment date timestamp (seconds)
 * @returns Number of days until repayment
 */
export function calculateDaysUntilRepayment(repaymentDate: number): number {
    const now = Math.floor(Date.now() / 1000);
    const secondsUntil = repaymentDate - now;
    return Math.max(0, Math.ceil(secondsUntil / (24 * 60 * 60)));
}

/**
 * Calculate annualized ROI
 * @param roi - ROI percentage
 * @param daysUntilRepayment - Days until repayment
 * @returns Annualized ROI percentage
 */
export function calculateAnnualizedROI(
    roi: number,
    daysUntilRepayment: number
): number {
    if (daysUntilRepayment === 0) return 0;
    return (roi * 365) / daysUntilRepayment;
}

// ============================================================================
// Credit Score Calculations
// ============================================================================

/**
 * Calculate credit score trend
 * @param currentScore - Current credit score
 * @param previousScore - Previous credit score
 * @returns Trend direction and percentage change
 */
export function calculateCreditScoreTrend(
    currentScore: number,
    previousScore: number
): { trend: 'up' | 'down' | 'stable'; percentage: number } {
    if (currentScore === previousScore) {
        return { trend: 'stable', percentage: 0 };
    }

    const diff = currentScore - previousScore;
    const percentage = Math.abs((diff / previousScore) * 100);

    return {
        trend: diff > 0 ? 'up' : 'down',
        percentage: Math.round(percentage * 100) / 100,
    };
}

/**
 * Get credit score color based on score value
 * @param score - Credit score (300-850)
 * @returns Color name
 */
export function getCreditScoreColor(score: number): string {
    if (score >= 750) return 'green';
    if (score >= 500) return 'yellow';
    return 'red';
}

/**
 * Get credit score label
 * @param score - Credit score (300-850)
 * @returns Label (Excellent, Good, Fair, Poor)
 */
export function getCreditScoreLabel(score: number): string {
    if (score >= 750) return 'Excellent';
    if (score >= 650) return 'Good';
    if (score >= 500) return 'Fair';
    return 'Poor';
}

// ============================================================================
// Platform Fee Calculations
// ============================================================================

/**
 * Calculate platform fee
 * @param amount - Amount in wei
 * @param feePercent - Fee percentage in basis points
 * @returns Fee amount in wei
 */
export function calculatePlatformFee(
    amount: bigint,
    feePercent: number
): bigint {
    return (amount * BigInt(feePercent)) / 10000n;
}

/**
 * Calculate amount after fee
 * @param amount - Amount in wei
 * @param feePercent - Fee percentage in basis points
 * @returns Amount after fee in wei
 */
export function calculateAmountAfterFee(
    amount: bigint,
    feePercent: number
): bigint {
    const fee = calculatePlatformFee(amount, feePercent);
    return amount - fee;
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format currency amount
 * @param amount - Amount in wei
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatCurrency(amount: bigint, decimals = 2): string {
    const ether = formatEther(amount);
    const num = parseFloat(ether);
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/**
 * Format percentage
 * @param value - Percentage value
 * @param decimals - Number of decimal places
 * @returns Formatted string with % sign
 */
export function formatPercentage(value: number, decimals = 2): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format basis points as percentage
 * @param basisPoints - Value in basis points
 * @param decimals - Number of decimal places
 * @returns Formatted string with % sign
 */
export function formatBasisPoints(basisPoints: number, decimals = 2): string {
    return formatPercentage(basisPoints / 100, decimals);
}

/**
 * Parse currency input to wei
 * @param value - String value
 * @returns Amount in wei
 */
export function parseCurrencyInput(value: string): bigint {
    try {
        return parseEther(value);
    } catch {
        return 0n;
    }
}

/**
 * Format date with relative time (e.g., "in 30 days")
 * @param date - Date, timestamp (seconds or milliseconds), or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
    date: Date | number | string,
    options?: {
        relative?: boolean;
        format?: string;
    }
): string {
    const dateObj = typeof date === 'number'
        ? new Date(date < 10000000000 ? date * 1000 : date) // Handle both seconds and milliseconds
        : new Date(date);

    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }

    // Default to relative time
    if (options?.relative !== false) {
        return formatDistanceToNow(dateObj, { addSuffix: true });
    }

    // Use custom format if provided
    if (options?.format) {
        return format(dateObj, options.format);
    }

    // Default format: "Jan 15, 2024"
    return format(dateObj, 'MMM dd, yyyy');
}

/**
 * Format repayment date with urgency indicator
 * @param repaymentDate - Repayment date timestamp (seconds)
 * @returns Object with formatted date and urgency level
 */
export function formatRepaymentDate(repaymentDate: number): {
    formatted: string;
    urgency: 'overdue' | 'urgent' | 'soon' | 'normal';
    daysRemaining: number;
} {
    const dateObj = new Date(repaymentDate * 1000);
    const daysRemaining = calculateDaysUntilRepayment(repaymentDate);

    let urgency: 'overdue' | 'urgent' | 'soon' | 'normal';
    if (isPast(dateObj)) {
        urgency = 'overdue';
    } else if (daysRemaining <= 7) {
        urgency = 'urgent';
    } else if (daysRemaining <= 30) {
        urgency = 'soon';
    } else {
        urgency = 'normal';
    }

    return {
        formatted: formatDate(repaymentDate),
        urgency,
        daysRemaining,
    };
}

/**
 * Format timestamp to readable date
 * @param timestamp - Unix timestamp in seconds
 * @param formatString - Optional format string (default: "MMM dd, yyyy HH:mm")
 * @returns Formatted date string
 */
export function formatTimestamp(
    timestamp: number,
    formatString = 'MMM dd, yyyy HH:mm'
): string {
    const dateObj = new Date(timestamp * 1000);
    return format(dateObj, formatString);
}

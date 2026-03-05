'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/animations';

// ============================================================================
// Types
// ============================================================================

export type NumberFormat = 'default' | 'currency' | 'percentage' | 'decimal' | 'compact';

export interface AnimatedCounterProps {
    /**
     * The target value to animate to
     */
    value: number;

    /**
     * Animation duration in milliseconds
     * @default 1000
     */
    duration?: number;

    /**
     * Number formatting type
     * @default 'default'
     */
    format?: NumberFormat;

    /**
     * Currency symbol (used when format is 'currency')
     * @default 'CTC'
     */
    currency?: string;

    /**
     * Number of decimal places
     * @default 0
     */
    decimals?: number;

    /**
     * Prefix to display before the number
     */
    prefix?: string;

    /**
     * Suffix to display after the number
     */
    suffix?: string;

    /**
     * Custom className for styling
     */
    className?: string;

    /**
     * Easing function
     * @default 'easeOut'
     */
    ease?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format number based on the specified format type
 */
function formatNumber(
    value: number,
    format: NumberFormat,
    decimals: number,
    currency?: string
): string {
    switch (format) {
        case 'currency':
            return `${value.toFixed(decimals)} ${currency}`;

        case 'percentage':
            return `${value.toFixed(decimals)}%`;

        case 'decimal':
            return value.toFixed(decimals);

        case 'compact':
            return formatCompactNumber(value, decimals);

        case 'default':
        default:
            return Math.floor(value).toLocaleString();
    }
}

/**
 * Format number in compact notation (e.g., 1.2K, 3.4M)
 */
function formatCompactNumber(value: number, decimals: number): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1_000_000_000) {
        return `${sign}${(absValue / 1_000_000_000).toFixed(decimals)}B`;
    }
    if (absValue >= 1_000_000) {
        return `${sign}${(absValue / 1_000_000).toFixed(decimals)}M`;
    }
    if (absValue >= 1_000) {
        return `${sign}${(absValue / 1_000).toFixed(decimals)}K`;
    }
    return `${sign}${absValue.toFixed(decimals)}`;
}

// ============================================================================
// Component
// ============================================================================

/**
 * AnimatedCounter Component
 * 
 * Smoothly animates number changes with support for various formatting options.
 * Uses Framer Motion for smooth spring-based animations.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <AnimatedCounter value={1234} />
 * 
 * // Currency format
 * <AnimatedCounter value={100.5} format="currency" currency="CTC" decimals={2} />
 * 
 * // Percentage
 * <AnimatedCounter value={75.5} format="percentage" decimals={1} />
 * 
 * // Compact notation
 * <AnimatedCounter value={1500000} format="compact" decimals={1} />
 * 
 * // With custom duration and prefix
 * <AnimatedCounter value={42} duration={2000} prefix="+" suffix=" items" />
 * ```
 */
export function AnimatedCounter({
    value,
    duration = 1000,
    format = 'default',
    currency = 'CTC',
    decimals = 0,
    prefix = '',
    suffix = '',
    className = '',
    ease = 'easeOut',
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const prevValueRef = useRef(value);

    // Check for reduced motion preference
    const shouldReduceMotion = prefersReducedMotion();

    // Spring animation for smooth transitions
    const spring = useSpring(value, {
        duration: shouldReduceMotion ? 0 : duration,
        bounce: 0,
    });

    // Update spring value when target value changes
    useEffect(() => {
        if (shouldReduceMotion) {
            setDisplayValue(value);
        } else {
            spring.set(value);
        }
        prevValueRef.current = value;
    }, [value, spring, shouldReduceMotion]);

    // Subscribe to spring updates
    useEffect(() => {
        if (shouldReduceMotion) return;

        const unsubscribe = spring.on('change', (latest) => {
            setDisplayValue(latest);
        });

        return unsubscribe;
    }, [spring, shouldReduceMotion]);

    // Format the display value
    const formattedValue = formatNumber(displayValue, format, decimals, currency);

    return (
        <motion.span
            className={className}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
        >
            {prefix}
            {formattedValue}
            {suffix}
        </motion.span>
    );
}

// ============================================================================
// Specialized Counter Components
// ============================================================================

/**
 * Currency counter with default CTC formatting
 */
export function CurrencyCounter({
    value,
    currency = 'CTC',
    decimals = 2,
    ...props
}: Omit<AnimatedCounterProps, 'format'>) {
    return (
        <AnimatedCounter
            value={value}
            format="currency"
            currency={currency}
            decimals={decimals}
            {...props}
        />
    );
}

/**
 * Percentage counter
 */
export function PercentageCounter({
    value,
    decimals = 1,
    ...props
}: Omit<AnimatedCounterProps, 'format'>) {
    return (
        <AnimatedCounter
            value={value}
            format="percentage"
            decimals={decimals}
            {...props}
        />
    );
}

/**
 * Compact number counter (1.2K, 3.4M, etc.)
 */
export function CompactCounter({
    value,
    decimals = 1,
    ...props
}: Omit<AnimatedCounterProps, 'format'>) {
    return (
        <AnimatedCounter
            value={value}
            format="compact"
            decimals={decimals}
            {...props}
        />
    );
}

/**
 * Integer counter (no decimals)
 */
export function IntegerCounter({
    value,
    ...props
}: Omit<AnimatedCounterProps, 'format' | 'decimals'>) {
    return (
        <AnimatedCounter
            value={value}
            format="default"
            decimals={0}
            {...props}
        />
    );
}

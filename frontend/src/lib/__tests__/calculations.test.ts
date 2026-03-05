import { describe, it, expect } from '@jest/globals';
import {
    calculatePurchasePrice,
    calculateROI,
    calculateDiscountRate,
    formatCurrency,
    formatDate,
    formatRepaymentDate,
    calculateDaysUntilRepayment,
} from '../calculations';
import { parseEther } from 'viem';

describe('Calculation Utilities', () => {
    describe('calculatePurchasePrice', () => {
        it('should calculate purchase price correctly', () => {
            const faceValue = parseEther('1000'); // 1000 CTC
            const discountRate = 500; // 5%
            const purchasePrice = calculatePurchasePrice(faceValue, discountRate);

            // Expected: 1000 * (10000 - 500) / 10000 = 950
            expect(purchasePrice).toBe(parseEther('950'));
        });

        it('should handle zero discount rate', () => {
            const faceValue = parseEther('1000');
            const discountRate = 0;
            const purchasePrice = calculatePurchasePrice(faceValue, discountRate);

            expect(purchasePrice).toBe(faceValue);
        });

        it('should handle 100% discount rate', () => {
            const faceValue = parseEther('1000');
            const discountRate = 10000; // 100%
            const purchasePrice = calculatePurchasePrice(faceValue, discountRate);

            expect(purchasePrice).toBe(0n);
        });
    });

    describe('calculateROI', () => {
        it('should calculate ROI correctly', () => {
            const purchasePrice = parseEther('950');
            const faceValue = parseEther('1000');
            const roi = calculateROI(purchasePrice, faceValue);

            // Expected: ((1000 - 950) / 950) * 100 = 5.26%
            expect(roi).toBeCloseTo(5.26, 1);
        });

        it('should return 0 for zero purchase price', () => {
            const purchasePrice = 0n;
            const faceValue = parseEther('1000');
            const roi = calculateROI(purchasePrice, faceValue);

            expect(roi).toBe(0);
        });

        it('should handle equal purchase price and face value', () => {
            const amount = parseEther('1000');
            const roi = calculateROI(amount, amount);

            expect(roi).toBe(0);
        });
    });

    describe('calculateDiscountRate', () => {
        it('should calculate discount rate correctly', () => {
            const purchasePrice = parseEther('950');
            const faceValue = parseEther('1000');
            const discountRate = calculateDiscountRate(purchasePrice, faceValue);

            // Expected: ((1000 - 950) / 1000) * 10000 = 500 basis points (5%)
            expect(discountRate).toBe(500);
        });

        it('should return 0 for zero face value', () => {
            const purchasePrice = parseEther('950');
            const faceValue = 0n;
            const discountRate = calculateDiscountRate(purchasePrice, faceValue);

            expect(discountRate).toBe(0);
        });

        it('should handle equal purchase price and face value', () => {
            const amount = parseEther('1000');
            const discountRate = calculateDiscountRate(amount, amount);

            expect(discountRate).toBe(0);
        });
    });

    describe('formatCurrency', () => {
        it('should format currency with default decimals', () => {
            const amount = parseEther('1234.56');
            const formatted = formatCurrency(amount);

            expect(formatted).toBe('1,234.56');
        });

        it('should format currency with custom decimals', () => {
            const amount = parseEther('1234.567');
            const formatted = formatCurrency(amount, 3);

            expect(formatted).toBe('1,234.567');
        });

        it('should handle zero amount', () => {
            const amount = 0n;
            const formatted = formatCurrency(amount);

            expect(formatted).toBe('0.00');
        });
    });

    describe('formatDate', () => {
        it('should format date with relative time by default', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            const timestamp = Math.floor(futureDate.getTime() / 1000);

            const formatted = formatDate(timestamp);

            expect(formatted).toContain('in');
            expect(formatted).toContain('days');
        });

        it('should format date with custom format', () => {
            const date = new Date('2024-01-15');
            const timestamp = Math.floor(date.getTime() / 1000);

            const formatted = formatDate(timestamp, { relative: false });

            expect(formatted).toContain('Jan');
            expect(formatted).toContain('15');
            expect(formatted).toContain('2024');
        });

        it('should handle invalid date', () => {
            const formatted = formatDate('invalid');

            expect(formatted).toBe('Invalid date');
        });
    });

    describe('formatRepaymentDate', () => {
        it('should mark overdue dates', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 10);
            const timestamp = Math.floor(pastDate.getTime() / 1000);

            const result = formatRepaymentDate(timestamp);

            expect(result.urgency).toBe('overdue');
            expect(result.daysRemaining).toBe(0);
        });

        it('should mark urgent dates (within 7 days)', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 5);
            const timestamp = Math.floor(futureDate.getTime() / 1000);

            const result = formatRepaymentDate(timestamp);

            expect(result.urgency).toBe('urgent');
            expect(result.daysRemaining).toBeLessThanOrEqual(7);
        });

        it('should mark soon dates (within 30 days)', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 20);
            const timestamp = Math.floor(futureDate.getTime() / 1000);

            const result = formatRepaymentDate(timestamp);

            expect(result.urgency).toBe('soon');
            expect(result.daysRemaining).toBeGreaterThan(7);
            expect(result.daysRemaining).toBeLessThanOrEqual(30);
        });

        it('should mark normal dates (more than 30 days)', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 60);
            const timestamp = Math.floor(futureDate.getTime() / 1000);

            const result = formatRepaymentDate(timestamp);

            expect(result.urgency).toBe('normal');
            expect(result.daysRemaining).toBeGreaterThan(30);
        });
    });

    describe('calculateDaysUntilRepayment', () => {
        it('should calculate days correctly', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            const timestamp = Math.floor(futureDate.getTime() / 1000);

            const days = calculateDaysUntilRepayment(timestamp);

            expect(days).toBeGreaterThanOrEqual(29);
            expect(days).toBeLessThanOrEqual(31);
        });

        it('should return 0 for past dates', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 10);
            const timestamp = Math.floor(pastDate.getTime() / 1000);

            const days = calculateDaysUntilRepayment(timestamp);

            expect(days).toBe(0);
        });
    });
});

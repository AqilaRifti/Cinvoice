/**
 * Manual verification script for calculation utilities
 * Run with: bun run frontend/src/lib/__tests__/verify-calculations.ts
 */

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

console.log('=== Testing Calculation Utilities ===\n');

// Test calculatePurchasePrice
console.log('1. Testing calculatePurchasePrice:');
const faceValue = parseEther('1000');
const discountRate = 500; // 5%
const purchasePrice = calculatePurchasePrice(faceValue, discountRate);
console.log(`   Face Value: 1000 CTC`);
console.log(`   Discount Rate: 5% (500 basis points)`);
console.log(`   Purchase Price: ${formatCurrency(purchasePrice)} CTC`);
console.log(`   Expected: 950 CTC`);
console.log(`   ✓ ${formatCurrency(purchasePrice) === '950.00' ? 'PASS' : 'FAIL'}\n`);

// Test calculateROI
console.log('2. Testing calculateROI:');
const roi = calculateROI(purchasePrice, faceValue);
console.log(`   Purchase Price: ${formatCurrency(purchasePrice)} CTC`);
console.log(`   Face Value: ${formatCurrency(faceValue)} CTC`);
console.log(`   ROI: ${roi.toFixed(2)}%`);
console.log(`   Expected: ~5.26%`);
console.log(`   ✓ ${Math.abs(roi - 5.26) < 0.1 ? 'PASS' : 'FAIL'}\n`);

// Test calculateDiscountRate
console.log('3. Testing calculateDiscountRate:');
const calculatedDiscountRate = calculateDiscountRate(purchasePrice, faceValue);
console.log(`   Purchase Price: ${formatCurrency(purchasePrice)} CTC`);
console.log(`   Face Value: ${formatCurrency(faceValue)} CTC`);
console.log(`   Discount Rate: ${calculatedDiscountRate} basis points (${calculatedDiscountRate / 100}%)`);
console.log(`   Expected: 500 basis points (5%)`);
console.log(`   ✓ ${calculatedDiscountRate === 500 ? 'PASS' : 'FAIL'}\n`);

// Test formatCurrency
console.log('4. Testing formatCurrency:');
const amount = parseEther('1234.56');
const formatted = formatCurrency(amount);
console.log(`   Amount: 1234.56 CTC`);
console.log(`   Formatted: ${formatted}`);
console.log(`   Expected: 1,234.56`);
console.log(`   ✓ ${formatted === '1,234.56' ? 'PASS' : 'FAIL'}\n`);

// Test formatDate with relative time
console.log('5. Testing formatDate (relative time):');
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 30);
const timestamp = Math.floor(futureDate.getTime() / 1000);
const relativeDate = formatDate(timestamp);
console.log(`   Date: 30 days from now`);
console.log(`   Formatted: ${relativeDate}`);
console.log(`   Expected: "in 30 days" or "in about 1 month"`);
console.log(`   ✓ ${relativeDate.includes('in') && (relativeDate.includes('days') || relativeDate.includes('month')) ? 'PASS' : 'FAIL'}\n`);

// Test formatDate with custom format
console.log('6. Testing formatDate (custom format):');
const specificDate = new Date('2024-01-15');
const specificTimestamp = Math.floor(specificDate.getTime() / 1000);
const customFormatted = formatDate(specificTimestamp, { relative: false });
console.log(`   Date: 2024-01-15`);
console.log(`   Formatted: ${customFormatted}`);
console.log(`   Expected: "Jan 15, 2024"`);
console.log(`   ✓ ${customFormatted.includes('Jan') && customFormatted.includes('15') && customFormatted.includes('2024') ? 'PASS' : 'FAIL'}\n`);

// Test formatRepaymentDate
console.log('7. Testing formatRepaymentDate:');

// Test urgent (5 days)
const urgentDate = new Date();
urgentDate.setDate(urgentDate.getDate() + 5);
const urgentTimestamp = Math.floor(urgentDate.getTime() / 1000);
const urgentResult = formatRepaymentDate(urgentTimestamp);
console.log(`   a) 5 days from now:`);
console.log(`      Formatted: ${urgentResult.formatted}`);
console.log(`      Urgency: ${urgentResult.urgency}`);
console.log(`      Days Remaining: ${urgentResult.daysRemaining}`);
console.log(`      Expected urgency: urgent`);
console.log(`      ✓ ${urgentResult.urgency === 'urgent' ? 'PASS' : 'FAIL'}`);

// Test soon (20 days)
const soonDate = new Date();
soonDate.setDate(soonDate.getDate() + 20);
const soonTimestamp = Math.floor(soonDate.getTime() / 1000);
const soonResult = formatRepaymentDate(soonTimestamp);
console.log(`   b) 20 days from now:`);
console.log(`      Formatted: ${soonResult.formatted}`);
console.log(`      Urgency: ${soonResult.urgency}`);
console.log(`      Days Remaining: ${soonResult.daysRemaining}`);
console.log(`      Expected urgency: soon`);
console.log(`      ✓ ${soonResult.urgency === 'soon' ? 'PASS' : 'FAIL'}`);

// Test normal (60 days)
const normalDate = new Date();
normalDate.setDate(normalDate.getDate() + 60);
const normalTimestamp = Math.floor(normalDate.getTime() / 1000);
const normalResult = formatRepaymentDate(normalTimestamp);
console.log(`   c) 60 days from now:`);
console.log(`      Formatted: ${normalResult.formatted}`);
console.log(`      Urgency: ${normalResult.urgency}`);
console.log(`      Days Remaining: ${normalResult.daysRemaining}`);
console.log(`      Expected urgency: normal`);
console.log(`      ✓ ${normalResult.urgency === 'normal' ? 'PASS' : 'FAIL'}`);

// Test overdue
const overdueDate = new Date();
overdueDate.setDate(overdueDate.getDate() - 10);
const overdueTimestamp = Math.floor(overdueDate.getTime() / 1000);
const overdueResult = formatRepaymentDate(overdueTimestamp);
console.log(`   d) 10 days ago (overdue):`);
console.log(`      Formatted: ${overdueResult.formatted}`);
console.log(`      Urgency: ${overdueResult.urgency}`);
console.log(`      Days Remaining: ${overdueResult.daysRemaining}`);
console.log(`      Expected urgency: overdue`);
console.log(`      ✓ ${overdueResult.urgency === 'overdue' ? 'PASS' : 'FAIL'}\n`);

// Test calculateDaysUntilRepayment
console.log('8. Testing calculateDaysUntilRepayment:');
const days = calculateDaysUntilRepayment(timestamp);
console.log(`   Date: 30 days from now`);
console.log(`   Days Until Repayment: ${days}`);
console.log(`   Expected: ~30 days`);
console.log(`   ✓ ${days >= 29 && days <= 31 ? 'PASS' : 'FAIL'}\n`);

console.log('=== All Tests Complete ===');

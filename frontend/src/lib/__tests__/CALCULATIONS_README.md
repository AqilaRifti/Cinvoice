# Calculation Utilities - Implementation Summary

## Overview

This document summarizes the calculation utilities implemented for Task 3.1 of the Frontend Redesign spec.

## Implemented Functions

### Invoice Calculations

1. **calculatePurchasePrice(faceValue, discountRate)**
   - Calculates the purchase price based on face value and discount rate
   - Formula: `purchasePrice = faceValue × (10000 - discountRate) / 10000`
   - Example: Face value of 1000 CTC with 5% discount = 950 CTC

2. **calculateROI(purchasePrice, faceValue)**
   - Calculates Return on Investment as a percentage
   - Formula: `ROI = ((faceValue - purchasePrice) / purchasePrice) × 100`
   - Example: Purchase 950 CTC, receive 1000 CTC = 5.26% ROI

3. **calculateDiscountRate(purchasePrice, faceValue)**
   - Calculates discount rate in basis points from purchase price and face value
   - Formula: `discountRate = ((faceValue - purchasePrice) / faceValue) × 10000`
   - Example: Purchase 950 CTC for 1000 CTC face value = 500 basis points (5%)

4. **calculateExpectedReturn(purchasePrice, faceValue)**
   - Calculates the expected profit in wei
   - Formula: `expectedReturn = faceValue - purchasePrice`

5. **calculateDaysUntilRepayment(repaymentDate)**
   - Calculates days remaining until repayment date
   - Returns 0 for past dates

6. **calculateAnnualizedROI(roi, daysUntilRepayment)**
   - Calculates annualized ROI based on investment period
   - Formula: `annualizedROI = (roi × 365) / daysUntilRepayment`

### Credit Score Calculations

7. **calculateCreditScoreTrend(currentScore, previousScore)**
   - Determines trend direction (up/down/stable) and percentage change
   - Returns: `{ trend: 'up' | 'down' | 'stable', percentage: number }`

8. **getCreditScoreColor(score)**
   - Returns color based on credit score ranges
   - Green: 750+, Yellow: 500-749, Red: 300-499

9. **getCreditScoreLabel(score)**
   - Returns label based on credit score
   - Excellent: 750+, Good: 650-749, Fair: 500-649, Poor: <500

### Platform Fee Calculations

10. **calculatePlatformFee(amount, feePercent)**
    - Calculates platform fee in wei
    - Formula: `fee = (amount × feePercent) / 10000`

11. **calculateAmountAfterFee(amount, feePercent)**
    - Calculates amount after deducting platform fee
    - Formula: `amountAfterFee = amount - fee`

### Formatting Utilities

12. **formatCurrency(amount, decimals)**
    - Formats wei amount to readable currency string
    - Example: `1234560000000000000000n` → `"1,234.56"`
    - Default: 2 decimal places

13. **formatPercentage(value, decimals)**
    - Formats number as percentage with % sign
    - Example: `5.26` → `"5.26%"`

14. **formatBasisPoints(basisPoints, decimals)**
    - Formats basis points as percentage
    - Example: `500` → `"5.00%"`

15. **parseCurrencyInput(value)**
    - Parses string input to wei
    - Returns 0n on invalid input

16. **formatDate(date, options)** ✨ NEW
    - Formats dates with relative time by default
    - Options:
      - `relative: false` - Use absolute date format
      - `format: string` - Custom date-fns format string
    - Examples:
      - Default: `"in 30 days"`, `"2 months ago"`
      - Absolute: `"Jan 15, 2024"`
      - Custom: Any date-fns format

17. **formatRepaymentDate(repaymentDate)** ✨ NEW
    - Formats repayment date with urgency indicator
    - Returns:
      ```typescript
      {
        formatted: string,        // Relative time format
        urgency: 'overdue' | 'urgent' | 'soon' | 'normal',
        daysRemaining: number
      }
      ```
    - Urgency levels:
      - `overdue`: Past due date
      - `urgent`: ≤7 days remaining
      - `soon`: 8-30 days remaining
      - `normal`: >30 days remaining

18. **formatTimestamp(timestamp, formatString)** ✨ NEW
    - Formats Unix timestamp to readable date
    - Default format: `"MMM dd, yyyy HH:mm"`
    - Example: `1705334400` → `"Jan 15, 2024 12:00"`

## Requirements Satisfied

This implementation satisfies the following requirements from the Frontend Redesign spec:

- **Requirement 4.4**: Display repayment date with relative time (e.g., "in 30 days")
- **Requirement 4.7**: Calculate and display ROI
- **Requirement 4.9**: Calculate purchase price and discount rate
- **Requirement 6.3**: Display repayment date with relative time and urgency indicator

## Testing

All functions have been tested with the verification script:
```bash
npx tsx src/lib/__tests__/verify-calculations.ts
```

All tests pass successfully, including:
- Purchase price calculations
- ROI calculations
- Discount rate calculations
- Currency formatting
- Date formatting (relative and absolute)
- Repayment date urgency indicators
- Days until repayment calculations

## Usage Examples

### Basic Invoice Calculations
```typescript
import { calculatePurchasePrice, calculateROI, formatCurrency } from '@/lib/calculations';
import { parseEther } from 'viem';

const faceValue = parseEther('1000');
const discountRate = 500; // 5%

const purchasePrice = calculatePurchasePrice(faceValue, discountRate);
const roi = calculateROI(purchasePrice, faceValue);

console.log(`Purchase Price: ${formatCurrency(purchasePrice)} CTC`);
console.log(`ROI: ${roi.toFixed(2)}%`);
```

### Date Formatting with Relative Time
```typescript
import { formatDate, formatRepaymentDate } from '@/lib/calculations';

// Relative time (default)
const repaymentTimestamp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
console.log(formatDate(repaymentTimestamp)); // "in 30 days"

// Absolute date
console.log(formatDate(repaymentTimestamp, { relative: false })); // "Feb 14, 2024"

// With urgency indicator
const { formatted, urgency, daysRemaining } = formatRepaymentDate(repaymentTimestamp);
console.log(`Due ${formatted} (${urgency}, ${daysRemaining} days)`);
```

### Credit Score Display
```typescript
import { getCreditScoreColor, getCreditScoreLabel } from '@/lib/calculations';

const score = 720;
const color = getCreditScoreColor(score); // "yellow"
const label = getCreditScoreLabel(score); // "Good"
```

## Dependencies

- **viem**: For Ethereum value formatting (formatEther, parseEther)
- **date-fns**: For date formatting and relative time calculations
  - `formatDistanceToNow`: Relative time formatting
  - `format`: Custom date formatting
  - `isPast`: Check if date is in the past
  - `differenceInDays`: Calculate day differences

## Notes

- All currency calculations use bigint to maintain precision
- Discount rates are in basis points (100 basis points = 1%)
- Timestamps are expected in seconds (Unix timestamp)
- The formatDate function automatically detects seconds vs milliseconds
- All functions handle edge cases (zero values, invalid inputs)

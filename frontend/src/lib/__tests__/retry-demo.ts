/**
 * Demonstration of Retry Logic with Exponential Backoff
 * 
 * This file demonstrates how the retry logic works for failed contract reads.
 * It can be run manually to see the retry behavior in action.
 * 
 * **Validates: Requirements 17.8**
 */

import { exponentialBackoff, shouldRetryContractRead } from '../query-client';

// Simulate different error scenarios
const scenarios = [
    {
        name: 'Network Error (Should Retry)',
        error: new Error('Network request failed'),
        expectedRetries: 3,
    },
    {
        name: 'RPC Error (Should Retry)',
        error: new Error('RPC call failed'),
        expectedRetries: 3,
    },
    {
        name: 'Contract Revert (Should NOT Retry)',
        error: new Error('execution reverted'),
        expectedRetries: 0,
    },
    {
        name: 'User Rejected (Should NOT Retry)',
        error: new Error('User rejected transaction'),
        expectedRetries: 0,
    },
];

console.log('='.repeat(60));
console.log('Retry Logic Demonstration');
console.log('='.repeat(60));
console.log();

// Test exponential backoff
console.log('Exponential Backoff Delays:');
console.log('-'.repeat(60));
for (let i = 0; i < 5; i++) {
    const delay = exponentialBackoff(i);
    console.log(`Attempt ${i + 1}: ${delay}ms (${delay / 1000}s)`);
}
console.log();

// Test retry decision logic
console.log('Retry Decision Logic:');
console.log('-'.repeat(60));
scenarios.forEach((scenario) => {
    console.log(`\nScenario: ${scenario.name}`);
    console.log(`Error: "${scenario.error.message}"`);

    let retryCount = 0;
    for (let attempt = 0; attempt < 5; attempt++) {
        const shouldRetry = shouldRetryContractRead(attempt, scenario.error);
        if (shouldRetry) {
            retryCount++;
            const delay = exponentialBackoff(attempt);
            console.log(`  Attempt ${attempt + 1}: RETRY (delay: ${delay}ms)`);
        } else {
            console.log(`  Attempt ${attempt + 1}: STOP`);
            break;
        }
    }

    const result = retryCount === scenario.expectedRetries ? '✓ PASS' : '✗ FAIL';
    console.log(`  Result: ${retryCount} retries ${result}`);
});

console.log();
console.log('='.repeat(60));
console.log('Demonstration Complete');
console.log('='.repeat(60));

// Export for testing
export { scenarios };

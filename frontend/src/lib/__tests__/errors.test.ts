/**
 * Unit tests for error handling utilities
 * Tests parseContractError, sanitizeInput, and helper functions
 */

import { describe, it, expect } from 'vitest';
import { BaseError, ContractFunctionRevertedError } from 'viem';
import {
    parseContractError,
    sanitizeInput,
    sanitizeObject,
    isUserRejection,
    isNetworkError,
    formatErrorForLogging,
} from '../errors';

describe('parseContractError', () => {
    it('should handle user rejection errors', () => {
        const error = new Error('user rejected transaction');
        expect(parseContractError(error)).toBe('Transaction was rejected');
    });

    it('should handle insufficient funds errors', () => {
        const error = new Error('insufficient funds for transaction');
        expect(parseContractError(error)).toBe('Insufficient funds for transaction');
    });

    it('should handle network errors', () => {
        const error = new Error('network error occurred');
        expect(parseContractError(error)).toBe('Network error occurred. Please check your connection');
    });

    it('should handle contract-specific errors', () => {
        expect(parseContractError(new Error('InvalidFaceValue'))).toBe(
            'Invalid invoice face value. Must be greater than zero'
        );
        expect(parseContractError(new Error('InvalidRepaymentDate'))).toBe(
            'Repayment date must be in the future'
        );
        expect(parseContractError(new Error('Unauthorized'))).toBe(
            'You are not authorized to perform this action'
        );
    });

    it('should handle string errors', () => {
        expect(parseContractError('user rejected')).toBe('Transaction was rejected');
        expect(parseContractError('Custom error message')).toBe('Custom error message');
    });

    it('should handle null/undefined errors', () => {
        expect(parseContractError(null)).toBe('An unknown error occurred');
        expect(parseContractError(undefined)).toBe('An unknown error occurred');
    });

    it('should handle objects with message property', () => {
        const error = { message: 'insufficient funds' };
        expect(parseContractError(error)).toBe('Insufficient funds for transaction');
    });

    it('should handle unknown error types', () => {
        expect(parseContractError(123)).toBe('An unknown error occurred');
        expect(parseContractError({})).toBe('An unknown error occurred');
    });

    it('should be case-insensitive for error matching', () => {
        expect(parseContractError(new Error('USER REJECTED'))).toBe('Transaction was rejected');
        expect(parseContractError(new Error('Insufficient Funds'))).toBe('Insufficient funds for transaction');
    });

    it('should handle BaseError from viem', () => {
        const error = new BaseError('Transaction failed', {
            metaMessages: ['Some meta message'],
        });
        expect(parseContractError(error)).toContain('Transaction failed');
    });
});

describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
        expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('Hello');
        expect(sanitizeInput('<div>Test</div>')).toBe('Test');
        expect(sanitizeInput('<p>Paragraph</p>')).toBe('Paragraph');
    });

    it('should escape special HTML characters', () => {
        expect(sanitizeInput('Test & Co')).toBe('Test &amp; Co');
        expect(sanitizeInput('5 < 10')).toBe('5 &lt; 10');
        expect(sanitizeInput('10 > 5')).toBe('10 &gt; 5');
        expect(sanitizeInput('Say "hello"')).toBe('Say &quot;hello&quot;');
        expect(sanitizeInput("It's nice")).toBe('It&#x27;s nice');
    });

    it('should remove null bytes', () => {
        expect(sanitizeInput('Test\0String')).toBe('TestString');
    });

    it('should trim whitespace', () => {
        expect(sanitizeInput('  Hello  ')).toBe('Hello');
        expect(sanitizeInput('\n\tTest\n\t')).toBe('Test');
    });

    it('should handle empty strings', () => {
        expect(sanitizeInput('')).toBe('');
    });

    it('should handle non-string inputs', () => {
        expect(sanitizeInput(null as any)).toBe('');
        expect(sanitizeInput(undefined as any)).toBe('');
        expect(sanitizeInput(123 as any)).toBe('');
    });

    it('should handle complex XSS attempts', () => {
        const xssAttempts = [
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)>',
            'javascript:alert(1)',
            '<iframe src="javascript:alert(1)">',
        ];

        xssAttempts.forEach((attempt) => {
            const result = sanitizeInput(attempt);
            expect(result).not.toContain('<');
            expect(result).not.toContain('>');
            expect(result).not.toContain('script');
        });
    });

    it('should preserve safe text', () => {
        const safeText = 'This is a safe invoice description with numbers 123 and symbols !@#$%';
        const result = sanitizeInput(safeText);
        expect(result).toContain('This is a safe invoice description');
        expect(result).toContain('123');
    });
});

describe('sanitizeObject', () => {
    it('should sanitize string properties', () => {
        const input = {
            name: '<script>alert("xss")</script>John',
            description: 'Safe text',
            amount: 100,
        };

        const result = sanitizeObject(input);
        expect(result.name).toBe('John');
        expect(result.description).toBe('Safe text');
        expect(result.amount).toBe(100);
    });

    it('should handle nested objects', () => {
        const input = {
            user: {
                name: '<b>John</b>',
                email: 'test@example.com',
            },
            metadata: {
                description: '<script>xss</script>Description',
            },
        };

        const result = sanitizeObject(input);
        expect(result.user.name).toBe('John');
        expect(result.user.email).toBe('test@example.com');
        expect(result.metadata.description).toBe('Description');
    });

    it('should preserve non-string values', () => {
        const input = {
            text: '<b>Bold</b>',
            number: 42,
            boolean: true,
            nullValue: null,
            array: [1, 2, 3],
        };

        const result = sanitizeObject(input);
        expect(result.text).toBe('Bold');
        expect(result.number).toBe(42);
        expect(result.boolean).toBe(true);
        expect(result.nullValue).toBe(null);
        expect(result.array).toEqual([1, 2, 3]);
    });

    it('should not mutate original object', () => {
        const input = {
            name: '<script>xss</script>John',
            value: 100,
        };

        const result = sanitizeObject(input);
        expect(input.name).toBe('<script>xss</script>John'); // Original unchanged
        expect(result.name).toBe('John'); // Result sanitized
    });
});

describe('isUserRejection', () => {
    it('should detect user rejection errors', () => {
        expect(isUserRejection(new Error('user rejected transaction'))).toBe(true);
        expect(isUserRejection(new Error('User denied transaction'))).toBe(true);
        expect(isUserRejection(new Error('User cancelled the request'))).toBe(true);
        expect(isUserRejection('user rejected')).toBe(true);
    });

    it('should return false for non-rejection errors', () => {
        expect(isUserRejection(new Error('insufficient funds'))).toBe(false);
        expect(isUserRejection(new Error('network error'))).toBe(false);
        expect(isUserRejection('some other error')).toBe(false);
    });

    it('should handle null/undefined', () => {
        expect(isUserRejection(null)).toBe(false);
        expect(isUserRejection(undefined)).toBe(false);
    });

    it('should be case-insensitive', () => {
        expect(isUserRejection(new Error('USER REJECTED'))).toBe(true);
        expect(isUserRejection(new Error('User Denied'))).toBe(true);
    });
});

describe('isNetworkError', () => {
    it('should detect network errors', () => {
        expect(isNetworkError(new Error('network error occurred'))).toBe(true);
        expect(isNetworkError(new Error('failed to fetch'))).toBe(true);
        expect(isNetworkError(new Error('connection timeout'))).toBe(true);
        expect(isNetworkError('network issue')).toBe(true);
    });

    it('should return false for non-network errors', () => {
        expect(isNetworkError(new Error('user rejected'))).toBe(false);
        expect(isNetworkError(new Error('insufficient funds'))).toBe(false);
        expect(isNetworkError('some other error')).toBe(false);
    });

    it('should handle null/undefined', () => {
        expect(isNetworkError(null)).toBe(false);
        expect(isNetworkError(undefined)).toBe(false);
    });

    it('should be case-insensitive', () => {
        expect(isNetworkError(new Error('NETWORK ERROR'))).toBe(true);
        expect(isNetworkError(new Error('Failed To Fetch'))).toBe(true);
    });
});

describe('formatErrorForLogging', () => {
    it('should format Error objects', () => {
        const error = new Error('Test error');
        const formatted = formatErrorForLogging(error);

        expect(formatted.message).toBe('Test error');
        expect(formatted.name).toBe('Error');
        expect(formatted.stack).toBeDefined();
    });

    it('should format BaseError objects', () => {
        const error = new BaseError('Base error');
        const formatted = formatErrorForLogging(error);

        expect(formatted.message).toBe('Base error');
        expect(formatted.name).toBe('BaseError');
        expect(formatted.stack).toBeDefined();
    });

    it('should format string errors', () => {
        const formatted = formatErrorForLogging('String error');
        expect(formatted.message).toBe('String error');
        expect(formatted.stack).toBeUndefined();
    });

    it('should handle unknown error types', () => {
        const formatted = formatErrorForLogging({ custom: 'error' });
        expect(formatted.message).toBe('Unknown error');
        expect(formatted.stack).toContain('custom');
    });

    it('should extract error code if available', () => {
        const error = new Error('Test error') as any;
        error.code = 'CUSTOM_CODE';
        const formatted = formatErrorForLogging(error);

        expect(formatted.message).toBe('Test error');
        expect(formatted.code).toBeUndefined(); // Only BaseError has code extraction
    });
});

describe('Edge cases and integration', () => {
    it('should handle errors with multiple matching patterns', () => {
        // Error message contains multiple patterns, should match first one
        const error = new Error('user rejected transaction due to insufficient funds');
        const result = parseContractError(error);
        // Should match "user rejected" first
        expect(result).toBe('Transaction was rejected');
    });

    it('should handle very long error messages', () => {
        const longMessage = 'A'.repeat(10000) + ' user rejected';
        const result = parseContractError(new Error(longMessage));
        expect(result).toBe('Transaction was rejected');
    });

    it('should handle special characters in error messages', () => {
        const error = new Error('Error: InvalidFaceValue() with special chars !@#$%^&*()');
        const result = parseContractError(error);
        expect(result).toContain('Invalid invoice face value');
    });

    it('should sanitize form data before submission', () => {
        const formData = {
            invoiceNumber: 'INV-001',
            description: '<script>alert("xss")</script>Invoice for services',
            customerName: '<b>John Doe</b>',
            faceValue: '1000',
        };

        const sanitized = sanitizeObject(formData);
        expect(sanitized.invoiceNumber).toBe('INV-001');
        expect(sanitized.description).toBe('Invoice for services');
        expect(sanitized.customerName).toBe('John Doe');
        expect(sanitized.faceValue).toBe('1000');
    });
});

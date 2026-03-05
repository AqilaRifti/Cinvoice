/**
 * Error handling utilities for contract interactions and user input sanitization
 * 
 * This module provides:
 * - Contract error parsing to user-friendly messages
 * - Error message mapping for common wagmi/viem errors
 * - Input sanitization for XSS prevention
 * 
 * Requirements: 16.4, 16.5
 */

import { BaseError, ContractFunctionRevertedError } from 'viem';

/**
 * Error message mappings for common contract and wallet errors
 */
const ERROR_MESSAGES: Record<string, string> = {
    // User rejection errors
    'user rejected': 'Transaction was rejected',
    'User rejected': 'Transaction was rejected',
    'user denied': 'Transaction was rejected',
    'User denied': 'Transaction was rejected',

    // Insufficient funds errors
    'insufficient funds': 'Insufficient funds for transaction',
    'Insufficient funds': 'Insufficient funds for transaction',
    'exceeds balance': 'Insufficient funds for transaction',

    // Network errors
    'network error': 'Network error occurred. Please check your connection',
    'Network error': 'Network error occurred. Please check your connection',
    'failed to fetch': 'Network error occurred. Please check your connection',

    // Contract-specific errors (InvoiceNFT)
    'InvalidFaceValue': 'Invalid invoice face value. Must be greater than zero',
    'InvalidRepaymentDate': 'Repayment date must be in the future',
    'Unauthorized': 'You are not authorized to perform this action',
    'TransferRestricted': 'Cannot transfer funded invoices',
    'InvoiceNotFound': 'Invoice not found',

    // Contract-specific errors (FinancingPool)
    'InvoiceNotAvailable': 'Invoice is not available for purchase',
    'IncorrectPayment': 'Incorrect payment amount',
    'AlreadyRepaid': 'Invoice has already been repaid',
    'NotInvestor': 'Only the investor can perform this action',

    // Contract-specific errors (CreditScoreOracle)
    'InvalidScore': 'Invalid credit score value',
    'ScoreNotFound': 'Credit score not found for this address',

    // Contract-specific errors (PlatformGovernance)
    'NotAdmin': 'Only admins can perform this action',
    'ProposalNotFound': 'Proposal not found',
    'AlreadyApproved': 'You have already approved this proposal',
    'ProposalAlreadyExecuted': 'Proposal has already been executed',
    'InsufficientApprovals': 'Insufficient approvals to execute proposal',
    'Paused': 'Platform is currently paused',

    // Gas estimation errors
    'gas required exceeds': 'Transaction would fail. Please check your inputs',
    'execution reverted': 'Transaction would fail. Please check your inputs',
};

/**
 * Parse contract errors and return user-friendly error messages
 * 
 * Handles:
 * - Viem BaseError and ContractFunctionRevertedError
 * - Wagmi error types
 * - Common wallet errors (user rejection, insufficient funds)
 * - Network errors
 * - Contract-specific revert reasons
 * 
 * @param error - The error object from contract interaction
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * try {
 *   await writeContract({ ... });
 * } catch (error) {
 *   const message = parseContractError(error);
 *   toast.error(message);
 * }
 * ```
 */
export function parseContractError(error: unknown): string {
    // Handle null/undefined
    if (!error) {
        return 'An unknown error occurred';
    }

    // Handle viem BaseError
    if (error instanceof BaseError) {
        // Check for contract function reverted error
        if (error instanceof ContractFunctionRevertedError) {
            const revertError = error as ContractFunctionRevertedError;

            // Try to extract custom error name
            if (revertError.data?.errorName) {
                const errorName = revertError.data.errorName;
                if (ERROR_MESSAGES[errorName]) {
                    return ERROR_MESSAGES[errorName];
                }
                // Return formatted error name if no mapping exists
                return `Contract error: ${errorName}`;
            }

            // Try to extract revert reason from message
            const revertReason = extractRevertReason(revertError.message);
            if (revertReason && ERROR_MESSAGES[revertReason]) {
                return ERROR_MESSAGES[revertReason];
            }
        }

        // Check error message against known patterns
        const errorMessage = error.message || error.shortMessage || '';
        for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
            if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
                return message;
            }
        }

        // Return the short message if available, otherwise the full message
        return error.shortMessage || error.message || 'Transaction failed';
    }

    // Handle standard Error objects
    if (error instanceof Error) {
        const errorMessage = error.message;

        // Check against known error patterns
        for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
            if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
                return message;
            }
        }

        return errorMessage;
    }

    // Handle string errors
    if (typeof error === 'string') {
        for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
            if (error.toLowerCase().includes(pattern.toLowerCase())) {
                return message;
            }
        }
        return error;
    }

    // Handle objects with message property
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message: unknown }).message;
        if (typeof message === 'string') {
            return parseContractError(message);
        }
    }

    return 'An unknown error occurred';
}

/**
 * Extract revert reason from error message
 * Handles various formats of revert messages from different providers
 */
function extractRevertReason(message: string): string | null {
    // Try to extract from "reverted with reason string 'ReasonHere'"
    const reasonMatch = message.match(/reverted with reason string ['"]([^'"]+)['"]/);
    if (reasonMatch) {
        return reasonMatch[1];
    }

    // Try to extract from "reverted with custom error 'ErrorName()'"
    const customErrorMatch = message.match(/reverted with custom error ['"]([^('"]+)/);
    if (customErrorMatch) {
        return customErrorMatch[1];
    }

    // Try to extract from "Error: ErrorName"
    const errorNameMatch = message.match(/Error:\s*([A-Za-z]+)/);
    if (errorNameMatch) {
        return errorNameMatch[1];
    }

    return null;
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 * 
 * This function:
 * - Removes HTML tags
 * - Escapes special characters
 * - Trims whitespace
 * - Prevents script injection
 * 
 * Note: This is a basic sanitization suitable for text inputs.
 * For rich text, consider using a dedicated library like DOMPurify.
 * 
 * @param input - The user input string to sanitize
 * @returns Sanitized string safe for display and storage
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script>Hello';
 * const safe = sanitizeInput(userInput); // Returns: "Hello"
 * ```
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }

    return (
        input
            // Remove HTML tags
            .replace(/<[^>]*>/g, '')
            // Escape special HTML characters
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            // Remove null bytes
            .replace(/\0/g, '')
            // Trim whitespace
            .trim()
    );
}

/**
 * Sanitize an object's string properties
 * Useful for sanitizing form data before submission
 * 
 * @param obj - Object with string properties to sanitize
 * @returns New object with sanitized string values
 * 
 * @example
 * ```typescript
 * const formData = {
 *   name: '<script>alert("xss")</script>John',
 *   description: 'Safe text',
 *   amount: 100
 * };
 * const safe = sanitizeObject(formData);
 * // Returns: { name: 'John', description: 'Safe text', amount: 100 }
 * ```
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };

    for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitizeInput(sanitized[key]) as any;
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    }

    return sanitized;
}

/**
 * Check if an error is a user rejection error
 * Useful for handling user rejections differently (e.g., not showing error toast)
 * 
 * @param error - The error to check
 * @returns True if the error is a user rejection
 * 
 * @example
 * ```typescript
 * try {
 *   await writeContract({ ... });
 * } catch (error) {
 *   if (!isUserRejection(error)) {
 *     toast.error(parseContractError(error));
 *   }
 * }
 * ```
 */
export function isUserRejection(error: unknown): boolean {
    if (!error) return false;

    const errorMessage =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : '';

    return (
        errorMessage.toLowerCase().includes('user rejected') ||
        errorMessage.toLowerCase().includes('user denied') ||
        errorMessage.toLowerCase().includes('user cancelled')
    );
}

/**
 * Check if an error is a network error
 * 
 * @param error - The error to check
 * @returns True if the error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    if (!error) return false;

    const errorMessage =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : '';

    return (
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('fetch') ||
        errorMessage.toLowerCase().includes('connection')
    );
}

/**
 * Format error for logging/debugging
 * Extracts useful information from error objects
 * 
 * @param error - The error to format
 * @returns Formatted error information
 */
export function formatErrorForLogging(error: unknown): {
    message: string;
    stack?: string;
    name?: string;
    code?: string | number;
} {
    if (error instanceof BaseError) {
        return {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: (error as any).code,
        };
    }

    if (error instanceof Error) {
        return {
            message: error.message,
            stack: error.stack,
            name: error.name,
        };
    }

    if (typeof error === 'string') {
        return { message: error };
    }

    return { message: 'Unknown error', stack: JSON.stringify(error) };
}

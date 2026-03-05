/**
 * Example usage of error handling utilities
 * This file demonstrates how to use the error handling functions in real scenarios
 */

import { parseContractError, sanitizeInput, sanitizeObject, isUserRejection } from '../errors';
import { toast } from 'sonner';

/**
 * Example 1: Handling contract write errors with user-friendly messages
 */
export async function handleMintInvoice(writeContract: any, params: any) {
    try {
        const hash = await writeContract({
            address: '0x...',
            abi: [],
            functionName: 'mintInvoice',
            args: params,
        });

        toast.success('Invoice minted successfully!');
        return hash;
    } catch (error) {
        // Don't show toast for user rejections (they know they rejected)
        if (!isUserRejection(error)) {
            const message = parseContractError(error);
            toast.error(message);
        }
        throw error;
    }
}

/**
 * Example 2: Sanitizing form data before submission
 */
export function handleFormSubmit(formData: {
    invoiceNumber: string;
    description: string;
    customerName: string;
    customerAddress?: string;
}) {
    // Sanitize all string inputs to prevent XSS
    const sanitized = sanitizeObject(formData);

    // Now safe to use in UI or send to backend
    console.log('Sanitized form data:', sanitized);

    return sanitized;
}

/**
 * Example 3: Sanitizing individual user inputs
 */
export function displayUserInput(userInput: string) {
    // Sanitize before displaying in UI
    const safe = sanitizeInput(userInput);

    // Safe to render in HTML
    return `<div>${safe}</div>`;
}

/**
 * Example 4: Handling different error types with appropriate UI feedback
 */
export async function handleContractInteraction(action: () => Promise<any>) {
    try {
        return await action();
    } catch (error) {
        // User rejection - silent or minimal feedback
        if (isUserRejection(error)) {
            console.log('User rejected transaction');
            return null;
        }

        // Parse and display error
        const message = parseContractError(error);
        toast.error(message, {
            duration: 5000,
            action: {
                label: 'Retry',
                onClick: () => handleContractInteraction(action),
            },
        });

        throw error;
    }
}

/**
 * Example 5: Using in React Hook Form with sanitization
 */
export function createInvoiceFormHandler() {
    return async (data: any) => {
        try {
            // Sanitize form data
            const sanitizedData = sanitizeObject({
                description: data.description,
                customerName: data.customerName,
                customerAddress: data.customerAddress,
            });

            // Submit to contract
            // await mintInvoice(sanitizedData);

            toast.success('Invoice created successfully!');
        } catch (error) {
            if (!isUserRejection(error)) {
                toast.error(parseContractError(error));
            }
        }
    };
}

/**
 * Example 6: Comprehensive error handling in a mutation hook
 */
export function useMintInvoiceMutation() {
    return {
        mutate: async (params: any) => {
            try {
                // Sanitize inputs
                const sanitized = sanitizeObject(params);

                // Call contract
                // const result = await writeContract(sanitized);

                toast.success('Invoice minted!');
                // return result;
            } catch (error) {
                // Skip toast for user rejections
                if (isUserRejection(error)) {
                    return;
                }

                // Show user-friendly error message
                const message = parseContractError(error);
                toast.error(message);

                throw error;
            }
        },
    };
}

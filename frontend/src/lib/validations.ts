import { z } from 'zod';
import { isAddress } from 'viem';
import { ProposalType } from '@/types';

// ============================================================================
// Address Validation Helpers
// ============================================================================

/**
 * Validates an Ethereum address using viem's isAddress function
 */
export function isValidEthereumAddress(address: string): boolean {
    return isAddress(address);
}

/**
 * Zod refinement for Ethereum address validation
 */
export const ethereumAddressSchema = z
    .string()
    .refine(
        (val) => isValidEthereumAddress(val),
        'Invalid Ethereum address'
    );

// ============================================================================
// Mint Invoice Form Schema
// ============================================================================

export const mintInvoiceSchema = z.object({
    // Step 1: PDF Upload
    pdfFile: z
        .instanceof(File)
        .refine(
            (file) => file.type === 'application/pdf',
            'File must be a PDF'
        )
        .refine(
            (file) => file.size <= 10 * 1024 * 1024,
            'File size must be less than 10MB'
        ),

    // Step 2: Invoice Details
    invoiceNumber: z.string().min(1, 'Invoice number is required'),
    faceValue: z
        .string()
        .min(1, 'Face value is required')
        .refine(
            (val) => !isNaN(Number(val)) && Number(val) > 0,
            'Face value must be a positive number'
        ),
    repaymentDate: z
        .date()
        .min(new Date(), 'Repayment date must be in the future'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters'),
    customerName: z.string().min(1, 'Customer name is required'),
    customerAddress: z.string().optional(),
});

export type MintInvoiceFormData = z.infer<typeof mintInvoiceSchema>;

// ============================================================================
// Investment Form Schema
// ============================================================================

export const investmentSchema = z.object({
    tokenId: z.number(),
    amount: z
        .string()
        .min(1, 'Investment amount is required')
        .refine(
            (val) => !isNaN(Number(val)) && Number(val) > 0,
            'Amount must be a positive number'
        ),
    acceptTerms: z
        .boolean()
        .refine((val) => val === true, 'You must accept the terms and conditions'),
});

export type InvestmentFormData = z.infer<typeof investmentSchema>;

// ============================================================================
// Proposal Form Schema
// ============================================================================

export const proposalSchema = z.object({
    proposalType: z.nativeEnum(ProposalType),
    target: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
        .optional(),
    value: z
        .string()
        .refine(
            (val) => !isNaN(Number(val)) && Number(val) >= 0,
            'Value must be a non-negative number'
        )
        .optional(),
    description: z
        .string()
        .min(20, 'Description must be at least 20 characters'),
});

export type ProposalFormData = z.infer<typeof proposalSchema>;

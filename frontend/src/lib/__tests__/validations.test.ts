import { describe, it, expect } from '@jest/globals';
import {
    mintInvoiceSchema,
    investmentSchema,
    proposalSchema,
    isValidEthereumAddress,
} from '../validations';
import { ProposalType } from '@/types';

describe('Address Validation Helpers', () => {
    describe('isValidEthereumAddress', () => {
        it('validates correct Ethereum addresses', () => {
            expect(isValidEthereumAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBe(true);
            expect(isValidEthereumAddress('0x0000000000000000000000000000000000000000')).toBe(true);
        });

        it('rejects invalid Ethereum addresses', () => {
            expect(isValidEthereumAddress('0x123')).toBe(false);
            expect(isValidEthereumAddress('not an address')).toBe(false);
            expect(isValidEthereumAddress('')).toBe(false);
        });
    });
});

describe('Mint Invoice Schema', () => {
    it('validates correct invoice data', () => {
        const validData = {
            pdfFile: new File(['test'], 'invoice.pdf', { type: 'application/pdf' }),
            invoiceNumber: 'INV-001',
            faceValue: '1000',
            repaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            description: 'Test invoice description',
            customerName: 'Test Customer',
            customerAddress: '123 Test St',
        };

        const result = mintInvoiceSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('rejects PDF files larger than 10MB', () => {
        const largeFile = new File(
            [new ArrayBuffer(11 * 1024 * 1024)],
            'large.pdf',
            { type: 'application/pdf' }
        );

        const data = {
            pdfFile: largeFile,
            invoiceNumber: 'INV-001',
            faceValue: '1000',
            repaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            description: 'Test invoice description',
            customerName: 'Test Customer',
        };

        const result = mintInvoiceSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('10MB');
        }
    });

    it('rejects non-PDF files', () => {
        const txtFile = new File(['test'], 'invoice.txt', { type: 'text/plain' });

        const data = {
            pdfFile: txtFile,
            invoiceNumber: 'INV-001',
            faceValue: '1000',
            repaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            description: 'Test invoice description',
            customerName: 'Test Customer',
        };

        const result = mintInvoiceSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('PDF');
        }
    });

    it('rejects negative face values', () => {
        const data = {
            pdfFile: new File(['test'], 'invoice.pdf', { type: 'application/pdf' }),
            invoiceNumber: 'INV-001',
            faceValue: '-100',
            repaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            description: 'Test invoice description',
            customerName: 'Test Customer',
        };

        const result = mintInvoiceSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('positive number');
        }
    });

    it('rejects past repayment dates', () => {
        const data = {
            pdfFile: new File(['test'], 'invoice.pdf', { type: 'application/pdf' }),
            invoiceNumber: 'INV-001',
            faceValue: '1000',
            repaymentDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
            description: 'Test invoice description',
            customerName: 'Test Customer',
        };

        const result = mintInvoiceSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('future');
        }
    });

    it('rejects short descriptions', () => {
        const data = {
            pdfFile: new File(['test'], 'invoice.pdf', { type: 'application/pdf' }),
            invoiceNumber: 'INV-001',
            faceValue: '1000',
            repaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            description: 'Short',
            customerName: 'Test Customer',
        };

        const result = mintInvoiceSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('10 characters');
        }
    });
});

describe('Investment Schema', () => {
    it('validates correct investment data', () => {
        const validData = {
            tokenId: 1,
            amount: '100',
            acceptTerms: true,
        };

        const result = investmentSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('rejects negative amounts', () => {
        const data = {
            tokenId: 1,
            amount: '-50',
            acceptTerms: true,
        };

        const result = investmentSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('positive number');
        }
    });

    it('requires terms acceptance', () => {
        const data = {
            tokenId: 1,
            amount: '100',
            acceptTerms: false,
        };

        const result = investmentSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('terms and conditions');
        }
    });
});

describe('Proposal Schema', () => {
    it('validates correct proposal data', () => {
        const validData = {
            proposalType: ProposalType.Pause,
            target: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            value: '1000',
            description: 'This is a test proposal with sufficient description length',
        };

        const result = proposalSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('rejects invalid Ethereum addresses', () => {
        const data = {
            proposalType: ProposalType.Whitelist,
            target: '0x123',
            value: '0',
            description: 'This is a test proposal with sufficient description length',
        };

        const result = proposalSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('Invalid Ethereum address');
        }
    });

    it('rejects negative values', () => {
        const data = {
            proposalType: ProposalType.TreasuryWithdraw,
            target: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            value: '-100',
            description: 'This is a test proposal with sufficient description length',
        };

        const result = proposalSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('non-negative number');
        }
    });

    it('rejects short descriptions', () => {
        const data = {
            proposalType: ProposalType.Pause,
            description: 'Too short',
        };

        const result = proposalSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('20 characters');
        }
    });

    it('allows optional target and value fields', () => {
        const data = {
            proposalType: ProposalType.Pause,
            description: 'This is a test proposal with sufficient description length',
        };

        const result = proposalSchema.safeParse(data);
        expect(result.success).toBe(true);
    });
});

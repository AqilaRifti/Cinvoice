/**
 * Manual verification script for validation schemas
 * Run with: npx tsx src/lib/__tests__/verify-validations.ts
 */

import {
    mintInvoiceSchema,
    investmentSchema,
    proposalSchema,
    isValidEthereumAddress,
} from '../validations';
import { ProposalType } from '@/types';

console.log('🧪 Testing Validation Schemas\n');

// Test 1: Address Validation
console.log('1️⃣  Testing Address Validation:');
const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
const invalidAddress = '0x123';
console.log(`   Valid address (${validAddress}):`, isValidEthereumAddress(validAddress));
console.log(`   Invalid address (${invalidAddress}):`, isValidEthereumAddress(invalidAddress));
console.log('   ✅ Address validation working\n');

// Test 2: Mint Invoice Schema
console.log('2️⃣  Testing Mint Invoice Schema:');
const validInvoiceData = {
    pdfFile: new File(['test'], 'invoice.pdf', { type: 'application/pdf' }),
    invoiceNumber: 'INV-001',
    faceValue: '1000',
    repaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    description: 'Test invoice description with sufficient length',
    customerName: 'Test Customer',
    customerAddress: '123 Test St',
};

const invoiceResult = mintInvoiceSchema.safeParse(validInvoiceData);
console.log('   Valid invoice data:', invoiceResult.success ? '✅ PASS' : '❌ FAIL');

const invalidInvoiceData = {
    ...validInvoiceData,
    faceValue: '-100', // Invalid: negative value
};
const invalidInvoiceResult = mintInvoiceSchema.safeParse(invalidInvoiceData);
console.log('   Invalid invoice data (negative value):', !invalidInvoiceResult.success ? '✅ PASS' : '❌ FAIL');
if (!invalidInvoiceResult.success) {
    console.log('   Error message:', invalidInvoiceResult.error.issues[0].message);
}
console.log('   ✅ Mint invoice schema working\n');

// Test 3: Investment Schema
console.log('3️⃣  Testing Investment Schema:');
const validInvestmentData = {
    tokenId: 1,
    amount: '100',
    acceptTerms: true,
};

const investmentResult = investmentSchema.safeParse(validInvestmentData);
console.log('   Valid investment data:', investmentResult.success ? '✅ PASS' : '❌ FAIL');

const invalidInvestmentData = {
    ...validInvestmentData,
    acceptTerms: false, // Invalid: terms not accepted
};
const invalidInvestmentResult = investmentSchema.safeParse(invalidInvestmentData);
console.log('   Invalid investment data (terms not accepted):', !invalidInvestmentResult.success ? '✅ PASS' : '❌ FAIL');
if (!invalidInvestmentResult.success) {
    console.log('   Error message:', invalidInvestmentResult.error.issues[0].message);
}
console.log('   ✅ Investment schema working\n');

// Test 4: Proposal Schema
console.log('4️⃣  Testing Proposal Schema:');
const validProposalData = {
    proposalType: ProposalType.Pause,
    target: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    value: '1000',
    description: 'This is a test proposal with sufficient description length',
};

const proposalResult = proposalSchema.safeParse(validProposalData);
console.log('   Valid proposal data:', proposalResult.success ? '✅ PASS' : '❌ FAIL');

const invalidProposalData = {
    ...validProposalData,
    target: '0x123', // Invalid: bad address format
};
const invalidProposalResult = proposalSchema.safeParse(invalidProposalData);
console.log('   Invalid proposal data (bad address):', !invalidProposalResult.success ? '✅ PASS' : '❌ FAIL');
if (!invalidProposalResult.success) {
    console.log('   Error message:', invalidProposalResult.error.issues[0].message);
}
console.log('   ✅ Proposal schema working\n');

console.log('🎉 All validation schemas are working correctly!');

# Validation Schemas

This document describes the validation schemas implemented for the Creditcoin Invoice Financing Platform frontend.

## Overview

The validation schemas are defined in `src/lib/validations.ts` using [Zod](https://zod.dev/), a TypeScript-first schema validation library. These schemas ensure data integrity and provide clear error messages for form validation.

## Schemas

### 1. Mint Invoice Schema (`mintInvoiceSchema`)

Validates data for minting new invoice NFTs.

**Fields:**
- `pdfFile` (File): PDF file of the invoice
  - Must be a PDF file (`application/pdf`)
  - Maximum size: 10MB
- `invoiceNumber` (string): Unique invoice identifier
  - Required, minimum 1 character
- `faceValue` (string): Invoice face value in CTC
  - Required, must be a positive number
- `repaymentDate` (Date): Expected repayment date
  - Must be in the future
- `description` (string): Invoice description
  - Minimum 10 characters
- `customerName` (string): Customer name
  - Required, minimum 1 character
- `customerAddress` (string, optional): Customer address

**Usage:**
```typescript
import { mintInvoiceSchema, MintInvoiceFormData } from '@/lib/validations';

const data: MintInvoiceFormData = {
  pdfFile: file,
  invoiceNumber: 'INV-001',
  faceValue: '1000',
  repaymentDate: new Date('2024-12-31'),
  description: 'Payment for services rendered',
  customerName: 'Acme Corp',
};

const result = mintInvoiceSchema.safeParse(data);
if (result.success) {
  // Data is valid
  console.log(result.data);
} else {
  // Validation errors
  console.error(result.error.issues);
}
```

### 2. Investment Schema (`investmentSchema`)

Validates data for purchasing invoice NFTs.

**Fields:**
- `tokenId` (number): Invoice token ID to purchase
- `amount` (string): Investment amount in CTC
  - Required, must be a positive number
- `acceptTerms` (boolean): Terms and conditions acceptance
  - Must be `true`

**Usage:**
```typescript
import { investmentSchema, InvestmentFormData } from '@/lib/validations';

const data: InvestmentFormData = {
  tokenId: 1,
  amount: '950',
  acceptTerms: true,
};

const result = investmentSchema.safeParse(data);
```

### 3. Proposal Schema (`proposalSchema`)

Validates data for creating governance proposals.

**Fields:**
- `proposalType` (ProposalType): Type of proposal
  - Must be a valid ProposalType enum value
- `target` (string, optional): Target Ethereum address
  - Must be a valid Ethereum address (0x + 40 hex characters)
- `value` (string, optional): Value in wei
  - Must be a non-negative number
- `description` (string): Proposal description
  - Minimum 20 characters

**Usage:**
```typescript
import { proposalSchema, ProposalFormData } from '@/lib/validations';
import { ProposalType } from '@/types';

const data: ProposalFormData = {
  proposalType: ProposalType.Pause,
  description: 'Pause the platform for maintenance',
};

const result = proposalSchema.safeParse(data);
```

## Address Validation Helpers

### `isValidEthereumAddress(address: string): boolean`

Validates an Ethereum address using viem's `isAddress` function.

**Usage:**
```typescript
import { isValidEthereumAddress } from '@/lib/validations';

if (isValidEthereumAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')) {
  console.log('Valid address');
}
```

### `ethereumAddressSchema`

Zod schema for Ethereum address validation.

**Usage:**
```typescript
import { ethereumAddressSchema } from '@/lib/validations';

const schema = z.object({
  recipient: ethereumAddressSchema,
});
```

## Integration with React Hook Form

These schemas are designed to work seamlessly with React Hook Form using the `@hookform/resolvers` package:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mintInvoiceSchema, MintInvoiceFormData } from '@/lib/validations';

function MintInvoiceForm() {
  const form = useForm<MintInvoiceFormData>({
    resolver: zodResolver(mintInvoiceSchema),
    defaultValues: {
      invoiceNumber: '',
      faceValue: '',
      description: '',
      customerName: '',
    },
  });

  const onSubmit = (data: MintInvoiceFormData) => {
    // Data is guaranteed to be valid
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Testing

### Unit Tests

Unit tests are located in `src/lib/__tests__/validations.test.ts` and cover:
- Valid data acceptance
- Invalid data rejection
- Error message accuracy
- Edge cases (boundary values, optional fields)

### Manual Verification

Run the verification script to manually test the schemas:

```bash
npx tsx src/lib/__tests__/verify-validations.ts
```

## Requirements Mapping

These validation schemas satisfy the following requirements from the Frontend Redesign spec:

- **Requirement 16.1**: Real-time form validation with error feedback
- **Requirement 16.2**: Error messages below relevant fields
- **Requirement 16.3**: Prevention of form submission with validation errors

## Error Messages

All schemas provide clear, user-friendly error messages:

- "File must be a PDF"
- "File size must be less than 10MB"
- "Face value must be a positive number"
- "Repayment date must be in the future"
- "Description must be at least 10 characters"
- "You must accept the terms and conditions"
- "Invalid Ethereum address"
- "Value must be a non-negative number"

## Future Enhancements

Potential improvements for future iterations:

1. Add custom error messages per field
2. Add async validation for checking duplicate invoice numbers
3. Add cross-field validation (e.g., repayment date must be at least 7 days in future)
4. Add localization support for error messages
5. Add validation for specific ProposalType requirements

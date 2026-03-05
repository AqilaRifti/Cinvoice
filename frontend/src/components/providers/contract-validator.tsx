'use client';

import { useEffect, useState } from 'react';
import { validateContractAddresses, getCurrentNetwork } from '@/lib/contracts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * ContractValidator component validates contract addresses on startup
 * and displays an error if validation fails
 */
export function ContractValidator({ children }: { children: React.ReactNode }) {
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isValidated, setIsValidated] = useState(false);

    useEffect(() => {
        try {
            // Validate contract addresses
            validateContractAddresses();

            // Log network info
            const network = getCurrentNetwork();
            console.log(`Connected to ${network.name} (Chain ID: ${network.chainId})`);

            setIsValidated(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown validation error';
            setValidationError(message);
            console.error('Contract validation failed:', error);
        }
    }, []);

    // Show error if validation failed
    if (validationError) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Alert variant="destructive" className="max-w-2xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Contract Configuration Error</AlertTitle>
                    <AlertDescription className="mt-2 whitespace-pre-wrap">
                        {validationError}
                        <div className="mt-4 text-sm">
                            Please check your environment variables and ensure all contract addresses are properly configured.
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Don't render children until validation is complete
    if (!isValidated) {
        return null;
    }

    return <>{children}</>;
}

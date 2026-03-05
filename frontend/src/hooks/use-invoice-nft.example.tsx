/**
 * Example usage of InvoiceNFT hooks
 * 
 * This file demonstrates how to use the InvoiceNFT hooks in your components.
 * Delete this file after reviewing the examples.
 */

import { parseEther } from 'viem';
import { useMintInvoice, useInvoiceDetails, useUserInvoices, useInvoiceEvents } from './use-invoice-nft';

// ============================================================================
// Example 1: Minting an Invoice
// ============================================================================

function MintInvoiceButton() {
    const { mutateAsync: mintInvoice, isPending } = useMintInvoice();

    const handleMint = async () => {
        try {
            await mintInvoice({
                metadataURI: 'ipfs://QmExample...',
                faceValue: parseEther('1000'), // 1000 CTC
                repaymentDate: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            });

            // Success! The hook automatically:
            // - Shows a toast notification (via event listener)
            // - Invalidates relevant queries to refresh the UI
        } catch (error) {
            console.error('Failed to mint invoice:', error);
        }
    };

    return (
        <button onClick={handleMint} disabled={isPending}>
            {isPending ? 'Minting...' : 'Mint Invoice'}
        </button>
    );
}

// ============================================================================
// Example 2: Displaying Invoice Details
// ============================================================================

function InvoiceDetailsCard({ tokenId }: { tokenId: number }) {
    const { invoice, isLoading, error } = useInvoiceDetails(tokenId);

    if (isLoading) {
        return <div>Loading invoice details...</div>;
    }

    if (error) {
        return <div>Error loading invoice: {error.message}</div>;
    }

    if (!invoice) {
        return <div>Invoice not found</div>;
    }

    return (
        <div className="border rounded-lg p-4">
            <h3>Invoice #{invoice.tokenId}</h3>
            <p>Face Value: {invoice.faceValue.toString()} wei</p>
            <p>State: {invoice.state}</p>
            <p>SMB: {invoice.smb}</p>
            <p>Repayment Date: {new Date(invoice.repaymentDate * 1000).toLocaleDateString()}</p>
            <p>Credit Score at Minting: {invoice.creditScoreAtMinting}</p>
        </div>
    );
}

// ============================================================================
// Example 3: Displaying User's Invoices
// ============================================================================

function MyInvoicesList() {
    const { invoices, balance, isLoading } = useUserInvoices();

    if (isLoading) {
        return <div>Loading your invoices...</div>;
    }

    return (
        <div>
            <h2>My Invoices ({balance})</h2>
            {invoices.length === 0 ? (
                <p>You don't have any invoices yet.</p>
            ) : (
                <div className="grid gap-4">
                    {invoices.map((invoice) => (
                        <InvoiceDetailsCard key={invoice.tokenId} tokenId={invoice.tokenId} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Example 4: Viewing Another User's Invoices
// ============================================================================

function UserInvoicesList({ userAddress }: { userAddress: `0x${string}` }) {
    const { invoices, balance, isLoading } = useUserInvoices(userAddress);

    if (isLoading) {
        return <div>Loading invoices...</div>;
    }

    return (
        <div>
            <h2>Invoices for {userAddress} ({balance})</h2>
            <div className="grid gap-4">
                {invoices.map((invoice) => (
                    <InvoiceDetailsCard key={invoice.tokenId} tokenId={invoice.tokenId} />
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// Example 5: Setting up Event Listeners (App-level)
// ============================================================================

/**
 * This component should be placed at the app level (e.g., in your root layout)
 * to listen for contract events and automatically update the UI.
 */
function ContractEventListeners() {
    // This hook sets up event listeners for InvoiceMinted and InvoiceStateChanged
    // It automatically:
    // - Invalidates relevant queries when events occur
    // - Shows toast notifications for user feedback
    useInvoiceEvents();

    // This component doesn't render anything
    return null;
}

// ============================================================================
// Example 6: Complete Dashboard Component
// ============================================================================

function SMBDashboard() {
    const { invoices, balance, isLoading } = useUserInvoices();
    const { mutateAsync: mintInvoice, isPending: isMinting } = useMintInvoice();

    const handleMintInvoice = async () => {
        try {
            await mintInvoice({
                metadataURI: 'ipfs://QmExample...',
                faceValue: parseEther('1000'),
                repaymentDate: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
        } catch (error) {
            console.error('Failed to mint invoice:', error);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Invoices</h1>
                <button
                    onClick={handleMintInvoice}
                    disabled={isMinting}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {isMinting ? 'Minting...' : 'Create Invoice'}
                </button>
            </div>

            {isLoading ? (
                <div>Loading your invoices...</div>
            ) : (
                <>
                    <p className="mb-4">Total Invoices: {balance}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {invoices.map((invoice) => (
                            <InvoiceDetailsCard key={invoice.tokenId} tokenId={invoice.tokenId} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================================================
// Example 7: App Layout with Event Listeners
// ============================================================================

function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* Set up event listeners at the app level */}
            <ContractEventListeners />

            {/* Your app content */}
            <main>{children}</main>
        </>
    );
}

export {
    MintInvoiceButton,
    InvoiceDetailsCard,
    MyInvoicesList,
    UserInvoicesList,
    ContractEventListeners,
    SMBDashboard,
    AppLayout,
};

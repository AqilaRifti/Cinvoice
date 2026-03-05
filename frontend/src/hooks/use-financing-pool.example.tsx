/**
 * Example usage of FinancingPool hooks
 * 
 * This file demonstrates how to use the FinancingPool hooks in a React component.
 * It shows patterns for purchasing invoices, repaying invoices, and querying investment data.
 */

import { parseEther, formatEther } from 'viem';
import {
    usePurchaseInvoice,
    useRepayInvoice,
    usePurchasePrice,
    useInvestment,
    usePlatformFee,
    useFinancingPoolEvents
} from './use-financing-pool';
import { useInvoiceDetails } from './use-invoice-nft';
import { toast } from 'sonner';

// ============================================================================
// Example 1: Purchase Invoice Component
// ============================================================================

function PurchaseInvoiceExample({ tokenId, smb }: { tokenId: number; smb: `0x${string}` }) {
    const { invoice } = useInvoiceDetails(tokenId);
    const { purchasePrice, isLoading: priceLoading } = usePurchasePrice(tokenId, smb);
    const { mutateAsync: purchase, isPending } = usePurchaseInvoice();

    const handlePurchase = async () => {
        if (!purchasePrice) return;

        try {
            await purchase({
                tokenId,
                smb,
                purchasePrice,
            });
            toast.success('Invoice purchased successfully!');
        } catch (error) {
            toast.error('Failed to purchase invoice');
            console.error(error);
        }
    };

    if (priceLoading) {
        return <div>Loading purchase price...</div>;
    }

    const roi = invoice && purchasePrice
        ? ((Number(invoice.faceValue - purchasePrice) / Number(purchasePrice)) * 100).toFixed(2)
        : '0';

    return (
        <div className="space-y-4">
            <h2>Purchase Invoice #{tokenId}</h2>

            <div className="space-y-2">
                <p>Face Value: {invoice ? formatEther(invoice.faceValue) : '0'} CTC</p>
                <p>Purchase Price: {purchasePrice ? formatEther(purchasePrice) : '0'} CTC</p>
                <p>Expected ROI: {roi}%</p>
            </div>

            <button
                onClick={handlePurchase}
                disabled={isPending || !purchasePrice}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
                {isPending ? 'Purchasing...' : 'Invest Now'}
            </button>
        </div>
    );
}

// ============================================================================
// Example 2: Repay Invoice Component
// ============================================================================

function RepayInvoiceExample({ tokenId }: { tokenId: number }) {
    const { invoice, isLoading } = useInvoiceDetails(tokenId);
    const { mutateAsync: repay, isPending } = useRepayInvoice();

    const handleRepay = async () => {
        if (!invoice) return;

        try {
            await repay({
                tokenId,
                faceValue: invoice.faceValue,
            });
            toast.success('Invoice repaid successfully!');
        } catch (error) {
            toast.error('Failed to repay invoice');
            console.error(error);
        }
    };

    if (isLoading) {
        return <div>Loading invoice details...</div>;
    }

    if (!invoice) {
        return <div>Invoice not found</div>;
    }

    // Only show repay button if invoice is funded
    if (invoice.state !== 1) {
        return <div>Invoice is not in funded state</div>;
    }

    return (
        <div className="space-y-4">
            <h2>Repay Invoice #{tokenId}</h2>

            <div className="space-y-2">
                <p>Face Value: {formatEther(invoice.faceValue)} CTC</p>
                <p>Repayment Date: {new Date(invoice.repaymentDate * 1000).toLocaleDateString()}</p>
            </div>

            <button
                onClick={handleRepay}
                disabled={isPending}
                className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
                {isPending ? 'Repaying...' : 'Repay Now'}
            </button>
        </div>
    );
}

// ============================================================================
// Example 3: Investment Details Component
// ============================================================================

function InvestmentDetailsExample({ tokenId }: { tokenId: number }) {
    const { investment, isLoading } = useInvestment(tokenId);
    const { invoice } = useInvoiceDetails(tokenId);

    if (isLoading) {
        return <div>Loading investment details...</div>;
    }

    if (!investment) {
        return <div>No investment found for this invoice</div>;
    }

    const roi = invoice && investment
        ? ((Number(invoice.faceValue - investment.purchasePrice) / Number(investment.purchasePrice)) * 100).toFixed(2)
        : '0';

    const daysUntilRepayment = invoice
        ? Math.ceil((invoice.repaymentDate * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="space-y-4">
            <h2>Investment Details</h2>

            <div className="space-y-2">
                <p>Investor: {investment.investor}</p>
                <p>Purchase Price: {formatEther(investment.purchasePrice)} CTC</p>
                <p>Purchase Date: {new Date(investment.purchaseTimestamp * 1000).toLocaleDateString()}</p>
                {invoice && (
                    <>
                        <p>Expected Return: {formatEther(invoice.faceValue)} CTC</p>
                        <p>Expected ROI: {roi}%</p>
                        <p>Days Until Repayment: {daysUntilRepayment}</p>
                    </>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Example 4: Platform Fee Display Component
// ============================================================================

function PlatformFeeExample() {
    const { platformFee, isLoading } = usePlatformFee();

    if (isLoading) {
        return <div>Loading platform fee...</div>;
    }

    const feePercentage = platformFee ? (platformFee / 100).toFixed(2) : '0';

    return (
        <div className="space-y-2">
            <h3>Platform Fee</h3>
            <p>{feePercentage}% (applied to all invoice purchases)</p>
        </div>
    );
}

// ============================================================================
// Example 5: Complete Invoice Card with Purchase/Repay
// ============================================================================

function CompleteInvoiceCardExample({ tokenId, smb }: { tokenId: number; smb: `0x${string}` }) {
    const { invoice, isLoading: invoiceLoading } = useInvoiceDetails(tokenId);
    const { purchasePrice, isLoading: priceLoading } = usePurchasePrice(tokenId, smb);
    const { investment } = useInvestment(tokenId);
    const { platformFee } = usePlatformFee();

    const { mutateAsync: purchase, isPending: isPurchasing } = usePurchaseInvoice();
    const { mutateAsync: repay, isPending: isRepaying } = useRepayInvoice();

    const handlePurchase = async () => {
        if (!purchasePrice) return;

        try {
            await purchase({ tokenId, smb, purchasePrice });
            toast.success('Invoice purchased successfully!');
        } catch (error) {
            toast.error('Failed to purchase invoice');
        }
    };

    const handleRepay = async () => {
        if (!invoice) return;

        try {
            await repay({ tokenId, faceValue: invoice.faceValue });
            toast.success('Invoice repaid successfully!');
        } catch (error) {
            toast.error('Failed to repay invoice');
        }
    };

    if (invoiceLoading || priceLoading) {
        return <div>Loading...</div>;
    }

    if (!invoice) {
        return <div>Invoice not found</div>;
    }

    const roi = purchasePrice
        ? ((Number(invoice.faceValue - purchasePrice) / Number(purchasePrice)) * 100).toFixed(2)
        : '0';

    const states = ['Pending', 'Funded', 'Repaid', 'Defaulted'];
    const stateColors = ['blue', 'yellow', 'green', 'red'];

    return (
        <div className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">Invoice #{tokenId}</h2>
                <span className={`px-3 py-1 rounded text-sm bg-${stateColors[invoice.state]}-100 text-${stateColors[invoice.state]}-800`}>
                    {states[invoice.state]}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">Face Value:</span>
                    <span className="font-semibold">{formatEther(invoice.faceValue)} CTC</span>
                </div>

                {purchasePrice && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Purchase Price:</span>
                        <span className="font-semibold">{formatEther(purchasePrice)} CTC</span>
                    </div>
                )}

                <div className="flex justify-between">
                    <span className="text-gray-600">Expected ROI:</span>
                    <span className="font-semibold text-green-600">{roi}%</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee:</span>
                    <span className="font-semibold">{platformFee ? (platformFee / 100).toFixed(2) : '0'}%</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Repayment Date:</span>
                    <span className="font-semibold">
                        {new Date(invoice.repaymentDate * 1000).toLocaleDateString()}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Credit Score:</span>
                    <span className="font-semibold">{invoice.creditScoreAtMinting}</span>
                </div>
            </div>

            {investment && (
                <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold">Investment Details</h3>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Investor:</span>
                        <span className="font-mono">{investment.investor.slice(0, 6)}...{investment.investor.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Purchase Date:</span>
                        <span>{new Date(investment.purchaseTimestamp * 1000).toLocaleDateString()}</span>
                    </div>
                </div>
            )}

            <div className="pt-4">
                {invoice.state === 0 && (
                    <button
                        onClick={handlePurchase}
                        disabled={isPurchasing || !purchasePrice}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPurchasing ? 'Purchasing...' : 'Invest Now'}
                    </button>
                )}

                {invoice.state === 1 && (
                    <button
                        onClick={handleRepay}
                        disabled={isRepaying}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRepaying ? 'Repaying...' : 'Repay Now'}
                    </button>
                )}

                {invoice.state === 2 && (
                    <div className="text-center text-green-600 font-semibold">
                        ✓ Invoice Repaid
                    </div>
                )}

                {invoice.state === 3 && (
                    <div className="text-center text-red-600 font-semibold">
                        ✗ Invoice Defaulted
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Example 6: Event Listener Registration
// ============================================================================

/**
 * This component should be registered once at the app level to listen for
 * FinancingPool events and automatically update the UI.
 * 
 * Place this in your app layout or root provider component.
 */
function EventListenersExample() {
    // Register event listeners
    // - Listens for InvoicePurchased, InvoiceRepaid, InvoiceDefaulted events
    // - Invalidates relevant queries when events occur
    // - Shows toast notifications for user feedback
    useFinancingPoolEvents();

    // This component doesn't render anything
    return null;
}

// ============================================================================
// Export Examples
// ============================================================================

export {
    PurchaseInvoiceExample,
    RepayInvoiceExample,
    InvestmentDetailsExample,
    PlatformFeeExample,
    CompleteInvoiceCardExample,
    EventListenersExample,
};

'use client';

import { useState } from 'react';
import { InvoiceCard } from './invoice-card';
import { InvoiceDetailDialog } from './invoice-detail-dialog';
import { InvoiceCardSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Invoice } from '@/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { usePurchasePrice } from '@/hooks/use-financing-pool';

interface MarketplaceGridProps {
    invoices: Invoice[];
    isLoading?: boolean;
    pageSize?: number;
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
};

export function MarketplaceGrid({ invoices, isLoading, pageSize = 12 }: MarketplaceGridProps) {
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(invoices.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentInvoices = invoices.slice(startIndex, endIndex);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: pageSize }).map((_, i) => (
                    <InvoiceCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <EmptyState
                icon={ShoppingCart}
                title="No invoices available"
                description="There are currently no invoices in the marketplace. Check back soon!"
            />
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {currentInvoices.map((invoice) => (
                    <motion.div key={invoice.tokenId} variants={fadeInUp}>
                        <InvoiceCardWithPrice
                            invoice={invoice}
                            onClick={() => setSelectedInvoice(invoice)}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Invoice Detail Dialog */}
            {selectedInvoice && (
                <InvoiceDetailDialog
                    invoice={selectedInvoice}
                    open={!!selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    );
}

// Helper component to fetch purchase price for each invoice
function InvoiceCardWithPrice({ invoice, onClick }: { invoice: Invoice; onClick: () => void }) {
    const { purchasePrice } = usePurchasePrice(invoice.tokenId);

    return <InvoiceCard invoice={invoice} purchasePrice={purchasePrice} onClick={onClick} />;
}

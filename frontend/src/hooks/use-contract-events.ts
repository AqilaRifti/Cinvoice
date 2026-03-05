import { useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESSES, INVOICE_NFT_ABI, FINANCING_POOL_ABI } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useInvoiceEvents() {
    const queryClient = useQueryClient();

    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        eventName: 'InvoiceMinted',
        onLogs(logs) {
            logs.forEach((log) => {
                toast.success(`Invoice #${log.args.tokenId} minted!`);
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
            });
        },
    });

    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        eventName: 'InvoiceStateChanged',
        onLogs(logs) {
            logs.forEach((log) => {
                const states = ['Pending', 'Funded', 'Repaid', 'Defaulted'];
                const state = states[Number(log.args.newState)];
                toast.info(`Invoice #${log.args.tokenId} is now ${state}`);
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
            });
        },
    });

    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.FinancingPool,
        abi: FINANCING_POOL_ABI,
        eventName: 'InvoicePurchased',
        onLogs(logs) {
            logs.forEach((log) => {
                toast.success(`Invoice #${log.args.tokenId} purchased!`);
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
                queryClient.invalidateQueries({ queryKey: ['marketplace'] });
            });
        },
    });

    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.FinancingPool,
        abi: FINANCING_POOL_ABI,
        eventName: 'InvoiceRepaid',
        onLogs(logs) {
            logs.forEach((log) => {
                toast.success(`Invoice #${log.args.tokenId} repaid! Credit score increased.`);
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
                queryClient.invalidateQueries({ queryKey: ['creditScore'] });
            });
        },
    });

    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.FinancingPool,
        abi: FINANCING_POOL_ABI,
        eventName: 'InvoiceDefaulted',
        onLogs(logs) {
            logs.forEach((log) => {
                toast.error(`Invoice #${log.args.tokenId} defaulted. Credit score decreased.`);
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
                queryClient.invalidateQueries({ queryKey: ['creditScore'] });
            });
        },
    });
}

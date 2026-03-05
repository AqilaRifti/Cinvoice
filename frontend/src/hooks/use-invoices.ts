import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, INVOICE_NFT_ABI, InvoiceState } from '@/lib/contracts';
import { useState, useEffect } from 'react';

export interface Invoice {
    tokenId: number;
    faceValue: bigint;
    repaymentDate: number;
    smb: `0x${string}`;
    state: InvoiceState;
    metadataURI: string;
    creditScoreAtMinting: number;
}

export function useUserInvoices() {
    const { address } = useAccount();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Get user's invoice balance
    const { data: balance } = useReadContract({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Get total number of invoices minted
    const { data: nextTokenId } = useReadContract({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        functionName: 'nextTokenId',
    });

    useEffect(() => {
        async function fetchInvoices() {
            if (!address || !nextTokenId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const userInvoices: Invoice[] = [];

            // Check each token to see if user owns it
            const totalTokens = Number(nextTokenId);

            for (let i = 0; i < totalTokens; i++) {
                try {
                    // Check ownership using wagmi's readContract
                    const { readContract } = await import('wagmi/actions');
                    const { config } = await import('@/lib/wagmi');

                    const owner = await readContract(config, {
                        address: CONTRACT_ADDRESSES.InvoiceNFT,
                        abi: INVOICE_NFT_ABI,
                        functionName: 'ownerOf',
                        args: [BigInt(i)],
                    });

                    if (owner?.toLowerCase() === address.toLowerCase()) {
                        // Fetch invoice details
                        const details = await readContract(config, {
                            address: CONTRACT_ADDRESSES.InvoiceNFT,
                            abi: INVOICE_NFT_ABI,
                            functionName: 'getInvoiceDetails',
                            args: [BigInt(i)],
                        });

                        if (details) {
                            userInvoices.push({
                                tokenId: i,
                                faceValue: details.faceValue,
                                repaymentDate: Number(details.repaymentDate),
                                smb: details.smb,
                                state: details.state as InvoiceState,
                                metadataURI: details.metadataURI,
                                creditScoreAtMinting: Number(details.creditScoreAtMinting),
                            });
                        }
                    }
                } catch (error) {
                    // Token might not exist or be burned, skip it
                    console.debug(`Skipping token ${i}:`, error);
                }
            }

            setInvoices(userInvoices);
            setIsLoading(false);
        }

        fetchInvoices();
    }, [address, nextTokenId]);

    return {
        invoices,
        balance: balance ? Number(balance) : 0,
        isLoading,
    };
}

export function useMarketplaceInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Get total number of invoices
    const { data: nextTokenId } = useReadContract({
        address: CONTRACT_ADDRESSES.InvoiceNFT,
        abi: INVOICE_NFT_ABI,
        functionName: 'nextTokenId',
    });

    useEffect(() => {
        async function fetchMarketplace() {
            if (!nextTokenId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const pendingInvoices: Invoice[] = [];

            // Fetch all invoices and filter for Pending state
            const totalTokens = Number(nextTokenId);

            for (let i = 0; i < totalTokens; i++) {
                try {
                    const { readContract } = await import('wagmi/actions');
                    const { config } = await import('@/lib/wagmi');

                    // Fetch invoice details
                    const details = await readContract(config, {
                        address: CONTRACT_ADDRESSES.InvoiceNFT,
                        abi: INVOICE_NFT_ABI,
                        functionName: 'getInvoiceDetails',
                        args: [BigInt(i)],
                    });

                    // Only include Pending invoices in marketplace
                    if (details && details.state === InvoiceState.Pending) {
                        pendingInvoices.push({
                            tokenId: i,
                            faceValue: details.faceValue,
                            repaymentDate: Number(details.repaymentDate),
                            smb: details.smb,
                            state: details.state as InvoiceState,
                            metadataURI: details.metadataURI,
                            creditScoreAtMinting: Number(details.creditScoreAtMinting),
                        });
                    }
                } catch (error) {
                    // Token might not exist, skip it
                    console.debug(`Skipping token ${i}:`, error);
                }
            }

            setInvoices(pendingInvoices);
            setIsLoading(false);
        }

        fetchMarketplace();
    }, [nextTokenId]);

    return {
        invoices,
        isLoading,
    };
}

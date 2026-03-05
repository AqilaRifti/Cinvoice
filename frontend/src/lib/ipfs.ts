import { PinataSDK } from 'pinata-web3';

// Validate and clean the JWT token
const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT?.trim();

if (!pinataJwt) {
    console.warn('NEXT_PUBLIC_PINATA_JWT is not set. IPFS uploads will fail.');
}

const pinata = new PinataSDK({
    pinataJwt: pinataJwt,
    pinataGateway: 'gateway.pinata.cloud',
});

export interface InvoiceMetadata {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    amount: string;
    currency: string;
    issuer: string;
    recipient: string;
    description?: string;
    documentHash?: string;
}

export async function uploadFileToIPFS(file: File): Promise<string> {
    try {
        if (!pinataJwt) {
            throw new Error('Pinata JWT token is not configured. Please set NEXT_PUBLIC_PINATA_JWT in your .env file.');
        }

        const upload = await pinata.upload.file(file);
        return `ipfs://${upload.IpfsHash}`;
    } catch (error) {
        console.error('IPFS upload error:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to upload file to IPFS: ${error.message}`);
        }
        throw new Error('Failed to upload file to IPFS');
    }
}

export async function uploadMetadataToIPFS(metadata: InvoiceMetadata): Promise<string> {
    try {
        const upload = await pinata.upload.json(metadata);
        return `ipfs://${upload.IpfsHash}`;
    } catch (error) {
        console.error('IPFS metadata upload error:', error);
        throw new Error('Failed to upload metadata to IPFS');
    }
}

export async function fetchFromIPFS(cid: string): Promise<any> {
    try {
        const cleanCid = cid.replace('ipfs://', '');
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanCid}`);
        if (!response.ok) throw new Error('Failed to fetch from IPFS');
        return await response.json();
    } catch (error) {
        console.error('IPFS fetch error:', error);
        throw new Error('Failed to fetch from IPFS');
    }
}

export function getIPFSGatewayUrl(cid: string): string {
    const cleanCid = cid.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${cleanCid}`;
}

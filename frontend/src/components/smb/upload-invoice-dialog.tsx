'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { uploadFileToIPFS, uploadMetadataToIPFS, InvoiceMetadata } from '@/lib/ipfs';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { sanitizeInput, sanitizeObject } from '@/lib/errors';

interface UploadInvoiceDialogProps {
    onUploadComplete: (metadataURI: string) => void;
}

export function UploadInvoiceDialog({ onUploadComplete }: UploadInvoiceDialogProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [metadata, setMetadata] = useState<Partial<InvoiceMetadata>>({
        currency: 'CTC',
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            if (file.type !== 'application/pdf') {
                toast.error('Only PDF files are supported');
                return;
            }
            setFile(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,
    });

    const handleUpload = async () => {
        if (!file || !metadata.invoiceNumber || !metadata.issueDate || !metadata.dueDate || !metadata.amount) {
            toast.error('Please fill all required fields');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            setUploadProgress(30);
            const fileURI = await uploadFileToIPFS(file);

            setUploadProgress(60);
            const fullMetadata: InvoiceMetadata = {
                invoiceNumber: metadata.invoiceNumber!,
                issueDate: metadata.issueDate!,
                dueDate: metadata.dueDate!,
                amount: metadata.amount!,
                currency: metadata.currency || 'CTC',
                issuer: sanitizeInput(metadata.issuer || ''),
                recipient: sanitizeInput(metadata.recipient || ''),
                description: sanitizeInput(metadata.description || ''),
                documentHash: fileURI,
            };

            setUploadProgress(90);
            const metadataURI = await uploadMetadataToIPFS(fullMetadata);

            setUploadProgress(100);
            toast.success('Invoice uploaded to IPFS successfully!');
            onUploadComplete(metadataURI);
            setOpen(false);

            setFile(null);
            setMetadata({ currency: 'CTC' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload invoice');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Invoice Document
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Upload Invoice to IPFS</DialogTitle>
                    <DialogDescription>
                        Upload your invoice document and metadata to decentralized storage
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div
                        {...getRootProps()}
                        className={cn(
                            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                            file && 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        )}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex flex-col items-center gap-2">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <FileText className="h-12 w-12 text-muted-foreground" />
                                <p className="font-medium">
                                    {isDragActive ? 'Drop the file here' : 'Drag & drop invoice PDF'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    or click to select (max 10MB)
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                            <Input
                                id="invoiceNumber"
                                placeholder="INV-001"
                                value={metadata.invoiceNumber || ''}
                                onChange={(e) => setMetadata({ ...metadata, invoiceNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount *</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="1000"
                                value={metadata.amount || ''}
                                onChange={(e) => setMetadata({ ...metadata, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="issueDate">Issue Date *</Label>
                            <Input
                                id="issueDate"
                                type="date"
                                value={metadata.issueDate || ''}
                                onChange={(e) => setMetadata({ ...metadata, issueDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date *</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={metadata.dueDate || ''}
                                onChange={(e) => setMetadata({ ...metadata, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="Invoice description"
                            value={metadata.description || ''}
                            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                        />
                    </div>

                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Uploading to IPFS...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    )}

                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploading || !metadata.invoiceNumber || !metadata.amount}
                        className="w-full"
                        size="lg"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading to IPFS...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload to IPFS
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

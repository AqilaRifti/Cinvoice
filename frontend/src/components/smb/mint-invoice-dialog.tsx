'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { FileUp, Loader2, CheckCircle2, ArrowLeft, ArrowRight, FileText, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, INVOICE_NFT_ABI } from '@/lib/contracts';
import { parseEther, encodeFunctionData, formatEther } from 'viem';
import { toast } from 'sonner';
import { parseContractError, isUserRejection } from '@/lib/errors';
import { useCreditScore } from '@/hooks/use-credit-score';
import { uploadFileToIPFS, uploadMetadataToIPFS, InvoiceMetadata } from '@/lib/ipfs';
import { mintInvoiceSchema, MintInvoiceFormData } from '@/lib/validations';
import { TransactionDialog, TransactionStatus } from '@/components/shared/transaction-dialog';
import { TransactionConfirmationDialog } from '@/components/shared/transaction-confirmation-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

type Step = 1 | 2 | 3;

export function MintInvoiceDialog() {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [uploadingToIPFS, setUploadingToIPFS] = useState(false);
    const [ipfsProgress, setIpfsProgress] = useState(0);
    const [metadataURI, setMetadataURI] = useState('');
    const [txDialogOpen, setTxDialogOpen] = useState(false);
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
    const [showGasConfirmation, setShowGasConfirmation] = useState(false);
    const [mintParams, setMintParams] = useState<{ uri: string; faceValue: bigint; repaymentTimestamp: bigint } | null>(null);

    const { address } = useAccount();
    const { score, discountRate } = useCreditScore();
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

    const form = useForm<MintInvoiceFormData>({
        resolver: zodResolver(mintInvoiceSchema),
        defaultValues: {
            invoiceNumber: '',
            faceValue: '',
            description: '',
            customerName: '',
            customerAddress: '',
        },
    });

    // Handle PDF file drop
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
            setPdfFile(file);
            form.setValue('pdfFile', file);
            form.clearErrors('pdfFile');
        }
    }, [form]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,
        disabled: uploadingToIPFS,
    });

    // Calculate purchase price based on discount rate
    const calculatePurchasePrice = () => {
        const faceValue = form.watch('faceValue');
        if (!faceValue) return '0';
        const face = parseFloat(faceValue);
        const discount = discountRate / 10000; // Convert basis points to decimal
        const purchasePrice = face * (1 - discount);
        return purchasePrice.toFixed(4);
    };

    // Step navigation
    const goToNextStep = async () => {
        let isValid = false;

        if (currentStep === 1) {
            isValid = await form.trigger('pdfFile');
        } else if (currentStep === 2) {
            isValid = await form.trigger([
                'invoiceNumber',
                'faceValue',
                'repaymentDate',
                'description',
                'customerName',
            ]);
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(3, prev + 1) as Step);
        }
    };

    const goToPreviousStep = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
    };

    // Upload to IPFS and mint
    const handleMint = async (data: MintInvoiceFormData) => {
        if (!pdfFile) {
            toast.error('Please upload a PDF file');
            return;
        }

        try {
            // Upload to IPFS
            setUploadingToIPFS(true);
            setIpfsProgress(0);

            // Upload PDF file
            setIpfsProgress(30);
            const pdfURI = await uploadFileToIPFS(pdfFile);

            // Prepare metadata
            setIpfsProgress(60);
            const metadata: InvoiceMetadata = {
                invoiceNumber: data.invoiceNumber,
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: data.repaymentDate.toISOString().split('T')[0],
                amount: data.faceValue,
                currency: 'CTC',
                issuer: address || '',
                recipient: data.customerName,
                description: data.description,
                documentHash: pdfURI,
            };

            // Upload metadata
            setIpfsProgress(90);
            const uri = await uploadMetadataToIPFS(metadata);
            setMetadataURI(uri);
            setIpfsProgress(100);

            toast.success('Files uploaded to IPFS successfully!');
            setUploadingToIPFS(false);

            // Prepare mint parameters
            const repaymentTimestamp = Math.floor(data.repaymentDate.getTime() / 1000);
            setMintParams({
                uri,
                faceValue: parseEther(data.faceValue),
                repaymentTimestamp: BigInt(repaymentTimestamp),
            });

            // Show gas confirmation dialog
            setShowGasConfirmation(true);
        } catch (error: any) {
            setUploadingToIPFS(false);
            setIpfsProgress(0);
            if (!isUserRejection(error)) {
                const message = parseContractError(error);
                toast.error(message);
            }
        }
    };

    const handleConfirmMint = async () => {
        if (!mintParams) return;

        try {
            // Mint NFT
            setTxStatus('pending');
            setTxDialogOpen(true);
            setShowGasConfirmation(false);

            writeContract({
                address: CONTRACT_ADDRESSES.InvoiceNFT,
                abi: INVOICE_NFT_ABI,
                functionName: 'mintInvoice',
                args: [mintParams.uri, mintParams.faceValue, mintParams.repaymentTimestamp],
            });
        } catch (error: any) {
            if (!isUserRejection(error)) {
                const message = parseContractError(error);
                toast.error(message);
            }
        }
    };

    // Handle transaction status changes
    if (isSuccess && txStatus !== 'success') {
        setTxStatus('success');
        // Reset form and close after success
        setTimeout(() => {
            setOpen(false);
            setTxDialogOpen(false);
            resetForm();
        }, 2000);
    }

    if (writeError && txStatus !== 'error') {
        setTxStatus('error');
    }

    const resetForm = () => {
        form.reset();
        setPdfFile(null);
        setCurrentStep(1);
        setMetadataURI('');
        setIpfsProgress(0);
        setTxStatus('idle');
        setShowGasConfirmation(false);
        setMintParams(null);
    };

    const handleRetry = () => {
        setTxDialogOpen(false);
        setTxStatus('idle');
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                        <FileUp className="mr-2 h-5 w-5" />
                        Mint New Invoice
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Mint Invoice NFT</DialogTitle>
                        <DialogDescription>
                            Create a new invoice NFT to receive financing
                        </DialogDescription>
                    </DialogHeader>

                    {/* Progress Indicator */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center flex-1">
                                    <div
                                        className={cn(
                                            'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                                            currentStep >= step
                                                ? 'bg-primary border-primary text-primary-foreground'
                                                : 'border-muted-foreground text-muted-foreground'
                                        )}
                                    >
                                        {currentStep > step ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            <span className="text-sm font-medium">{step}</span>
                                        )}
                                    </div>
                                    {step < 3 && (
                                        <div
                                            className={cn(
                                                'flex-1 h-0.5 mx-2 transition-colors',
                                                currentStep > step ? 'bg-primary' : 'bg-muted'
                                            )}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Upload PDF</span>
                            <span>Invoice Details</span>
                            <span>Review & Confirm</span>
                        </div>
                    </div>

                    <form onSubmit={form.handleSubmit(handleMint)} className="space-y-6 py-4">
                        <AnimatePresence mode="wait">
                            {/* Step 1: PDF Upload */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label>Invoice PDF Document *</Label>
                                        <div
                                            {...getRootProps()}
                                            className={cn(
                                                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                                                isDragActive
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                                                pdfFile && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                                                uploadingToIPFS && 'pointer-events-none opacity-60'
                                            )}
                                        >
                                            <input {...getInputProps()} />
                                            {pdfFile ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                                    <p className="font-medium">{pdfFile.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPdfFile(null);
                                                            form.setValue('pdfFile', undefined as any);
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="h-12 w-12 text-muted-foreground" />
                                                    <p className="font-medium">
                                                        {isDragActive
                                                            ? 'Drop the PDF here'
                                                            : 'Drag & drop invoice PDF'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        or click to select (max 10MB)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {form.formState.errors.pdfFile && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.pdfFile.message}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Invoice Details */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                                            <Input
                                                id="invoiceNumber"
                                                placeholder="INV-001"
                                                {...form.register('invoiceNumber')}
                                            />
                                            {form.formState.errors.invoiceNumber && (
                                                <p className="text-sm text-destructive">
                                                    {form.formState.errors.invoiceNumber.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="faceValue">Face Value (CTC) *</Label>
                                            <Input
                                                id="faceValue"
                                                type="number"
                                                step="0.01"
                                                placeholder="1000"
                                                {...form.register('faceValue')}
                                            />
                                            {form.formState.errors.faceValue && (
                                                <p className="text-sm text-destructive">
                                                    {form.formState.errors.faceValue.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Repayment Date *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !form.watch('repaymentDate') && 'text-muted-foreground'
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {form.watch('repaymentDate')
                                                        ? format(form.watch('repaymentDate'), 'PPP')
                                                        : 'Pick a date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={form.watch('repaymentDate')}
                                                    onSelect={(date) => form.setValue('repaymentDate', date!)}
                                                    disabled={(date) => date < new Date()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {form.formState.errors.repaymentDate && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.repaymentDate.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customerName">Customer Name *</Label>
                                        <Input
                                            id="customerName"
                                            placeholder="Acme Corporation"
                                            {...form.register('customerName')}
                                        />
                                        {form.formState.errors.customerName && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.customerName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customerAddress">Customer Address (Optional)</Label>
                                        <Input
                                            id="customerAddress"
                                            placeholder="123 Main St, City, Country"
                                            {...form.register('customerAddress')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Brief description of the invoice..."
                                            rows={3}
                                            {...form.register('description')}
                                        />
                                        {form.formState.errors.description && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.description.message}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Review and Confirm */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="rounded-lg border p-4 space-y-3">
                                        <h4 className="font-semibold text-sm">Invoice Details</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Invoice Number</p>
                                                <p className="font-medium">{form.watch('invoiceNumber')}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Face Value</p>
                                                <p className="font-medium">{form.watch('faceValue')} CTC</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Customer</p>
                                                <p className="font-medium">{form.watch('customerName')}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Repayment Date</p>
                                                <p className="font-medium">
                                                    {form.watch('repaymentDate')
                                                        ? format(form.watch('repaymentDate'), 'PP')
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm">Description</p>
                                            <p className="text-sm">{form.watch('description')}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm">Document</p>
                                            <p className="text-sm font-medium">{pdfFile?.name}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                                        <h4 className="font-semibold text-sm">Financing Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Your Credit Score</p>
                                                <p className="font-bold text-lg">{score}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Discount Rate</p>
                                                <p className="font-bold text-lg">{(discountRate / 100).toFixed(2)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Face Value</p>
                                                <p className="font-bold text-lg">
                                                    {form.watch('faceValue') || '0'} CTC
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">You'll Receive</p>
                                                <p className="font-bold text-lg text-green-600">
                                                    {calculatePurchasePrice()} CTC
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {uploadingToIPFS && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Uploading to IPFS...</span>
                                                <span>{ipfsProgress}%</span>
                                            </div>
                                            <Progress value={ipfsProgress} />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3 pt-4">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={goToPreviousStep}
                                    disabled={uploadingToIPFS || isPending || isConfirming}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            )}

                            {currentStep < 3 ? (
                                <Button
                                    type="button"
                                    onClick={goToNextStep}
                                    className="flex-1"
                                    disabled={uploadingToIPFS}
                                >
                                    Next
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={uploadingToIPFS || isPending || isConfirming}
                                >
                                    {uploadingToIPFS ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading to IPFS...
                                        </>
                                    ) : isPending || isConfirming ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isPending ? 'Confirm in wallet...' : 'Minting...'}
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Mint Invoice NFT
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Transaction Status Dialog */}
            <TransactionDialog
                open={txDialogOpen}
                onOpenChange={setTxDialogOpen}
                status={txStatus}
                txHash={hash}
                receipt={receipt ? {
                    transactionHash: receipt.transactionHash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed,
                    effectiveGasPrice: receipt.effectiveGasPrice,
                    status: receipt.status === 'success' ? 'success' : 'reverted',
                } : undefined}
                error={writeError}
                onRetry={handleRetry}
                title="Minting Invoice NFT"
                pendingMessage="Minting your invoice NFT..."
                successMessage="Invoice NFT minted successfully!"
            />

            {/* Gas Confirmation Dialog */}
            {mintParams && (
                <TransactionConfirmationDialog
                    open={showGasConfirmation}
                    onOpenChange={setShowGasConfirmation}
                    onConfirm={handleConfirmMint}
                    title="Confirm Minting"
                    description="Review the transaction details and estimated gas costs"
                    isPending={isPending}
                    isConfirming={isConfirming}
                    error={writeError}
                    to={CONTRACT_ADDRESSES.InvoiceNFT}
                    data={encodeFunctionData({
                        abi: INVOICE_NFT_ABI,
                        functionName: 'mintInvoice',
                        args: [mintParams.uri, mintParams.faceValue, mintParams.repaymentTimestamp],
                    })}
                    value={0n}
                    transactionSummary={
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Invoice Number</span>
                                <span className="font-medium">{form.watch('invoiceNumber')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Face Value</span>
                                <span className="font-medium">{formatEther(mintParams.faceValue)} CTC</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">You'll Receive</span>
                                <span className="font-medium text-green-600">{calculatePurchasePrice()} CTC</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Repayment Date</span>
                                <span className="font-medium">
                                    {form.watch('repaymentDate') ? format(form.watch('repaymentDate'), 'PP') : 'N/A'}
                                </span>
                            </div>
                        </div>
                    }
                    warningMessage="Once minted, the invoice NFT will be available for investors to purchase."
                />
            )}
        </>
    );
}

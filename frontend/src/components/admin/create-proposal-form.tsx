'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateProposal } from '@/hooks/use-platform-governance';
import { toast } from 'sonner';
import { Loader2, Eye } from 'lucide-react';
import { isAddress } from 'viem';

// Proposal types from the contract
export enum ProposalType {
    Pause = 0,
    Unpause = 1,
    FeeAdjustment = 2,
    Whitelist = 3,
    Blacklist = 4,
    RemoveFromBlacklist = 5,
    TreasuryWithdraw = 6,
    DisputeResolution = 7,
}

const proposalSchema = z.object({
    proposalType: z.nativeEnum(ProposalType),
    target: z.string().refine((val) => !val || isAddress(val), {
        message: 'Invalid Ethereum address',
    }).optional(),
    value: z.string().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: 'Value must be a non-negative number',
    }).optional(),
    description: z.string().min(20, 'Description must be at least 20 characters'),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

const proposalTypeLabels: Record<ProposalType, string> = {
    [ProposalType.Pause]: 'Pause Platform',
    [ProposalType.Unpause]: 'Unpause Platform',
    [ProposalType.FeeAdjustment]: 'Adjust Platform Fee',
    [ProposalType.Whitelist]: 'Add to Whitelist',
    [ProposalType.Blacklist]: 'Add to Blacklist',
    [ProposalType.RemoveFromBlacklist]: 'Remove from Blacklist',
    [ProposalType.TreasuryWithdraw]: 'Treasury Withdrawal',
    [ProposalType.DisputeResolution]: 'Resolve Dispute',
};

const proposalTypeDescriptions: Record<ProposalType, string> = {
    [ProposalType.Pause]: 'Temporarily halt all platform operations',
    [ProposalType.Unpause]: 'Resume platform operations',
    [ProposalType.FeeAdjustment]: 'Modify the platform fee percentage',
    [ProposalType.Whitelist]: 'Add an address to the whitelist',
    [ProposalType.Blacklist]: 'Add an address to the blacklist',
    [ProposalType.RemoveFromBlacklist]: 'Remove an address from the blacklist',
    [ProposalType.TreasuryWithdraw]: 'Withdraw funds from the treasury',
    [ProposalType.DisputeResolution]: 'Resolve a dispute between parties',
};

export function CreateProposalForm() {
    const [showPreview, setShowPreview] = useState(false);
    const { mutateAsync: createProposal, isPending } = useCreateProposal();

    const form = useForm<ProposalFormData>({
        resolver: zodResolver(proposalSchema),
        defaultValues: {
            proposalType: ProposalType.Pause,
            target: '',
            value: '',
            description: '',
        },
    });

    const selectedType = form.watch('proposalType');

    // Determine which fields are required based on proposal type
    const requiresTarget = [
        ProposalType.Whitelist,
        ProposalType.Blacklist,
        ProposalType.RemoveFromBlacklist,
        ProposalType.TreasuryWithdraw,
    ].includes(selectedType);

    const requiresValue = [
        ProposalType.FeeAdjustment,
        ProposalType.TreasuryWithdraw,
    ].includes(selectedType);

    const onSubmit = async (data: ProposalFormData) => {
        try {
            await createProposal({
                proposalType: data.proposalType,
                target: (data.target as `0x${string}`) || '0x0000000000000000000000000000000000000000',
                data: '0x' as `0x${string}`,
                value: BigInt(data.value || '0'),
            });

            toast.success('Proposal created successfully');
            form.reset();
            setShowPreview(false);
        } catch (error) {
            toast.error('Failed to create proposal');
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            {!showPreview ? (
                <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="proposalType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Proposal Type</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select proposal type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(proposalTypeLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    {proposalTypeDescriptions[selectedType]}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {requiresTarget && (
                        <FormField
                            control={form.control}
                            name="target"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0x..." {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The Ethereum address this proposal targets
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {requiresValue && (
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {selectedType === ProposalType.FeeAdjustment
                                            ? 'Fee Percentage (basis points)'
                                            : 'Amount (CTC)'}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {selectedType === ProposalType.FeeAdjustment
                                            ? 'Enter fee in basis points (e.g., 250 = 2.5%)'
                                            : 'Amount to withdraw from treasury'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Provide a detailed description of this proposal..."
                                        className="min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Explain the rationale and expected impact of this proposal
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPreview(true)}
                            disabled={!form.formState.isValid}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Proposal
                        </Button>
                    </div>
                </Form>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Proposal Preview</CardTitle>
                        <CardDescription>Review your proposal before submission</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Type</p>
                            <p className="text-lg font-semibold">
                                {proposalTypeLabels[form.getValues('proposalType')]}
                            </p>
                        </div>

                        {requiresTarget && form.getValues('target') && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Target Address</p>
                                <p className="font-mono text-sm">{form.getValues('target')}</p>
                            </div>
                        )}

                        {requiresValue && form.getValues('value') && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Value</p>
                                <p className="text-lg font-semibold">{form.getValues('value')}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Description</p>
                            <p className="text-sm whitespace-pre-wrap">{form.getValues('description')}</p>
                        </div>

                        <Alert>
                            <AlertDescription>
                                This proposal will require approval from 2 out of 3 admins before execution.
                            </AlertDescription>
                        </Alert>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                                Edit
                            </Button>
                            <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Submit Proposal
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
            }
        </div >
    );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Shield, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { isAddress } from 'viem';
import { formatDistanceToNow } from 'date-fns';

// Mock data - in production, fetch from contract
const mockWhitelist = [
    {
        address: '0x1234567890123456789012345678901234567890',
        addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        addedBy: '0xabcd...efgh',
    },
    {
        address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        addedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        addedBy: '0x1234...5678',
    },
];

const mockBlacklist = [
    {
        address: '0x9876543210987654321098765432109876543210',
        addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        addedBy: '0x9876...5432',
        reason: 'Fraudulent activity detected',
    },
];

interface AddAddressDialogProps {
    type: 'whitelist' | 'blacklist';
    onAdd: (address: string, reason?: string) => Promise<void>;
}

function AddAddressDialog({ type, onAdd }: AddAddressDialogProps) {
    const [open, setOpen] = useState(false);
    const [address, setAddress] = useState('');
    const [reason, setReason] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const handleAdd = async () => {
        setError('');

        if (!address) {
            setError('Address is required');
            return;
        }

        if (!isAddress(address)) {
            setError('Invalid Ethereum address');
            return;
        }

        if (type === 'blacklist' && !reason) {
            setError('Reason is required for blacklist');
            return;
        }

        setIsAdding(true);
        try {
            await onAdd(address, reason);
            toast.success(`Address added to ${type} successfully`);
            setOpen(false);
            setAddress('');
            setReason('');
        } catch (error) {
            toast.error(`Failed to add address to ${type}`);
            console.error(error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add to {type === 'whitelist' ? 'Whitelist' : 'Blacklist'}</DialogTitle>
                    <DialogDescription>
                        {type === 'whitelist'
                            ? 'Add a trusted address to the whitelist'
                            : 'Add a suspicious address to the blacklist'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="address">Ethereum Address</Label>
                        <Input
                            id="address"
                            placeholder="0x..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    {type === 'blacklist' && (
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Input
                                id="reason"
                                placeholder="Explain why this address should be blacklisted"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    )}
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={isAdding}>
                        {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add to {type === 'whitelist' ? 'Whitelist' : 'Blacklist'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ListTableProps {
    type: 'whitelist' | 'blacklist';
    data: typeof mockWhitelist | typeof mockBlacklist;
    onRemove: (address: string) => Promise<void>;
}

function ListTable({ type, data, onRemove }: ListTableProps) {
    const [removingAddress, setRemovingAddress] = useState<string | null>(null);

    const handleRemove = async (address: string) => {
        setRemovingAddress(address);
        try {
            await onRemove(address);
            toast.success(`Address removed from ${type} successfully`);
        } catch (error) {
            toast.error(`Failed to remove address from ${type}`);
            console.error(error);
        } finally {
            setRemovingAddress(null);
        }
    };

    if (data.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Addresses</h3>
                <p className="text-sm text-muted-foreground">
                    No addresses have been added to the {type} yet.
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Address</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead>Added By</TableHead>
                        {type === 'blacklist' && <TableHead>Reason</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.address}>
                            <TableCell className="font-mono text-sm">
                                {item.address.slice(0, 6)}...{item.address.slice(-4)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDistanceToNow(item.addedAt, { addSuffix: true })}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                                {item.addedBy}
                            </TableCell>
                            {type === 'blacklist' && (
                                <TableCell className="text-sm">
                                    {'reason' in item ? item.reason : '-'}
                                </TableCell>
                            )}
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(item.address)}
                                    disabled={removingAddress === item.address}
                                >
                                    {removingAddress === item.address ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function WhitelistManagement() {
    const handleAddToWhitelist = async (address: string) => {
        // In production: create governance proposal to add to whitelist
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    const handleAddToBlacklist = async (address: string, reason?: string) => {
        // In production: create governance proposal to add to blacklist
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    const handleRemoveFromWhitelist = async (address: string) => {
        // In production: create governance proposal to remove from whitelist
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    const handleRemoveFromBlacklist = async (address: string) => {
        // In production: create governance proposal to remove from blacklist
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Access Control
                </CardTitle>
                <CardDescription>
                    Manage whitelisted and blacklisted addresses
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="whitelist" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="whitelist" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Whitelist ({mockWhitelist.length})
                        </TabsTrigger>
                        <TabsTrigger value="blacklist" className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            Blacklist ({mockBlacklist.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="whitelist" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                                Trusted addresses with special privileges
                            </p>
                            <AddAddressDialog type="whitelist" onAdd={handleAddToWhitelist} />
                        </div>
                        <ListTable
                            type="whitelist"
                            data={mockWhitelist}
                            onRemove={handleRemoveFromWhitelist}
                        />
                    </TabsContent>

                    <TabsContent value="blacklist" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                                Blocked addresses with restricted access
                            </p>
                            <AddAddressDialog type="blacklist" onAdd={handleAddToBlacklist} />
                        </div>
                        <ListTable
                            type="blacklist"
                            data={mockBlacklist}
                            onRemove={handleRemoveFromBlacklist}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

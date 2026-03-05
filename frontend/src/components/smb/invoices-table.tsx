'use client';

import { useMemo, useState } from 'react';
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceState } from '@/lib/contracts';
import { InvoiceStateBadge } from '@/components/badges';
import { ExternalLink, DollarSign, ArrowUpDown, Search, Filter, FileText, X } from 'lucide-react';
import { formatEther } from 'viem';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';

interface Invoice {
    tokenId: number;
    faceValue: bigint;
    repaymentDate: number;
    smb: `0x${string}`;
    state: InvoiceState;
    metadataURI: string;
    creditScoreAtMinting: number;
}

interface InvoicesTableProps {
    invoices: Invoice[];
    isLoading: boolean;
    onRepay?: (tokenId: number, amount: bigint) => void;
    onViewDetails?: (tokenId: number) => void;
}

export function InvoicesTable({ invoices, isLoading, onRepay, onViewDetails }: InvoicesTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [stateFilter, setStateFilter] = useState<string>('all');

    const getDaysUntilRepayment = (timestamp: number) => {
        const now = Math.floor(Date.now() / 1000);
        const diff = timestamp - now;

        if (diff < 0) return 'Overdue';

        const days = Math.floor(diff / 86400);
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `${days} days`;
    };

    const columns: ColumnDef<Invoice>[] = useMemo(
        () => [
            {
                accessorKey: 'tokenId',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                            className="hover:bg-transparent"
                        >
                            Token ID
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }) => (
                    <div className="font-mono font-medium">#{row.getValue('tokenId')}</div>
                ),
            },
            {
                accessorKey: 'faceValue',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                            className="hover:bg-transparent"
                        >
                            Face Value
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    const value = row.getValue('faceValue') as bigint;
                    return <div className="font-bold">{formatEther(value)} CTC</div>;
                },
                sortingFn: (rowA, rowB) => {
                    const a = Number(rowA.getValue('faceValue') as bigint);
                    const b = Number(rowB.getValue('faceValue') as bigint);
                    return a - b;
                },
            },
            {
                accessorKey: 'state',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                            className="hover:bg-transparent"
                        >
                            Status
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }) => <InvoiceStateBadge state={row.getValue('state')} />,
                filterFn: (row, id, value) => {
                    return value.includes(row.getValue(id));
                },
            },
            {
                accessorKey: 'repaymentDate',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                            className="hover:bg-transparent"
                        >
                            Repayment Date
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    const timestamp = row.getValue('repaymentDate') as number;
                    return (
                        <div className="space-y-1">
                            <p className="text-sm font-medium">{getDaysUntilRepayment(timestamp)}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(timestamp * 1000).toLocaleDateString()}
                            </p>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'creditScoreAtMinting',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                            className="hover:bg-transparent"
                        >
                            Credit Score
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    const score = row.getValue('creditScoreAtMinting') as number;
                    return <div className="font-medium">{score}</div>;
                },
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => {
                    const invoice = row.original;
                    return (
                        <div className="flex justify-end gap-2">
                            {invoice.state === InvoiceState.Funded && onRepay && (
                                <Button
                                    size="sm"
                                    onClick={() => onRepay(invoice.tokenId, invoice.faceValue)}
                                >
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    Repay
                                </Button>
                            )}
                            {onViewDetails && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onViewDetails(invoice.tokenId)}
                                >
                                    View Details
                                </Button>
                            )}
                            {invoice.metadataURI && invoice.metadataURI !== 'ipfs://placeholder' && (
                                <Button size="sm" variant="outline" asChild>
                                    <a
                                        href={invoice.metadataURI.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [onRepay, onViewDetails]
    );

    // Filter invoices by state
    const filteredInvoices = useMemo(() => {
        if (stateFilter === 'all') return invoices;
        return invoices.filter((inv) => {
            const stateValue = InvoiceState[inv.state].toLowerCase();
            return stateValue === stateFilter;
        });
    }, [invoices, stateFilter]);

    const table = useReactTable({
        data: filteredInvoices,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    // Count invoices by state
    const stateCounts = useMemo(() => {
        return {
            all: invoices.length,
            pending: invoices.filter((inv) => inv.state === InvoiceState.Pending).length,
            funded: invoices.filter((inv) => inv.state === InvoiceState.Funded).length,
            repaid: invoices.filter((inv) => inv.state === InvoiceState.Repaid).length,
            defaulted: invoices.filter((inv) => inv.state === InvoiceState.Defaulted).length,
        };
    }, [invoices]);

    const clearFilters = () => {
        setGlobalFilter('');
        setStateFilter('all');
        table.resetColumnFilters();
    };

    const hasActiveFilters = globalFilter !== '' || stateFilter !== 'all';

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Invoices</CardTitle>
                    <CardDescription>All your minted invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 w-[180px]" />
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (invoices.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Invoices</CardTitle>
                    <CardDescription>All your minted invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={FileText}
                        title="No invoices yet"
                        description="Create your first invoice to get started with invoice financing."
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card>
                <CardHeader>
                    <CardTitle>Your Invoices</CardTitle>
                    <CardDescription>
                        {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search invoices..."
                                value={globalFilter ?? ''}
                                onChange={(event) => setGlobalFilter(event.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={stateFilter} onValueChange={setStateFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All ({stateCounts.all})</SelectItem>
                                <SelectItem value="pending">Pending ({stateCounts.pending})</SelectItem>
                                <SelectItem value="funded">Funded ({stateCounts.funded})</SelectItem>
                                <SelectItem value="repaid">Repaid ({stateCounts.repaid})</SelectItem>
                                <SelectItem value="defaulted">Defaulted ({stateCounts.defaulted})</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active Filters */}
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground">Active filters:</span>
                            {globalFilter && (
                                <Badge variant="secondary" className="gap-1">
                                    Search: {globalFilter}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => setGlobalFilter('')}
                                    />
                                </Badge>
                            )}
                            {stateFilter !== 'all' && (
                                <Badge variant="secondary" className="gap-1">
                                    Status: {stateFilter}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => setStateFilter('all')}
                                    />
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-7 px-2 text-xs"
                            >
                                Clear all
                            </Button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            <EmptyState
                                                icon={Search}
                                                title="No results found"
                                                description="Try adjusting your search or filters."
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                            {Math.min(
                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                table.getFilteredRowModel().rows.length
                            )}{' '}
                            of {table.getFilteredRowModel().rows.length} results
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <div className="text-sm">
                                Page {table.getState().pagination.pageIndex + 1} of{' '}
                                {table.getPageCount()}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

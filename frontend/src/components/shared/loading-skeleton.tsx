import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Loading skeleton for card components
 * Used during data fetching for invoice cards, metric cards, etc.
 */
export function CardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className='space-y-2'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
            </CardHeader>
            <CardContent className='space-y-3'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
                <div className='flex justify-between pt-2'>
                    <Skeleton className='h-8 w-20' />
                    <Skeleton className='h-8 w-20' />
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Loading skeleton for invoice card in marketplace
 */
export function InvoiceCardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className='space-y-3'>
                <div className='flex items-start justify-between'>
                    <Skeleton className='h-6 w-24' />
                    <Skeleton className='h-5 w-16 rounded-full' />
                </div>
                <Skeleton className='h-8 w-32' />
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='space-y-2'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-6 w-28' />
                </div>
                <div className='space-y-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-32' />
                </div>
                <div className='flex items-center justify-between pt-2'>
                    <Skeleton className='h-5 w-20' />
                    <Skeleton className='h-9 w-24' />
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Loading skeleton for metric/stats cards
 */
export function MetricCardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-4 rounded' />
            </CardHeader>
            <CardContent className='space-y-1'>
                <Skeleton className='h-8 w-28' />
                <Skeleton className='h-3 w-32' />
            </CardContent>
        </Card>
    );
}

/**
 * Loading skeleton for table rows
 */
export function TableSkeleton({
    rows = 5,
    columns = 5,
    className
}: {
    rows?: number;
    columns?: number;
    className?: string;
}) {
    return (
        <div className={cn('w-full space-y-3', className)}>
            {/* Table header */}
            <div className='flex gap-4 border-b pb-3'>
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={`header-${i}`} className='h-4 flex-1' />
                ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className='flex gap-4 py-3'>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={`cell-${rowIndex}-${colIndex}`} className='h-4 flex-1' />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Loading skeleton for chart components
 */
export function ChartSkeleton({
    height = 300,
    className
}: {
    height?: number;
    className?: string;
}) {
    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className='space-y-2'>
                <div className='flex items-center justify-between'>
                    <Skeleton className='h-5 w-32' />
                    <Skeleton className='h-8 w-40' />
                </div>
            </CardHeader>
            <CardContent>
                <div className='space-y-3'>
                    {/* Chart area */}
                    <Skeleton className='w-full' style={{ height: `${height}px` }} />
                    {/* Legend */}
                    <div className='flex justify-center gap-4'>
                        <Skeleton className='h-4 w-20' />
                        <Skeleton className='h-4 w-20' />
                        <Skeleton className='h-4 w-20' />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Loading skeleton for dashboard page
 */
export function DashboardSkeleton() {
    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='space-y-2'>
                <Skeleton className='h-8 w-48' />
                <Skeleton className='h-4 w-64' />
            </div>

            {/* Metric cards grid */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
            </div>

            {/* Main content area */}
            <div className='grid gap-6 lg:grid-cols-7'>
                <div className='lg:col-span-4'>
                    <ChartSkeleton />
                </div>
                <div className='lg:col-span-3'>
                    <Card>
                        <CardHeader>
                            <Skeleton className='h-5 w-32' />
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/**
 * Loading skeleton for marketplace grid
 */
export function MarketplaceGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: count }).map((_, i) => (
                <InvoiceCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Inline loading spinner for buttons and small areas
 */
export function Spinner({
    size = 'default',
    className
}: {
    size?: 'sm' | 'default' | 'lg';
    className?: string;
}) {
    const sizeClasses = {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-6 w-6'
    };

    return (
        <svg
            className={cn('animate-spin', sizeClasses[size], className)}
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            aria-label='Loading'
        >
            <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
            />
            <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
        </svg>
    );
}

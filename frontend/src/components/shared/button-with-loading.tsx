import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Spinner } from './loading-skeleton';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';

export interface ButtonWithLoadingProps
    extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
    /**
     * Whether the button is in a loading state
     */
    loading?: boolean;
    /**
     * Loading text to display (optional)
     */
    loadingText?: string;
    /**
     * Whether to render as a child component
     */
    asChild?: boolean;
}

/**
 * Button component with built-in loading state
 * Displays a spinner and optional loading text when loading is true
 */
export function ButtonWithLoading({
    children,
    loading = false,
    loadingText,
    disabled,
    className,
    variant,
    size,
    asChild = false,
    ...props
}: ButtonWithLoadingProps) {
    return (
        <Button
            disabled={disabled || loading}
            variant={variant}
            size={size}
            asChild={asChild}
            className={cn(className)}
            {...props}
        >
            {loading ? (
                <>
                    <Spinner size={size === 'sm' ? 'sm' : 'default'} />
                    {loadingText || children}
                </>
            ) : (
                children
            )}
        </Button>
    );
}

/**
 * Icon button with loading state
 * Useful for action buttons that only show an icon
 */
export function IconButtonWithLoading({
    icon: Icon,
    loading = false,
    disabled,
    className,
    variant,
    size = 'icon',
    ...props
}: Omit<ButtonWithLoadingProps, 'children'> & {
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <Button
            disabled={disabled || loading}
            variant={variant}
            size={size}
            className={cn(className)}
            {...props}
        >
            {loading ? <Spinner size='sm' /> : <Icon className='h-4 w-4' />}
        </Button>
    );
}

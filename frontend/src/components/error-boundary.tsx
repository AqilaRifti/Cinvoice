'use client';

import { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

// ============================================================================
// Error Boundary Component
// ============================================================================

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error boundary caught:', error, errorInfo);

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Log to error tracking service (e.g., Sentry) in production
        if (process.env.NODE_ENV === 'production') {
            // TODO: Add error tracking service integration
            // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="flex items-center justify-center min-h-screen p-4">
                    <Alert variant="destructive" className="max-w-lg">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Something went wrong</AlertTitle>
                        <AlertDescription className="mt-2">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </AlertDescription>
                        <div className="mt-4 flex gap-2">
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                size="sm"
                            >
                                Try again
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="default"
                                size="sm"
                            >
                                Go to home
                            </Button>
                        </div>
                    </Alert>
                </div>
            );
        }

        return this.props.children;
    }
}

// ============================================================================
// Error Fallback Component
// ============================================================================

interface ErrorFallbackProps {
    error: Error;
    resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
            <Alert variant="destructive" className="max-w-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="mt-2">
                    {error.message}
                </AlertDescription>
                <Button
                    onClick={resetError}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                >
                    Try again
                </Button>
            </Alert>
        </div>
    );
}

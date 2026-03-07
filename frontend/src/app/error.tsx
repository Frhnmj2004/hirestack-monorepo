'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Next.js Page ErrorBoundary caught an error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="rounded-full bg-red-500/10 p-4 mb-4">
                <RefreshCcw className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                We encountered an unexpected error while trying to load this section of the application.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    Try again
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Refresh Page
                </Button>
            </div>
        </div>
    );
}

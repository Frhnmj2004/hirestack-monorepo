'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body>
                <div className="flex h-screen w-full flex-col items-center justify-center bg-brand-midnight text-white">
                    <div className="flex max-w-md flex-col items-center text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
                            <AlertTriangle className="h-10 w-10 text-red-500" />
                        </div>
                        <h1 className="mb-2 text-3xl font-bold tracking-tight">Critical Application Error</h1>
                        <p className="mb-8 text-brand-light-textSecondary">
                            A severe error occurred that prevented the application from rendering. Our team has been notified.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="mb-8 w-full rounded-md bg-black/50 p-4 text-left text-sm text-red-400 overflow-auto max-h-48 border border-red-500/20">
                                <p className="font-mono">{error.message}</p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button
                                onClick={() => reset()}
                                className="bg-brand-violet hover:bg-brand-lavender text-white"
                                size="lg"
                            >
                                Try to recover
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                                size="lg"
                            >
                                Go to Home
                            </Button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}

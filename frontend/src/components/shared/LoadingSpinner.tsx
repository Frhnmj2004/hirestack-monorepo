import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className, size = 24 }: { className?: string; size?: number }) {
    return (
        <Loader2
            className={cn("animate-spin text-brand-lavender", className)}
            size={size}
        />
    );
}

export function PageLoader() {
    return (
        <div className="flex-1 w-full h-full min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size={40} />
                <p className="text-sm font-medium text-white/50 animate-pulse">Loading data...</p>
            </div>
        </div>
    );
}

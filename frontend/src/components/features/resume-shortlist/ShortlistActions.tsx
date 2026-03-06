'use client';

import { Button } from '@/components/ui/button';
import { Check, X, ArrowRightCircle } from 'lucide-react';

interface ShortlistActionsProps {
    onApprove: () => void;
    onReject: () => void;
    onAdvance: () => void;
}

export function ShortlistActions({ onApprove, onReject, onAdvance }: ShortlistActionsProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={onReject}
                className="h-8 w-8 p-0 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                title="Reject"
            >
                <X className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={onApprove}
                className="h-8 w-8 p-0 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full"
                title="Approve for Screen"
            >
                <Check className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={onAdvance}
                className="h-8 w-8 p-0 text-white/40 hover:text-brand-lavender hover:bg-brand-violet/20 rounded-full"
                title="Advance to Final"
            >
                <ArrowRightCircle className="w-4 h-4" />
            </Button>
        </div>
    );
}

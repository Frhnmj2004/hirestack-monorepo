import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center text-center p-12 w-full h-full min-h-[400px] glass-card", className)}>
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white/40 shadow-glow-sm">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-white/50 max-w-sm mx-auto mb-8">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button onClick={onAction} className="bg-brand-violet hover:bg-brand-violet/80 text-white shadow-glow-sm">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

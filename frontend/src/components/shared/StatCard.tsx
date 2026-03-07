import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
    return (
        <div className={cn("glass-card p-6 flex flex-col gap-4", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-brand-light-textSecondary dark:text-white/60">{title}</h3>
                <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-brand-violet dark:text-brand-lavender">
                    {icon}
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-brand-light-textPrimary dark:text-white tracking-tight">{value}</div>

                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    )}>
                        {trend.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
        </div>
    );
}

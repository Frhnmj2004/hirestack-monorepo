'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    subtitle?: string;
    variant?: 'violet' | 'rose' | 'sky' | 'emerald' | 'amber';
    className?: string;
}

const variantConfig = {
    violet: {
        gradient: 'linear-gradient(135deg, rgba(90,70,218,0.12) 0%, rgba(155,140,255,0.06) 100%)',
        border: 'rgba(90, 70, 218, 0.2)',
        thickBorder: 'rgba(90, 70, 218, 0.18)',
        iconBg: 'rgba(90, 70, 218, 0.12)',
        iconColor: '#5A46DA',
        shadow: '0 4px 20px rgba(90, 70, 218, 0.1)',
        accent: '#5A46DA',
    },
    rose: {
        gradient: 'linear-gradient(135deg, rgba(244,63,94,0.10) 0%, rgba(251,113,133,0.06) 100%)',
        border: 'rgba(244, 63, 94, 0.18)',
        thickBorder: 'rgba(244, 63, 94, 0.18)',
        iconBg: 'rgba(244, 63, 94, 0.1)',
        iconColor: '#f43f5e',
        shadow: '0 4px 20px rgba(244, 63, 94, 0.1)',
        accent: '#f43f5e',
    },
    sky: {
        gradient: 'linear-gradient(135deg, rgba(14,165,233,0.10) 0%, rgba(56,189,248,0.06) 100%)',
        border: 'rgba(14, 165, 233, 0.18)',
        thickBorder: 'rgba(14, 165, 233, 0.18)',
        iconBg: 'rgba(14, 165, 233, 0.1)',
        iconColor: '#0ea5e9',
        shadow: '0 4px 20px rgba(14, 165, 233, 0.1)',
        accent: '#0ea5e9',
    },
    emerald: {
        gradient: 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(52,211,153,0.06) 100%)',
        border: 'rgba(16, 185, 129, 0.18)',
        thickBorder: 'rgba(16, 185, 129, 0.18)',
        iconBg: 'rgba(16, 185, 129, 0.1)',
        iconColor: '#10b981',
        shadow: '0 4px 20px rgba(16, 185, 129, 0.1)',
        accent: '#10b981',
    },
    amber: {
        gradient: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(251,191,36,0.06) 100%)',
        border: 'rgba(245, 158, 11, 0.18)',
        thickBorder: 'rgba(245, 158, 11, 0.18)',
        iconBg: 'rgba(245, 158, 11, 0.1)',
        iconColor: '#f59e0b',
        shadow: '0 4px 20px rgba(245, 158, 11, 0.1)',
        accent: '#f59e0b',
    },
};

export function StatCard({ title, value, icon, trend, subtitle, variant = 'violet', className }: StatCardProps) {
    const v = variantConfig[variant];

    return (
        <div
            className={cn(
                "relative p-5 rounded-2xl flex flex-col gap-4 group transition-all duration-300 cursor-default overflow-hidden",
                className
            )}
            style={{
                background: v.gradient,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `10px solid ${v.thickBorder}`,
                backgroundClip: 'padding-box',
                boxShadow: v.shadow,
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = v.shadow.replace('0.1)', '0.18)');
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = v.shadow;
            }}
        >
            {/* Background decoration blob */}
            <div
                className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110"
                style={{ background: `radial-gradient(circle, ${v.iconColor}, transparent 70%)` }}
            />

            {/* Icon + Title */}
            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-light-textSecondary/80 mb-0.5">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="text-[10px] text-brand-light-textSecondary/60">{subtitle}</p>
                    )}
                </div>
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: v.iconBg, color: v.iconColor }}
                >
                    {icon}
                </div>
            </div>

            {/* Value + Trend */}
            <div className="flex items-end justify-between relative z-10">
                <div
                    className="text-[2rem] font-bold leading-none tracking-tight"
                    style={{ color: '#1A1A2E' }}
                >
                    {value}
                </div>

                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                        trend.isPositive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                    )}>
                        {trend.isPositive
                            ? <ArrowUpRight className="w-3 h-3" />
                            : <ArrowDownRight className="w-3 h-3" />
                        }
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>

            {/* Bottom trend label */}
            {trend?.label && (
                <p className="text-[10px] text-brand-light-textSecondary/70 flex items-center gap-1 relative z-10 -mt-2">
                    <TrendingUp className="w-3 h-3" />
                    {trend.label}
                </p>
            )}
        </div>
    );
}

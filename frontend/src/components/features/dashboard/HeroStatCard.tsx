'use client';

import { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface HeroStatCardProps {
    label: string;
    value: string;
    sub?: string;
    trend?: { value: number; isPositive: boolean };
    dark?: boolean;         // violet bg variant
    children?: ReactNode;   // optional sparkline / icon slot
}

export function HeroStatCard({ label, value, sub, trend, dark = false, children }: HeroStatCardProps) {
    if (dark) {
        return (
            <div
                className="relative rounded-2xl p-6 flex flex-col justify-between overflow-hidden h-full"
                style={{
                    background: 'linear-gradient(135deg, #5A46DA 0%, #7B6CFF 60%, #9B8CFF 100%)',
                    boxShadow: '0 12px 40px rgba(90,70,218,0.35)',
                    border: '10px solid rgba(155, 140, 255, 0.45)',
                    backgroundClip: 'padding-box',
                }}
            >
                {/* background orb */}
                <div
                    className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #fff, transparent 70%)' }}
                />
                <div className="relative z-10">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">{label}</p>
                    {children && <div className="mt-3">{children}</div>}
                </div>
                <div className="relative z-10">
                    <p className="text-4xl font-bold text-white tracking-tight leading-none mt-4">{value}</p>
                    {sub && <p className="text-sm text-white/60 mt-1">{sub}</p>}
                    {trend && (
                        <div className="flex items-center gap-1 mt-3">
                            <span
                                className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                    background: trend.isPositive ? 'rgba(52,211,153,0.2)' : 'rgba(244,63,94,0.2)',
                                    color: trend.isPositive ? '#6ee7b7' : '#fca5a5',
                                    border: `1px solid ${trend.isPositive ? 'rgba(52,211,153,0.3)' : 'rgba(244,63,94,0.3)'}`,
                                }}
                            >
                                {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {trend.value}%
                            </span>
                            <span className="text-xs text-white/50 ml-1">vs last month</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative rounded-2xl p-6 flex flex-col justify-between overflow-hidden h-full"
            style={{
                background: 'rgba(255,255,255,0.70)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '10px solid rgba(255,255,255,0.45)',
                backgroundClip: 'padding-box',
                boxShadow: '0 8px 32px rgba(90,70,218,0.07)',
            }}
        >
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-brand-light-textSecondary/80">{label}</p>
                {children && <div className="mt-3">{children}</div>}
            </div>
            <div>
                <p className="text-4xl font-bold text-brand-light-textPrimary tracking-tight leading-none mt-4">{value}</p>
                {sub && <p className="text-sm text-brand-light-textSecondary mt-1">{sub}</p>}
                {trend && (
                    <div className="flex items-center gap-1 mt-3">
                        <span
                            className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                                background: trend.isPositive ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
                                color: trend.isPositive ? '#10b981' : '#f43f5e',
                                border: `1px solid ${trend.isPositive ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                            }}
                        >
                            {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {trend.value}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

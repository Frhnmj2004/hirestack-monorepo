'use client';

import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

const insights = [
    {
        id: 1,
        icon: TrendingUp,
        iconBg: 'rgba(16, 185, 129, 0.1)',
        iconColor: '#10b981',
        title: 'Resume quality improving',
        desc: 'AI match scores are up 8% this week across all active roles.',
        action: 'View Report',
        severity: 'positive',
    },
    {
        id: 2,
        icon: AlertTriangle,
        iconBg: 'rgba(245, 158, 11, 0.1)',
        iconColor: '#f59e0b',
        title: 'Low applicant volume',
        desc: 'DevOps Engineer role has only 12 applicants — consider broadening criteria.',
        action: 'View Role',
        severity: 'warning',
    },
    {
        id: 3,
        icon: CheckCircle,
        iconBg: 'rgba(90, 70, 218, 0.1)',
        iconColor: '#5A46DA',
        title: 'Top candidate ready',
        desc: 'Jordan Kim scored 94% in AI screening for Frontend Engineer.',
        action: 'View Profile',
        severity: 'info',
    },
];

export function AIInsightsWidget() {
    return (
        <div
            className="p-6 rounded-2xl flex flex-col h-full"
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #5A46DA, #9B8CFF)',
                            boxShadow: '0 4px 12px rgba(90, 70, 218, 0.35)',
                        }}
                    >
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-brand-light-textPrimary leading-tight">AI Insights</h3>
                        <p className="text-[10px] text-brand-light-textSecondary">Powered by HireLens AI</p>
                    </div>
                </div>
                <span
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full animate-pulse"
                    style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}
                >
                    ● Live
                </span>
            </div>

            {/* Insight cards */}
            <div className="flex flex-col gap-3 flex-1">
                {insights.map((insight) => {
                    const Icon = insight.icon;
                    return (
                        <div
                            key={insight.id}
                            className="group flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer"
                            style={{
                                border: '1px solid rgba(230, 230, 240, 0.7)',
                                background: 'rgba(255, 255, 255, 0.5)',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 255, 255, 0.85)';
                                (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(90, 70, 218, 0.15)';
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(90, 70, 218, 0.08)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 255, 255, 0.5)';
                                (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(230, 230, 240, 0.7)';
                                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                            }}
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: insight.iconBg }}
                            >
                                <Icon className="w-3.5 h-3.5" style={{ color: insight.iconColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-brand-light-textPrimary leading-tight">{insight.title}</p>
                                <p className="text-[11px] text-brand-light-textSecondary mt-0.5 leading-relaxed">{insight.desc}</p>
                                <button
                                    className="mt-1.5 flex items-center gap-1 text-[11px] font-medium transition-colors"
                                    style={{ color: '#5A46DA' }}
                                >
                                    {insight.action}
                                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

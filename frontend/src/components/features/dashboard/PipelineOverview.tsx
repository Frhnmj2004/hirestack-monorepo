'use client';

export function PipelineOverview() {
    const funnel = [
        {
            stage: 'Sourced',
            sublabel: 'Resumes uploaded',
            count: 8405,
            percentage: 100,
            gradient: 'linear-gradient(90deg, #5A46DA, #7B6CFF)',
            lightBg: 'rgba(90, 70, 218, 0.08)',
            pill: '#5A46DA',
        },
        {
            stage: 'AI Shortlisted',
            sublabel: 'Passed resume screen',
            count: 1248,
            percentage: 14.8,
            gradient: 'linear-gradient(90deg, #7B6CFF, #9B8CFF)',
            lightBg: 'rgba(123, 108, 255, 0.08)',
            pill: '#7B6CFF',
        },
        {
            stage: 'AI Screened',
            sublabel: 'Completed AI interview',
            count: 386,
            percentage: 4.6,
            gradient: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
            lightBg: 'rgba(14, 165, 233, 0.08)',
            pill: '#0ea5e9',
        },
        {
            stage: 'Human Interview',
            sublabel: 'Invited to panel',
            count: 94,
            percentage: 1.1,
            gradient: 'linear-gradient(90deg, #10b981, #34d399)',
            lightBg: 'rgba(16, 185, 129, 0.08)',
            pill: '#10b981',
        },
        {
            stage: 'Offers Extended',
            sublabel: 'Hire offers sent',
            count: 12,
            percentage: 0.14,
            gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            lightBg: 'rgba(245, 158, 11, 0.08)',
            pill: '#f59e0b',
        },
    ];

    return (
        <div
            className="p-6 rounded-2xl flex flex-col min-h-[420px]"
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-semibold text-base text-brand-light-textPrimary">
                        Hiring Funnel
                    </h3>
                    <p className="text-xs text-brand-light-textSecondary mt-0.5">Pipeline conversion · Last 30 days</p>
                </div>
                <span
                    className="text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{
                        background: 'rgba(90, 70, 218, 0.08)',
                        color: '#5A46DA',
                        border: '1px solid rgba(90, 70, 218, 0.15)',
                    }}
                >
                    Live
                </span>
            </div>

            {/* Funnel bars */}
            <div className="flex-1 flex flex-col justify-center space-y-3">
                {funnel.map((step) => {
                    const maxCount = funnel[0].count;
                    const barWidth = Math.max(8, (step.count / maxCount) * 100);

                    return (
                        <div key={step.stage} className="group">
                            {/* Label row */}
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ background: step.pill }}
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-brand-light-textPrimary">{step.stage}</span>
                                        <span className="text-xs text-brand-light-textSecondary ml-1.5 hidden sm:inline">{step.sublabel}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span
                                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                                        style={{
                                            background: step.lightBg,
                                            color: step.pill,
                                        }}
                                    >
                                        {step.percentage.toFixed(1)}%
                                    </span>
                                    <span className="text-sm font-bold text-brand-light-textPrimary tabular-nums">
                                        {step.count.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div
                                className="h-2.5 w-full rounded-full overflow-hidden"
                                style={{ background: 'rgba(230, 230, 240, 0.6)' }}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${barWidth}%`,
                                        background: step.gradient,
                                        boxShadow: `0 0 8px ${step.pill}40`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer stats */}
            <div
                className="mt-4 pt-4 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(230, 230, 240, 0.6)' }}
            >
                <p className="text-xs text-brand-light-textSecondary">
                    Overall conversion: <span className="font-semibold text-brand-violet">0.14%</span>
                </p>
                <button
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#5A46DA' }}
                >
                    View full report →
                </button>
            </div>
        </div>
    );
}

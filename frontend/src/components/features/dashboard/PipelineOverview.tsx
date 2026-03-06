export function PipelineOverview() {
    // Static mockup data, normally fetched via React Query
    const funnel = [
        { stage: 'Sourced (Resumes)', count: 8405, percentage: 100, color: 'bg-brand-royal' },
        { stage: 'AI Shortlisted', count: 1248, percentage: 15, color: 'bg-brand-violet' },
        { stage: 'AI Screened', count: 386, percentage: 4.5, color: 'bg-brand-lavender' },
        { stage: 'Human Interview', count: 94, percentage: 1.1, color: 'bg-emerald-500/80' },
        { stage: 'Offers Extended', count: 12, percentage: 0.14, color: 'bg-emerald-400' },
    ];

    return (
        <div className="glass-card p-6 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-white">Pipeline Conversion</h3>
                <span className="text-sm text-white/50">Last 30 Days</span>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4">
                {funnel.map((step, idx) => {
                    // Calculate width relative to the previous step to show funnel effect visually
                    const displayWidth = idx === 0 ? 100 : Math.max(30, (step.count / funnel[0].count) * 100 * 3); // *3 just to make it visually readable for the mockup

                    return (
                        <div key={step.stage} className="relative w-full group">
                            <div className="flex items-center justify-between mb-1.5 px-1">
                                <span className="text-sm font-medium text-white/80">{step.stage}</span>
                                <span className="text-sm font-bold text-white">{step.count.toLocaleString()}</span>
                            </div>
                            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${step.color} transition-all duration-1000 ease-out`}
                                    style={{ width: `${displayWidth}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

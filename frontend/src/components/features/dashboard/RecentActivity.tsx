import { Video, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RecentActivity() {
    const activities = [
        {
            id: 1,
            type: 'interview_completed',
            title: 'AI Screening Completed',
            desc: 'Sarah Jenkins completed the initial screening for Frontend Engineer.',
            time: '2 hours ago',
            icon: Video,
            color: 'text-brand-lavender',
            bgType: 'bg-brand-violet/20'
        },
        {
            id: 2,
            type: 'resume_parsed',
            title: 'Batch Resume Processing',
            desc: 'Processed 54 new resumes for the Product Manager role.',
            time: '4 hours ago',
            icon: FileText,
            color: 'text-sky-400',
            bgType: 'bg-sky-500/20'
        },
        {
            id: 3,
            type: 'shortlist_ready',
            title: 'Shortlist Generated',
            desc: 'Top 10 candidates identified for Senior Backend Developer.',
            time: '1 day ago',
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bgType: 'bg-emerald-500/20'
        }
    ];

    return (
        <div className="glass-card p-6 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-brand-light-textPrimary dark:text-white">Recent Activity</h3>
                <button className="text-sm text-brand-lavender hover:text-brand-violet dark:hover:text-white transition-colors">View All</button>
            </div>

            <div className="space-y-6">
                {activities.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className="relative pl-4">
                            {/* Timeline connector */}
                            {idx !== activities.length - 1 && (
                                <div className="absolute left-[1.35rem] top-10 bottom-[-1.5rem] w-[1px] bg-black/10 dark:bg-white/10" />
                            )}

                            <div className="flex gap-4">
                                <div className={cn("mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-brand-gray dark:border-white/5 shadow-glow-sm", item.bgType)}>
                                    <Icon className={cn("w-4 h-4", item.color)} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-semibold text-brand-light-textPrimary dark:text-white/90">{item.title}</h4>
                                        <span className="text-xs text-brand-light-textSecondary dark:text-white/40">• {item.time}</span>
                                    </div>
                                    <p className="text-sm text-brand-light-textSecondary dark:text-white/60 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

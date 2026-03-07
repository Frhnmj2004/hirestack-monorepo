'use client';

import { Video, FileText, CheckCircle2, UserPlus, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RecentActivity() {
    const activities = [
        {
            id: 1,
            type: 'interview_completed',
            title: 'AI Screening Completed',
            desc: 'Sarah Jenkins — Frontend Engineer role',
            time: '2h ago',
            icon: Video,
            iconBg: 'rgba(90, 70, 218, 0.1)',
            iconColor: '#5A46DA',
            dotColor: '#5A46DA',
            tag: 'Interview',
            tagBg: 'rgba(90, 70, 218, 0.08)',
            tagColor: '#5A46DA',
        },
        {
            id: 2,
            type: 'resume_parsed',
            title: 'Batch Resume Processing',
            desc: '54 new resumes — Product Manager role',
            time: '4h ago',
            icon: FileText,
            iconBg: 'rgba(14, 165, 233, 0.1)',
            iconColor: '#0ea5e9',
            dotColor: '#0ea5e9',
            tag: 'Resumes',
            tagBg: 'rgba(14, 165, 233, 0.08)',
            tagColor: '#0ea5e9',
        },
        {
            id: 3,
            type: 'shortlist_ready',
            title: 'Shortlist Generated',
            desc: 'Top 10 candidates — Senior Backend Developer',
            time: '1d ago',
            icon: CheckCircle2,
            iconBg: 'rgba(16, 185, 129, 0.1)',
            iconColor: '#10b981',
            dotColor: '#10b981',
            tag: 'Shortlist',
            tagBg: 'rgba(16, 185, 129, 0.08)',
            tagColor: '#10b981',
        },
        {
            id: 4,
            type: 'candidate_added',
            title: 'New Candidate Added',
            desc: 'Alex Moore entered pipeline — UX Designer',
            time: '2d ago',
            icon: UserPlus,
            iconBg: 'rgba(244, 63, 94, 0.1)',
            iconColor: '#f43f5e',
            dotColor: '#f43f5e',
            tag: 'Candidate',
            tagBg: 'rgba(244, 63, 94, 0.08)',
            tagColor: '#f43f5e',
        },
    ];

    return (
        <div
            className="p-6 rounded-2xl min-h-[420px] flex flex-col"
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
                    <h3 className="font-semibold text-base text-brand-light-textPrimary">Recent Activity</h3>
                    <p className="text-xs text-brand-light-textSecondary mt-0.5">Platform events across all modules</p>
                </div>
                <button
                    className="text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                    style={{
                        color: '#5A46DA',
                        background: 'rgba(90, 70, 218, 0.06)',
                        border: '1px solid rgba(90, 70, 218, 0.12)',
                    }}
                >
                    View All
                </button>
            </div>

            {/* Activity Feed */}
            <div className="flex-1 space-y-3">
                {activities.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.id}
                            className="group flex items-start gap-3.5 p-3.5 rounded-xl transition-all duration-200 cursor-pointer"
                            style={{ background: 'transparent' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.background = 'rgba(90, 70, 218, 0.04)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-105"
                                style={{ background: item.iconBg }}
                            >
                                <Icon className="w-4 h-4" style={{ color: item.iconColor }} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-semibold text-brand-light-textPrimary leading-tight truncate">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-brand-light-textSecondary mt-0.5 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                        <span
                                            className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                                            style={{
                                                background: item.tagBg,
                                                color: item.tagColor,
                                                border: `1px solid ${item.tagColor}20`,
                                            }}
                                        >
                                            {item.tag}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-brand-light-textSecondary">
                                            <Clock className="w-3 h-3" />
                                            {item.time}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div
                className="mt-4 pt-4 flex items-center gap-2"
                style={{ borderTop: '1px solid rgba(230, 230, 240, 0.6)' }}
            >
                <Zap className="w-3.5 h-3.5 text-brand-violet" />
                <p className="text-xs text-brand-light-textSecondary">
                    <span className="font-semibold text-brand-light-textPrimary">24 events</span> in the last 7 days
                </p>
            </div>
        </div>
    );
}

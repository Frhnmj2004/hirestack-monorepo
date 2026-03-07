'use client';

import { ArrowLeft, Play, FileText, CheckCircle, AlertTriangle, TrendingUp, User, Clock, Mic } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

// --- DATA ---
const MOCK_INTERVIEWS: Record<string, {
    candidateName: string;
    jobTitle: string;
    date: string;
    duration: string;
    status: string;
    score?: number;
    recommendation?: string;
    summary: string;
    competencies: { label: string; score: number }[];
    highlights: string[];
    redFlags: string[];
}> = {
    '1': {
        candidateName: 'Alex Harper', jobTitle: 'Senior Frontend Engineer',
        date: 'Oct 14, 2025', duration: '15 mins', status: 'Completed', score: 94,
        recommendation: 'Strong Hire',
        summary: 'Alex provided comprehensive, highly technical answers to React architecture questions. When challenged on state management trade-offs between Redux, Zustand, and Context, Alex articulated clear, context-aware decisions supported by past experience. The candidate demonstrated excellent communication skills and stayed calm during technical pressure-test scenarios.',
        competencies: [
            { label: 'Technical Accuracy', score: 95 },
            { label: 'Communication Clarity', score: 92 },
            { label: 'Problem Solving', score: 98 },
            { label: 'Role Fit', score: 90 },
        ],
        highlights: [
            'Excellent depth on React concurrent rendering internals',
            'Clear articulation of trade-offs in large-scale state management',
            'Strong examples of mentorship and team leadership',
        ],
        redFlags: [],
    },
    '2': {
        candidateName: 'Sam Rivera', jobTitle: 'Senior Frontend Engineer',
        date: 'Oct 15, 2025', duration: '18 mins', status: 'Completed', score: 88,
        recommendation: 'Hire',
        summary: 'Sam demonstrated solid frontend competencies with a particular strength in CSS architecture and performance optimization. Answered all core React questions correctly and showed genuine product thinking. Some hesitation on systems design questions at scale, but recovered well with thoughtful trade-off analysis.',
        competencies: [
            { label: 'Technical Accuracy', score: 85 },
            { label: 'Communication Clarity', score: 91 },
            { label: 'Problem Solving', score: 88 },
            { label: 'Role Fit', score: 88 },
        ],
        highlights: [
            'Strong CSS architecture and performance focus',
            'Impressive Lighthouse score optimization case study',
        ],
        redFlags: [
            'Slight hesitation on distributed systems design at scale',
        ],
    },
    '3': {
        candidateName: 'Jordan Lee', jobTitle: 'UX Designer',
        date: 'Oct 16, 2025', duration: '--', status: 'In Progress',
        recommendation: undefined,
        summary: 'Interview is currently in progress. Live data will be available upon completion.',
        competencies: [],
        highlights: [],
        redFlags: [],
    },
    '5': {
        candidateName: 'Morgan Taylor', jobTitle: 'UX Designer',
        date: 'Oct 12, 2025', duration: '12 mins', status: 'Completed', score: 72,
        recommendation: 'Consider',
        summary: 'Morgan showed promising design instincts but struggled to articulate the rationale behind key design decisions when pressed. The portfolio examples were strong visually, but lacked measurable impact data. May perform better in a junior or mid-level capacity.',
        competencies: [
            { label: 'Design Thinking', score: 78 },
            { label: 'Communication Clarity', score: 68 },
            { label: 'Portfolio Quality', score: 82 },
            { label: 'Role Fit', score: 60 },
        ],
        highlights: [
            'Visually polished portfolio with strong brand sensibility',
        ],
        redFlags: [
            'Could not clearly describe design rationale under questioning',
            'Limited data-backed impact metrics in work history',
        ],
    },
};

const getRecommendationStyle = (rec?: string) => {
    if (rec === 'Strong Hire') return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' };
    if (rec === 'Hire') return { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700' };
    if (rec === 'Consider') return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' };
    return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500' };
};

const glassCard = {
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '10px solid var(--glass-border)',
    backgroundClip: 'padding-box',
    boxShadow: 'var(--glass-shadow)',
} as const;

export default function InterviewDetailPage() {
    const params = useParams();
    const interviewId = params.id as string;
    const interview = MOCK_INTERVIEWS[interviewId];
    const isLive = interview?.status === 'In Progress';
    const recStyle = getRecommendationStyle(interview?.recommendation);

    if (!interview) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <Link href={ROUTES.INTERVIEWS} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-light-textSecondary hover:text-brand-violet transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Interviews
                </Link>
                <div className="flex items-center justify-center p-16 rounded-[28px]" style={glassCard}>
                    <p className="text-brand-light-textSecondary">Interview not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">
            {/* Back */}
            <Link href={ROUTES.INTERVIEWS} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-light-textSecondary hover:text-brand-violet transition-colors w-max group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Back to Interviews
            </Link>

            {/* Live Banner */}
            {isLive && (
                <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-amber-200 bg-amber-50">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                    <p className="text-sm font-semibold text-amber-700">Interview in Progress — Live session is currently running.</p>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-violet mb-1">AI Interview Results</p>
                    <h1 className="text-2xl font-bold tracking-tight text-brand-light-textPrimary">{interview.candidateName}</h1>
                    <p className="text-sm text-brand-light-textSecondary mt-0.5">{interview.jobTitle} • {interview.date} • {interview.duration}</p>
                </div>
                <div className="flex items-center gap-3">
                    {interview.score && (
                        <div className={cn('px-4 py-2 rounded-xl border text-sm font-semibold', recStyle.bg, recStyle.text)}>
                            {interview.recommendation} · {interview.score}/100
                        </div>
                    )}
                    <Link
                        href={`${ROUTES.INTERVIEWS}/${interviewId}/transcript`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, #5A46DA, #7B6CFF)', boxShadow: '0 4px 12px rgba(90,70,218,0.3)' }}
                    >
                        <FileText className="w-4 h-4" /> Full Transcript
                    </Link>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-1 flex flex-col gap-5">
                    {/* Score */}
                    {interview.score && (
                        <div className="p-6 rounded-[28px] flex flex-col items-center text-center" style={glassCard}>
                            <User className="w-6 h-6 text-brand-violet mb-3" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-light-textSecondary mb-2">AI Assessment Score</p>
                            <div className={cn('text-5xl font-extrabold mb-1', interview.score >= 90 ? 'text-emerald-500' : interview.score >= 75 ? 'text-amber-500' : 'text-rose-500')}>
                                {interview.score}<span className="text-2xl text-brand-light-textSecondary/40">/100</span>
                            </div>
                            <div className={cn('mt-2 px-3 py-1 rounded-full text-xs font-bold border', recStyle.bg, recStyle.text)}>
                                {interview.recommendation ?? 'Pending'}
                            </div>
                        </div>
                    )}

                    {/* Recording */}
                    <div className="p-6 rounded-[28px]" style={glassCard}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-light-textSecondary mb-3">Interview Recording</p>
                        <div className="aspect-video bg-gradient-to-br from-brand-violet/10 to-brand-lavender/10 border border-brand-violet/15 rounded-2xl flex flex-col items-center justify-center gap-3 group cursor-pointer hover:from-brand-violet/15 hover:to-brand-lavender/15 transition-all">
                            {isLive ? (
                                <>
                                    <Mic className="w-8 h-8 text-brand-violet animate-pulse" />
                                    <p className="text-xs text-brand-violet font-semibold">Live Recording</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-brand-violet/20 flex items-center justify-center group-hover:bg-brand-violet/30 transition-all">
                                        <Play className="w-5 h-5 text-brand-violet translate-x-0.5" />
                                    </div>
                                    <p className="text-xs text-brand-light-textSecondary">Play Recording</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Highlights */}
                    {interview.highlights.length > 0 && (
                        <div className="p-6 rounded-[28px]" style={glassCard}>
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-light-textSecondary">Highlights</p>
                            </div>
                            <div className="space-y-2.5">
                                {interview.highlights.map((h, i) => (
                                    <p key={i} className="text-xs text-brand-light-textSecondary flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                                        {h}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Red Flags */}
                    {interview.redFlags.length > 0 && (
                        <div className="p-6 rounded-[28px]" style={glassCard}>
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-light-textSecondary">Watch Points</p>
                            </div>
                            <div className="space-y-2.5">
                                {interview.redFlags.map((f, i) => (
                                    <p key={i} className="text-xs text-brand-light-textSecondary flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                                        {f}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="md:col-span-2 flex flex-col gap-5">
                    {/* AI Summary */}
                    <div className="p-6 rounded-[28px]" style={glassCard}>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-brand-violet" />
                            <h3 className="font-bold text-brand-light-textPrimary">AI Evaluation Summary</h3>
                        </div>
                        <p className="text-sm text-brand-light-textSecondary leading-relaxed">{interview.summary}</p>
                    </div>

                    {/* Competency Breakdown */}
                    {interview.competencies.length > 0 ? (
                        <div className="p-6 rounded-[28px] flex-1" style={glassCard}>
                            <h3 className="font-bold text-brand-light-textPrimary mb-5">Competency Breakdown</h3>
                            <div className="space-y-5">
                                {interview.competencies.map((comp) => (
                                    <div key={comp.label}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium text-brand-light-textPrimary">{comp.label}</span>
                                            <span className={cn('font-bold', comp.score >= 90 ? 'text-emerald-600' : comp.score >= 75 ? 'text-amber-500' : 'text-rose-500')}>
                                                {comp.score}/100
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                                            <div
                                                className={cn('h-full rounded-full', comp.score >= 90 ? 'bg-emerald-500' : comp.score >= 75 ? 'bg-amber-400' : 'bg-rose-400')}
                                                style={{ width: `${comp.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-[28px] flex-1 flex items-center justify-center" style={glassCard}>
                            <div className="text-center">
                                <Clock className="w-8 h-8 text-brand-violet/30 mx-auto mb-3" />
                                <p className="text-sm text-brand-light-textSecondary">Competency data will appear after the interview completes.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

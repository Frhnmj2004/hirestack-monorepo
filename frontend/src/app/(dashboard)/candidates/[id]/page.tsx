'use client';

import { ArrowLeft, Mail, Phone, MapPin, Star, CheckCircle2, Clock, Circle, Video, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

// --- DATA ---
const MOCK_CANDIDATES: Record<string, {
    name: string; role: string; location: string; email: string; phone: string;
    matchScore: number; skills: string[]; summary: string; status: string;
    competencies: { label: string; score: number }[];
    timeline: { id: string; title: string; description: string; date: string; status: 'completed' | 'current' | 'upcoming' }[];
}> = {
    '1': {
        name: 'Alex Harper', role: 'Senior Frontend Engineer', location: 'San Francisco, CA (Remote)',
        email: 'alex.harper@example.com', phone: '+1 (555) 123-4567', matchScore: 92, status: 'AI Shortlisted',
        skills: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'GraphQL', 'Redux'],
        summary: 'Alex demonstrates strong senior-level competencies in modern React architectures. Over 6 years of focused frontend experience, highlighting successful migrations from legacy SPAs to Next.js App Router. Evidence of mentoring junior engineers and leading design system implementations strongly aligns with the job description requirements.',
        competencies: [
            { label: 'Technical Accuracy', score: 95 },
            { label: 'Communication Clarity', score: 88 },
            { label: 'Problem Solving', score: 92 },
            { label: 'Role Fit', score: 94 },
        ],
        timeline: [
            { id: '1', title: 'Application Received', description: 'Resume parsed via automated rules.', date: 'Oct 14, 2025', status: 'completed' },
            { id: '2', title: 'AI Shortlisted', description: 'Ranked in Top 10% based on JD matching.', date: 'Oct 14, 2025', status: 'completed' },
            { id: '3', title: 'AI Interview Screen', description: 'Completed a 15-minute technical behavior screen.', date: 'Oct 16, 2025', status: 'current' },
            { id: '4', title: 'Hiring Manager Review', description: 'Pending evaluation by engineering manager.', date: 'TBD', status: 'upcoming' },
        ],
    },
    '2': {
        name: 'Jordan Lee', role: 'UX Designer', location: 'New York, NY',
        email: 'jordan.lee@example.com', phone: '+1 (555) 987-6543', matchScore: 88, status: 'AI Screened',
        skills: ['Figma', 'UX Research', 'Prototyping', 'Design Systems', 'User Testing'],
        summary: 'Jordan brings 5 years of product design experience from fast-paced startups. Strong portfolio demonstrating end-to-end design ownership from discovery through delivery. Skilled in facilitating design sprints and translating complex data into intuitive interfaces.',
        competencies: [
            { label: 'Design Thinking', score: 91 },
            { label: 'Communication Clarity', score: 85 },
            { label: 'Technical Fluency', score: 78 },
            { label: 'Role Fit', score: 90 },
        ],
        timeline: [
            { id: '1', title: 'Application Received', description: 'Resume parsed via automated rules.', date: 'Oct 15, 2025', status: 'completed' },
            { id: '2', title: 'AI Shortlisted', description: 'Ranked in Top 15% based on JD matching.', date: 'Oct 15, 2025', status: 'completed' },
            { id: '3', title: 'AI Interview Screen', description: 'Scheduled for Oct 18.', date: 'Oct 18, 2025', status: 'upcoming' },
            { id: '4', title: 'Hiring Manager Review', description: 'Pending AI screen results.', date: 'TBD', status: 'upcoming' },
        ],
    },
    '4': {
        name: 'Sam Rivera', role: 'Senior Frontend Engineer', location: 'Austin, TX (Hybrid)',
        email: 'sam.rivera@example.com', phone: '+1 (555) 444-2222', matchScore: 95, status: 'AI Interview',
        skills: ['React', 'Vue.js', 'TypeScript', 'Node.js', 'CSS Architecture', 'Testing Library'],
        summary: 'Sam is an extraordinary frontend talent with a rare combination of deep technical expertise and product intuition. Led the frontend architecture for a Series B startup serving 500K+ users. Particularly strong in performance optimization and accessibility, achieving Lighthouse scores above 95 consistently.',
        competencies: [
            { label: 'Technical Accuracy', score: 98 },
            { label: 'Communication Clarity', score: 94 },
            { label: 'Problem Solving', score: 97 },
            { label: 'Role Fit', score: 92 },
        ],
        timeline: [
            { id: '1', title: 'Application Received', description: 'Resume parsed via automated rules.', date: 'Oct 13, 2025', status: 'completed' },
            { id: '2', title: 'AI Shortlisted', description: 'Ranked #1 across 142 applicants.', date: 'Oct 13, 2025', status: 'completed' },
            { id: '3', title: 'AI Interview Screen', description: 'Completed advanced frontend challenge.', date: 'Oct 15, 2025', status: 'completed' },
            { id: '4', title: 'Hiring Manager Review', description: 'Under active evaluation — strong hire signal.', date: 'Oct 20, 2025', status: 'current' },
        ],
    },
};

const DEFAULT_CANDIDATE = {
    name: 'Unknown Candidate', role: 'Unknown Role', location: 'N/A',
    email: 'N/A', phone: 'N/A', matchScore: 0, status: 'Unknown', skills: [],
    summary: 'No candidate data available.',
    competencies: [],
    timeline: [],
};

export default function CandidateDetailPage() {
    const params = useParams();
    const candidateId = params.id as string;
    const candidate = MOCK_CANDIDATES[candidateId] ?? DEFAULT_CANDIDATE;

    const scoreColor = candidate.matchScore >= 90 ? 'text-emerald-600' : candidate.matchScore >= 75 ? 'text-amber-500' : 'text-rose-500';
    const scoreBg = candidate.matchScore >= 90 ? 'bg-emerald-50 border-emerald-200' : candidate.matchScore >= 75 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">
            {/* Back link */}
            <Link href={ROUTES.CANDIDATES} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-light-textSecondary hover:text-brand-violet transition-colors w-max group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Back to Pipeline
            </Link>

            {/* Page Header */}
            <div className="flex justify-between items-start gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-violet mb-1">Candidate Profile</p>
                    <h1 className="text-2xl font-bold tracking-tight text-brand-light-textPrimary">{candidate.name}</h1>
                    <p className="text-sm text-brand-light-textSecondary mt-0.5">{candidate.role} • {candidate.location}</p>
                </div>
                <div className={cn('px-4 py-2 rounded-xl border text-sm font-semibold', scoreBg, scoreColor)}>
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current" />
                        {candidate.matchScore}% Match
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div
                className="p-6 rounded-[28px] flex flex-col md:flex-row gap-8"
                style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    border: '10px solid var(--glass-border)',
                    backgroundClip: 'padding-box',
                    boxShadow: 'var(--glass-shadow)',
                }}
            >
                {/* Avatar + Info */}
                <div className="flex flex-col flex-1 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-lavender flex items-center justify-center text-2xl font-bold text-white shadow-glow-sm flex-shrink-0">
                            {candidate.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-brand-light-textPrimary">{candidate.name}</h2>
                            <p className="text-brand-violet font-medium text-sm">{candidate.role}</p>
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-violet/10 text-brand-violet border border-brand-violet/20">
                                {candidate.status}
                            </span>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm py-5 border-y border-[rgba(230,230,240,0.7)]">
                        <div className="flex items-center gap-2.5 text-brand-light-textSecondary">
                            <Mail className="w-4 h-4 text-brand-violet/50 flex-shrink-0" />
                            <a href={`mailto:${candidate.email}`} className="hover:text-brand-violet transition-colors truncate">{candidate.email}</a>
                        </div>
                        <div className="flex items-center gap-2.5 text-brand-light-textSecondary">
                            <Phone className="w-4 h-4 text-brand-violet/50 flex-shrink-0" />
                            <span>{candidate.phone}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-brand-light-textSecondary">
                            <MapPin className="w-4 h-4 text-brand-violet/50 flex-shrink-0" />
                            <span>{candidate.location}</span>
                        </div>
                    </div>

                    {/* AI Summary */}
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-light-textSecondary mb-2">AI Extracted Summary</p>
                        <p className="text-sm text-brand-light-textSecondary leading-relaxed">{candidate.summary}</p>
                    </div>

                    {/* Skills */}
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-light-textSecondary mb-3">Top Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {candidate.skills.map(skill => (
                                <span key={skill} className="px-3 py-1 bg-brand-violet/5 border border-brand-violet/15 rounded-full text-xs text-brand-violet font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions sidebar */}
                <div className="w-full md:w-52 shrink-0 flex flex-col gap-2.5">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, #5A46DA, #7B6CFF)', boxShadow: '0 4px 15px rgba(90,70,218,0.35)' }}>
                        <Video className="w-4 h-4" /> Schedule Interview
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-brand-light-textPrimary border border-[#E6E6F0] bg-white hover:bg-gray-50 hover:border-brand-violet/30 transition-all">
                        <Download className="w-4 h-4 text-brand-light-textSecondary" /> Download Resume
                    </button>
                    <div className="h-px bg-[rgba(230,230,240,0.8)] my-1" />
                    <button className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-emerald-600 hover:bg-emerald-50 border border-emerald-200/60 transition-all">
                        Move to Offer
                    </button>
                    <button className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-all">
                        Reject Candidate
                    </button>
                </div>
            </div>

            {/* Bottom Grid: Competencies + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Competency section */}
                <div
                    className="lg:col-span-2 p-6 rounded-[28px]"
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)',
                        border: '10px solid var(--glass-border)',
                        backgroundClip: 'padding-box',
                        boxShadow: 'var(--glass-shadow)',
                    }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-4 h-4 text-brand-violet" />
                        <h3 className="font-bold text-brand-light-textPrimary">AI Competency Assessment</h3>
                    </div>
                    {candidate.competencies.length > 0 ? (
                        <div className="space-y-5">
                            {candidate.competencies.map((comp) => (
                                <div key={comp.label}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-medium text-brand-light-textPrimary">{comp.label}</span>
                                        <span className={cn('font-bold', comp.score >= 90 ? 'text-emerald-600' : comp.score >= 75 ? 'text-amber-500' : 'text-rose-500')}>
                                            {comp.score}/100
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn('h-full rounded-full transition-all', comp.score >= 90 ? 'bg-emerald-500' : comp.score >= 75 ? 'bg-amber-400' : 'bg-rose-400')}
                                            style={{ width: `${comp.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-brand-violet/10 rounded-2xl">
                            <p className="text-brand-light-textSecondary text-sm">Competency data not yet available.</p>
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div
                    className="p-6 rounded-[28px]"
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)',
                        border: '10px solid var(--glass-border)',
                        backgroundClip: 'padding-box',
                        boxShadow: 'var(--glass-shadow)',
                    }}
                >
                    <h3 className="font-bold text-brand-light-textPrimary mb-6">Hiring Timeline</h3>
                    <div className="space-y-6">
                        {candidate.timeline.map((event, idx) => {
                            const isCompleted = event.status === 'completed';
                            const isCurrent = event.status === 'current';
                            return (
                                <div key={event.id} className="relative pl-6">
                                    {idx !== candidate.timeline.length - 1 && (
                                        <div className={cn('absolute left-[7px] top-5 bottom-[-1.5rem] w-[2px]', isCompleted ? 'bg-brand-violet/50' : 'bg-black/8')} />
                                    )}
                                    <div className="absolute left-0 top-0.5">
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-4 h-4 text-brand-violet bg-white rounded-full" />
                                        ) : isCurrent ? (
                                            <Clock className="w-4 h-4 text-amber-500 bg-white rounded-full" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-black/20 bg-white rounded-full" />
                                        )}
                                    </div>
                                    <div className={cn('flex flex-col gap-0.5', !isCompleted && !isCurrent && 'opacity-40')}>
                                        <div className="flex justify-between items-center">
                                            <h4 className={cn('text-sm font-semibold', isCurrent ? 'text-amber-600' : 'text-brand-light-textPrimary')}>
                                                {event.title}
                                            </h4>
                                            <span className="text-[10px] text-brand-light-textSecondary">{event.date}</span>
                                        </div>
                                        <p className="text-xs text-brand-light-textSecondary leading-relaxed">{event.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

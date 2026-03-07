'use client';

import { ArrowLeft, Users, TrendingUp, Star, BarChart2, Download, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScoreChart } from '@/components/features/reports/ScoreChart';
import { ScoreBreakdownChart } from '@/components/features/reports/ScoreBreakdownChart';
import { ComparisonTable } from '@/components/features/reports/ComparisonTable';

// --- DATA ---
const MOCK_REPORTS: Record<string, {
    jobTitle: string;
    department: string;
    totalApplicants: number;
    aiScreened: number;
    shortlisted: number;
    hired: number;
    avgScore: number;
    radarData: { subject: string; score: number; fullMark: number }[];
    breakdownData: { name: string; technical: number; communication: number; problemSolving: number; leadership: number }[];
    comparisons: { id: string; name: string; matchScore: number; technical: number; cultural: number; experience: 'Exceeds' | 'Meets' | 'Below'; redFlags: number }[];
}> = {
    '1': {
        jobTitle: 'Senior Frontend Engineer', department: 'Engineering',
        totalApplicants: 142, aiScreened: 38, shortlisted: 12, hired: 2, avgScore: 81,
        radarData: [
            { subject: 'React/Next.js', score: 95, fullMark: 100 },
            { subject: 'State Mgmt', score: 88, fullMark: 100 },
            { subject: 'CSS Arch', score: 92, fullMark: 100 },
            { subject: 'Testing', score: 75, fullMark: 100 },
            { subject: 'Web Perf', score: 85, fullMark: 100 },
            { subject: 'System Design', score: 90, fullMark: 100 },
        ],
        breakdownData: [
            { name: 'Avg Pool', technical: 65, communication: 70, problemSolving: 60, leadership: 50 },
            { name: 'Shortlisted', technical: 85, communication: 80, problemSolving: 85, leadership: 70 },
            { name: 'Alex Harper (Top)', technical: 95, communication: 90, problemSolving: 98, leadership: 85 },
        ],
        comparisons: [
            { id: '1', name: 'Alex Harper', matchScore: 94, technical: 95, cultural: 92, experience: 'Exceeds', redFlags: 0 },
            { id: '2', name: 'Sam Rivera', matchScore: 88, technical: 85, cultural: 90, experience: 'Meets', redFlags: 0 },
            { id: '3', name: 'Jordan Lee', matchScore: 81, technical: 88, cultural: 75, experience: 'Below', redFlags: 1 },
        ],
    },
    '2': {
        jobTitle: 'Product Design Lead', department: 'Design',
        totalApplicants: 84, aiScreened: 22, shortlisted: 8, hired: 1, avgScore: 76,
        radarData: [
            { subject: 'Figma', score: 92, fullMark: 100 },
            { subject: 'UX Research', score: 85, fullMark: 100 },
            { subject: 'Visual Design', score: 90, fullMark: 100 },
            { subject: 'Leadership', score: 78, fullMark: 100 },
            { subject: 'Systems', score: 82, fullMark: 100 },
            { subject: 'Collab', score: 88, fullMark: 100 },
        ],
        breakdownData: [
            { name: 'Avg Pool', technical: 60, communication: 68, problemSolving: 55, leadership: 45 },
            { name: 'Shortlisted', technical: 80, communication: 85, problemSolving: 78, leadership: 72 },
            { name: 'Top Candidate', technical: 90, communication: 92, problemSolving: 88, leadership: 86 },
        ],
        comparisons: [
            { id: '10', name: 'Priya Nair', matchScore: 91, technical: 90, cultural: 93, experience: 'Exceeds', redFlags: 0 },
            { id: '11', name: 'Chris Wang', matchScore: 85, technical: 80, cultural: 88, experience: 'Meets', redFlags: 0 },
            { id: '12', name: 'Dana Kim', matchScore: 76, technical: 78, cultural: 70, experience: 'Below', redFlags: 2 },
        ],
    },
};

const glassCard = {
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '10px solid var(--glass-border)',
    backgroundClip: 'padding-box',
    boxShadow: 'var(--glass-shadow)',
} as const;

export default function JobReportPage() {
    const params = useParams();
    const jobId = params.jobId as string;
    const report = MOCK_REPORTS[jobId];

    if (!report) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <Link href={ROUTES.REPORTS} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-light-textSecondary hover:text-brand-violet transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Reports
                </Link>
                <div className="flex items-center justify-center p-16 rounded-[28px]" style={glassCard}>
                    <p className="text-brand-light-textSecondary">Report not found for this role.</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Applicants', value: report.totalApplicants, icon: Users, color: 'text-brand-violet', bg: 'bg-brand-violet/10 border-brand-violet/20' },
        { label: 'AI Screened', value: report.aiScreened, icon: BarChart2, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
        { label: 'Shortlisted', value: report.shortlisted, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
        { label: 'Hired', value: report.hired, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    ];

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">
            {/* Back */}
            <Link href={ROUTES.REPORTS} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-light-textSecondary hover:text-brand-violet transition-colors w-max group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Back to All Reports
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-violet mb-1">{report.department}</p>
                    <h1 className="text-2xl font-bold tracking-tight text-brand-light-textPrimary">Analytics: {report.jobTitle}</h1>
                    <p className="text-sm text-brand-light-textSecondary mt-0.5">
                        Comprehensive analysis of the candidate pool, AI assessments, and final recommendations.
                    </p>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-light-textPrimary border border-[#E6E6F0] bg-white hover:border-brand-violet/30 hover:text-brand-violet transition-all flex-shrink-0"
                >
                    <Download className="w-4 h-4" /> Export PDF
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="p-5 rounded-[28px] flex flex-col gap-3" style={glassCard}>
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border', bg)}>
                            <Icon className={cn('w-4 h-4', color)} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-light-textSecondary">{label}</p>
                            <p className="text-2xl font-bold text-brand-light-textPrimary mt-0.5">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radar Chart */}
                <div className="lg:col-span-1 p-6 rounded-[28px] flex flex-col" style={glassCard}>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-brand-violet" />
                        <h3 className="font-bold text-brand-light-textPrimary">Top Candidate Skill Fit</h3>
                    </div>
                    <p className="text-xs text-brand-light-textSecondary mb-5">
                        Radar comparison against the job's required competencies.
                    </p>
                    <div className="flex-1 min-h-[280px]">
                        <ScoreChart data={report.radarData} />
                    </div>
                </div>

                {/* Breakdown Chart */}
                <div className="lg:col-span-2 p-6 rounded-[28px] flex flex-col" style={glassCard}>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart2 className="w-4 h-4 text-brand-violet" />
                        <h3 className="font-bold text-brand-light-textPrimary">Competency Benchmarks</h3>
                    </div>
                    <p className="text-xs text-brand-light-textSecondary mb-5">
                        Comparing average pool context versus shortlisted candidates.
                    </p>
                    <div className="flex-1 min-h-[280px]">
                        <ScoreBreakdownChart data={report.breakdownData} />
                    </div>
                </div>
            </div>

            {/* Finalist Comparison Table */}
            <div className="p-6 rounded-[28px]" style={glassCard}>
                <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-brand-violet" />
                    <h3 className="font-bold text-brand-light-textPrimary">Finalist Comparison</h3>
                </div>
                <p className="text-xs text-brand-light-textSecondary mb-6">
                    Side-by-side evaluation of top candidates based on AI extraction and interview scores.
                </p>
                <ComparisonTable candidates={report.comparisons} />
            </div>
        </div>
    );
}

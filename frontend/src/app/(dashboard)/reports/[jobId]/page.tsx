'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { ScoreChart } from '@/components/features/reports/ScoreChart';
import { ScoreBreakdownChart } from '@/components/features/reports/ScoreBreakdownChart';
import { ComparisonTable } from '@/components/features/reports/ComparisonTable';
import { ReportExportButton } from '@/components/features/reports/ReportExportButton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const mockChartData = [
    { subject: 'React/Next.js', score: 95, fullMark: 100 },
    { subject: 'State Mgmt', score: 88, fullMark: 100 },
    { subject: 'CSS Arch', score: 92, fullMark: 100 },
    { subject: 'Testing', score: 75, fullMark: 100 },
    { subject: 'Web Perf', score: 85, fullMark: 100 },
    { subject: 'System Design', score: 90, fullMark: 100 },
];

const mockBreakdownData = [
    { name: 'Average Pool', technical: 65, communication: 70, problemSolving: 60, leadership: 50 },
    { name: 'Shortlisted', technical: 85, communication: 80, problemSolving: 85, leadership: 70 },
    { name: 'Alex Harper (Top)', technical: 95, communication: 90, problemSolving: 98, leadership: 85 },
];

const mockComparisons = [
    { id: '1', name: 'Alex Harper', matchScore: 94, technical: 95, cultural: 92, experience: 'Exceeds' as const, redFlags: 0 },
    { id: '2', name: 'Sam Rivera', matchScore: 88, technical: 85, cultural: 90, experience: 'Meets' as const, redFlags: 0 },
    { id: '3', name: 'Jordan Lee', matchScore: 81, technical: 88, cultural: 75, experience: 'Below' as const, redFlags: 1 },
];

export default function JobReportPage() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <Link href={ROUTES.REPORTS} className="inline-flex items-center text-sm text-brand-lavender hover:text-white transition-colors w-max">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to All Reports
            </Link>

            <PageHeader
                title="Analytics: Senior Frontend Engineer"
                description="Comprehensive analysis of the candidate pool, AI assessments, and final recommendations."
            >
                <ReportExportButton />
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2">

                {/* Radar Chart Card */}
                <div className="lg:col-span-1 glass-card p-6 flex flex-col">
                    <h3 className="font-bold text-white mb-2">Top Candidate Skill Fit</h3>
                    <p className="text-xs text-white/50 mb-6">Radar comparison of Alex Harper against job requirements.</p>
                    <div className="flex-1 min-h-[300px]">
                        <ScoreChart data={mockChartData} />
                    </div>
                </div>

                {/* Breakdown Chart Card */}
                <div className="lg:col-span-2 glass-card p-6 flex flex-col">
                    <h3 className="font-bold text-white mb-2">Competency Benchmarks</h3>
                    <p className="text-xs text-white/50 mb-6">Comparing the average applicant pool context against shortlisted candidates.</p>
                    <div className="flex-1 min-h-[300px]">
                        <ScoreBreakdownChart data={mockBreakdownData} />
                    </div>
                </div>

            </div>

            {/* Comparison Table */}
            <div className="glass-card p-6">
                <h3 className="font-bold text-white mb-2">Finalist Comparison</h3>
                <p className="text-xs text-white/50 mb-6">Side-by-side evaluation of the top candidates based on AI extraction and interview scores.</p>
                <ComparisonTable candidates={mockComparisons} />
            </div>

        </div>
    );
}

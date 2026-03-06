import { PageHeader } from '@/components/layout/PageHeader';
import { CandidateProfileCard } from '@/components/features/candidates/CandidateProfileCard';
import { CandidateTimeline } from '@/components/features/candidates/CandidateTimeline';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

// Mock Data
const MOCK_CANDIDATE = {
    name: 'Alex Harper',
    role: 'Senior Frontend Engineer',
    location: 'San Francisco, CA (Remote)',
    email: 'alex.harper@example.com',
    phone: '+1 (555) 123-4567',
    matchScore: 92,
    skills: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'GraphQL', 'Redux'],
    summary: 'Alex demonstrates strong senior-level competencies in modern React architectures. The resume indicates over 6 years of focused frontend experience, specifically highlighting successful migrations from legacy SPAs to Next.js App Router. Evidence of mentoring junior engineers and leading design system implementations strongly aligns with the job description requirements.'
};

const MOCK_EVENTS = [
    { id: '1', title: 'Application Received', description: 'Resume parsed via automated rules.', date: 'Oct 14, 2025', status: 'completed' as const },
    { id: '2', title: 'AI Shortlisted', description: 'Ranked organically in Top 10% based on job description matching.', date: 'Oct 14, 2025', status: 'completed' as const },
    { id: '3', title: 'AI Interview Screen', description: 'Completed a 15-minute technical behavior screen with HireLens AI.', date: 'Oct 16, 2025', status: 'current' as const },
    { id: '4', title: 'Hiring Manager Review', description: 'Pending evaluation by engineering manager.', date: 'TBD', status: 'upcoming' as const },
];

export default function CandidateDetailPage() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <Link href={ROUTES.CANDIDATES} className="inline-flex items-center text-sm text-brand-lavender hover:text-white transition-colors w-max">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pipeline
            </Link>

            <PageHeader
                title="Candidate Profile"
            />

            <CandidateProfileCard candidate={MOCK_CANDIDATE} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
                    <h3 className="text-lg font-bold text-white mb-6">AI Interview Assessment</h3>
                    <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-white/40 text-sm">Interview evaluation data will appear here.</p>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <CandidateTimeline events={MOCK_EVENTS} />
                </div>
            </div>
        </div>
    );
}

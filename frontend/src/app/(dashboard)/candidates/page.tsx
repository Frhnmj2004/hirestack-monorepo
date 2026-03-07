'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { KanbanBoard } from '@/components/shared/KanbanBoard';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

type Candidate = {
    id: string;
    name: string;
    role: string;
    matchScore: number;
};

// Mock Pipeline Data
const initialColumns = [
    {
        id: 'sourced',
        title: 'Sourced',
        items: [
            { id: '1', name: 'Alex Harper', role: 'Senior Frontend', matchScore: 92 },
            { id: '2', name: 'Jordan Lee', role: 'UX Designer', matchScore: 88 },
            { id: '3', name: 'Casey Smith', role: 'Backend Dev', matchScore: 75 },
        ]
    },
    {
        id: 'ai-screen',
        title: 'AI Interview',
        items: [
            { id: '4', name: 'Sam Rivera', role: 'Senior Frontend', matchScore: 95 },
            { id: '5', name: 'Taylor Swift', role: 'Product Manager', matchScore: 82 },
        ]
    },
    {
        id: 'hiring-manager',
        title: 'Manager Review',
        items: [
            { id: '6', name: 'Morgan Taylor', role: 'UX Designer', matchScore: 91 },
        ]
    },
    {
        id: 'offer',
        title: 'Offer Extended',
        items: [
            { id: '7', name: 'Jamie Doe', role: 'Backend Dev', matchScore: 98 },
        ]
    }
];

export default function CandidatesPage() {

    const renderCandidateCard = (candidate: Candidate) => (
        <Link href={`${ROUTES.CANDIDATES}/${candidate.id}`}>
            <div
                className="group flex flex-col p-4 rounded-2xl transition-all duration-200 hover:-translate-y-1"
                style={{
                    background: '#ffffff',
                    boxShadow: '0 4px 16px rgba(90,70,218,0.06)',
                }}
            >
                <h4 className="font-bold text-brand-light-textPrimary group-hover:text-brand-violet transition-colors">{candidate.name}</h4>
                <p className="text-xs text-brand-light-textSecondary mt-0.5 mb-4">{candidate.role}</p>

                <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: 'rgba(230,230,240,0.8)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-light-textSecondary/70">Match Score</span>
                    <div className="flex items-center gap-1">
                        <Star className={cn("w-3.5 h-3.5", candidate.matchScore >= 90 ? "text-emerald-500 fill-emerald-500" : "text-amber-500 fill-amber-500")} />
                        <span className="text-sm font-bold text-brand-light-textPrimary">{candidate.matchScore}</span>
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="flex flex-col gap-8 w-full h-full min-h-[calc(100vh-6rem)]">
            <PageHeader
                title="Candidate Pipeline"
                description="Drag and drop candidates across stages, or click to view detailed AI profiles."
            />

            <div className="flex-1 min-h-0 -mx-4 px-4 pb-4">
                <KanbanBoard columns={initialColumns} renderCard={renderCandidateCard} />
            </div>
        </div>
    );
}

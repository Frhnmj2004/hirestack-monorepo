'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FileUploadZone } from '@/components/shared/FileUploadZone';
import { DataTable } from '@/components/shared/DataTable';
import { ShortlistActions } from '@/components/features/resume-shortlist/ShortlistActions';
import { useState } from 'react';
import { cn } from '@/lib/utils';


export default function JobShortlistPage() {

    const [searchTerm, setSearchTerm] = useState('');

    const mockShortlist = [
        { id: '1', name: 'Alex Harper', matchScore: 92, skills: ['React', 'TypeScript', 'Next.js'], status: 'Pending Review' },
        { id: '2', name: 'Jordan Lee', matchScore: 88, skills: ['JavaScript', 'React', 'CSS'], status: 'Pending Review' },
        { id: '3', name: 'Sam Rivera', matchScore: 85, skills: ['Vue', 'TypeScript', 'Node.js'], status: 'Pending Review' },
    ];

    const handleAction = (action: string, id: string) => {
        console.log(`Action: ${action} on candidate ${id}`);
        // In real app, trigger React Query mutation to update status
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <PageHeader
                title="Resume Shortlist: Senior Frontend Engineer"
                description="Upload new resumes to be processed, or review the current AI rankings."
            />

            {/* Upload Zone */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4">Process New Resumes</h3>
                <FileUploadZone />
            </div>

            {/* Review Queue */}
            <div className="glass-card flex flex-col pt-6 rounded-b-[18px]">
                <div className="px-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-1">AI Ranked Shortlist</h3>
                    <p className="text-sm text-white/50">Candidates automatically ranked against the job description.</p>
                </div>

                <DataTable
                    data={mockShortlist.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                    totalItems={mockShortlist.length}
                    onSearch={setSearchTerm}
                    searchPlaceholder="Search candidates in shortlist..."
                    columns={[
                        {
                            header: 'Candidate',
                            cell: (row) => <div className="font-semibold text-white">{row.name}</div>
                        },
                        {
                            header: 'Top Matched Skills',
                            cell: (row) => (
                                <div className="flex flex-wrap gap-2">
                                    {row.skills.map(skill => (
                                        <span key={skill} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )
                        },
                        {
                            header: 'Match Score',
                            cell: (row) => (
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "font-bold",
                                        row.matchScore >= 90 ? "text-emerald-400" : row.matchScore >= 80 ? "text-amber-400" : "text-white/60"
                                    )}>
                                        {row.matchScore}%
                                    </span>
                                </div>
                            )
                        },
                        {
                            header: 'Actions',
                            className: "text-right",
                            cell: (row) => (
                                <div className="flex justify-end">
                                    <ShortlistActions
                                        onApprove={() => handleAction('approve', row.id)}
                                        onReject={() => handleAction('reject', row.id)}
                                        onAdvance={() => handleAction('advance', row.id)}
                                    />
                                </div>
                            )
                        },
                    ]}
                />
            </div>
        </div>
    );
}

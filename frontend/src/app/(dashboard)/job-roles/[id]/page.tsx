'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Pencil, Upload, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { DataTable } from '@/components/shared/DataTable';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function JobRoleDetailPage() {
    const params = useParams();
    const jobId = params.id as string;

    const [searchTerm, setSearchTerm] = useState('');

    const mockCandidates = [
        { id: '1', name: 'Alex Harper', matchScore: 92, status: 'AI Shortlisted', appliedDate: '2 days ago' },
        { id: '2', name: 'Jordan Lee', matchScore: 88, status: 'AI Screened', appliedDate: '3 days ago' },
        { id: '3', name: 'Sam Rivera', matchScore: 85, status: 'Pending Review', appliedDate: '1 day ago' },
        { id: '4', name: 'Casey Smith', matchScore: 78, status: 'Pending Review', appliedDate: '4 hours ago' },
        { id: '5', name: 'Morgan Taylor', matchScore: 65, status: 'Rejected', appliedDate: '1 week ago' },
    ];

    return (
        <div className="flex flex-col gap-8 w-full">
            <PageHeader
                title="Senior Frontend Engineer"
                description="Engineering • Remote • Opened Oct 12, 2025"
            >
                <Link href={`${ROUTES.JOB_ROLES}/${jobId}/edit`}>
                    <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Details
                    </Button>
                </Link>
                <Link href={`${ROUTES.RESUMES}/${jobId}`}>
                    <Button className="bg-brand-violet hover:bg-brand-violet/80 text-white shadow-glow-sm border-none">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Resumes
                    </Button>
                </Link>
            </PageHeader>

            <div className="glass-card flex flex-col pt-6 rounded-b-[18px]">
                <div className="px-6 mb-6 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Candidate Pipeline</h3>
                        <p className="text-sm text-white/50">Manage applicants and view AI match scores for this specific role.</p>
                    </div>
                    <Button variant="ghost" className="text-brand-lavender hover:text-white hover:bg-brand-violet/20 h-9">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Candidate
                    </Button>
                </div>

                <DataTable
                    data={mockCandidates.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                    totalItems={mockCandidates.length}
                    onSearch={setSearchTerm}
                    searchPlaceholder="Search candidates..."
                    columns={[
                        {
                            header: 'Candidate Name',
                            cell: (row) => <div className="font-semibold text-white group-hover:text-brand-lavender transition-colors cursor-pointer">{row.name}</div>
                        },
                        {
                            header: 'AI Match Score',
                            cell: (row) => (
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "font-bold",
                                        row.matchScore >= 90 ? "text-emerald-400" : row.matchScore >= 80 ? "text-amber-400" : "text-white/60"
                                    )}>
                                        {row.matchScore}%
                                    </span>
                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full", row.matchScore >= 90 ? "bg-emerald-400" : row.matchScore >= 80 ? "bg-amber-400" : "bg-white/40")}
                                            style={{ width: `${row.matchScore}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: 'Status',
                            cell: (row) => (
                                <span className={cn(
                                    "px-2.5 py-1 text-xs font-semibold rounded-full border",
                                    row.status === 'AI Shortlisted' ? "badge-shortlisted" :
                                        row.status === 'AI Screened' ? "badge-interviewed" :
                                            row.status === 'Pending Review' ? "bg-white/10 text-white/70 border-white/20" :
                                                "badge-rejected"
                                )}>
                                    {row.status}
                                </span>
                            )
                        },
                        {
                            header: 'Applied',
                            accessorKey: 'appliedDate',
                            className: "text-white/50 text-right"
                        },
                    ]}
                />
            </div>
        </div>
    );
}

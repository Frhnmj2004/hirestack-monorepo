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

    const MOCK_JOBS: Record<string, { title: string; department: string; location: string; openedAt: string }> = {
        '1': { title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', openedAt: 'Oct 12, 2025' },
        '2': { title: 'UX Designer', department: 'Design', location: 'New York, NY', openedAt: 'Oct 15, 2025' },
        '3': { title: 'Backend Developer', department: 'Engineering', location: 'London, UK', openedAt: 'Oct 18, 2025' },
        '4': { title: 'Product Manager', department: 'Product', location: 'Remote', openedAt: 'Oct 20, 2025' },
        '5': { title: 'Data Scientist', department: 'Data', location: 'San Francisco, CA', openedAt: 'Nov 02, 2025' }
    };

    const job = MOCK_JOBS[jobId] || { title: `Job Role #${jobId}`, department: 'Department', location: 'Location', openedAt: 'Recent' };

    const mockCandidates = [
        { id: '1', name: 'Alex Harper', matchScore: 92, status: 'AI Shortlisted', appliedDate: '2 days ago' },
        { id: '2', name: 'Jordan Lee', matchScore: 88, status: 'AI Screened', appliedDate: '3 days ago' },
        { id: '3', name: 'Sam Rivera', matchScore: 85, status: 'Pending Review', appliedDate: '1 day ago' },
        { id: '4', name: 'Casey Smith', matchScore: 78, status: 'Pending Review', appliedDate: '4 hours ago' },
        { id: '5', name: 'Morgan Taylor', matchScore: 65, status: 'Rejected', appliedDate: '1 week ago' },
    ];

    return (
        <div className="flex flex-col gap-8 w-full animate-fade-in">
            <PageHeader
                title={job.title}
                description={`${job.department} • ${job.location} • Opened ${job.openedAt}`}
            >
                <Link href={`${ROUTES.JOB_ROLES}/${jobId}/edit`}>
                    <Button variant="outline" className="text-brand-light-textPrimary border-[#E6E6F0] hover:bg-black/5 hover:text-brand-violet transition-colors rounded-xl font-medium h-10">
                        <Pencil className="w-4 h-4 mr-2 text-brand-light-textSecondary" />
                        Edit Details
                    </Button>
                </Link>
                <Link href={`${ROUTES.RESUMES}/${jobId}`}>
                    <Button className="btn-primary h-10 rounded-xl px-5 text-sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Resumes
                    </Button>
                </Link>
            </PageHeader>

            <div className="glass-card flex flex-col pt-6">
                <div className="px-6 mb-6 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-bold text-brand-light-textPrimary mb-1">Candidate Pipeline</h3>
                        <p className="text-sm text-brand-light-textSecondary">Manage applicants and view AI match scores for this specific role.</p>
                    </div>
                    <Button variant="ghost" className="text-brand-violet hover:text-brand-violet hover:bg-brand-violet/10 h-9 transition-colors rounded-xl text-sm font-semibold px-4">
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
                            cell: (row) => <div className="font-semibold text-brand-light-textPrimary hover:text-brand-violet transition-colors cursor-pointer">{row.name}</div>
                        },
                        {
                            header: 'AI Match Score',
                            cell: (row) => (
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "font-bold text-sm",
                                        row.matchScore >= 90 ? "text-emerald-500" : row.matchScore >= 80 ? "text-amber-500" : "text-brand-light-textSecondary"
                                    )}>
                                        {row.matchScore}%
                                    </span>
                                    <div className="w-24 h-2 bg-black/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full", row.matchScore >= 90 ? "bg-emerald-500" : row.matchScore >= 80 ? "bg-amber-500" : "bg-[#E6E6F0]")}
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
                                    "px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full border",
                                    row.status === 'AI Shortlisted' ? "bg-brand-violet/10 text-brand-violet border-brand-violet/20" :
                                        row.status === 'AI Screened' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                            row.status === 'Pending Review' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                )}>
                                    {row.status}
                                </span>
                            )
                        },
                        {
                            header: 'Applied',
                            accessorKey: 'appliedDate',
                            className: "text-brand-light-textSecondary text-right text-xs font-medium"
                        },
                    ]}
                />
            </div>
        </div>
    );
}

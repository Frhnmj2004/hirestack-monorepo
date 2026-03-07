import { PageHeader } from '@/components/layout/PageHeader';
import { JobRoleCard } from '@/components/features/job-roles/JobRoleCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

// Mock Data
const MOCK_JOBS = [
    { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', status: 'Open', candidateCount: 142, createdAt: 'Oct 12, 2025' },
    { id: '2', title: 'Product Design Lead', department: 'Design', location: 'New York, NY', status: 'Open', candidateCount: 84, createdAt: 'Nov 02, 2025' },
    { id: '3', title: 'Backend Software Developer', department: 'Engineering', location: 'San Francisco, CA', status: 'Open', candidateCount: 201, createdAt: 'Jan 15, 2026' },
    { id: '4', title: 'Director of Marketing', department: 'Marketing', location: 'London, UK', status: 'Draft', candidateCount: 0, createdAt: 'Feb 20, 2026' },
    { id: '5', title: 'Data Scientist', department: 'Data', location: 'Remote', status: 'Closed', candidateCount: 312, createdAt: 'Sep 05, 2025' },
] as const;

export default function JobRolesPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Job Roles"
                description="Manage your open positions, job descriptions, and view active candidate pools."
            >
                <Link href={`${ROUTES.JOB_ROLES}/create`}>
                    <Button
                        className="rounded-xl text-sm font-semibold text-white h-10 px-4 transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #5A46DA 0%, #7B6CFF 100%)',
                            boxShadow: '0 4px 15px rgba(90,70,218,0.35)',
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Role
                    </Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {MOCK_JOBS.map((job) => (
                    <JobRoleCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    );
}

import { PageHeader } from '@/components/layout/PageHeader';
import { JobRoleCard } from '@/components/features/job-roles/JobRoleCard';

// Using the same JobRoleCard since Resume Shortlists are grouped by Job Role
const MOCK_ACTIVE_SHORTLISTS = [
    { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', status: 'Open', candidateCount: 142, createdAt: 'Oct 12, 2025' },
    { id: '2', title: 'Product Design Lead', department: 'Design', location: 'New York, NY', status: 'Open', candidateCount: 84, createdAt: 'Nov 02, 2025' },
    { id: '3', title: 'Backend Software Developer', department: 'Engineering', location: 'San Francisco, CA', status: 'Open', candidateCount: 201, createdAt: 'Jan 15, 2026' },
] as const;

export default function ResumeShortlistPage() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <PageHeader
                title="Resume Shortlists"
                description="Select an active job role to process new resumes or review the AI-ranked candidate shortlists."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {MOCK_ACTIVE_SHORTLISTS.map((job) => (
                    <JobRoleCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    );
}

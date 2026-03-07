import { PageHeader } from '@/components/layout/PageHeader';
import { JobRoleCard } from '@/components/features/job-roles/JobRoleCard';
import { StatCard } from '@/components/shared/StatCard';
import { Users, CheckCircle2, Video, TrendingUp } from 'lucide-react';

const MOCK_JOBS = [
    { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', status: 'Closed', candidateCount: 142, createdAt: 'Oct 12, 2025' },
    { id: '2', title: 'Product Design Lead', department: 'Design', location: 'New York, NY', status: 'Open', candidateCount: 84, createdAt: 'Nov 02, 2025' },
] as const;

export default function ReportsIndexPage() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <PageHeader
                title="Analytics & Reports"
                description="High-level insights across all hiring campaigns and detailed candidate comparisons by role."
            />

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Candidates" value="8,405" icon={<Users className="w-5 h-5" />} trend={{ value: 12, isPositive: true }} />
                <StatCard title="AI Interviews Completed" value="386" icon={<Video className="w-5 h-5" />} trend={{ value: 5, isPositive: true }} />
                <StatCard title="Hires Output" value="42" icon={<CheckCircle2 className="w-5 h-5" />} trend={{ value: 2, isPositive: false }} />
                <StatCard title="Avg Time to Hire" value="14 Days" icon={<TrendingUp className="w-5 h-5" />} trend={{ value: 18, isPositive: true }} />
            </div>

            <div>
                <h3 className="text-xl font-bold text-brand-light-textPrimary dark:text-white mb-6">Job Specific Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_JOBS.map((job) => (
                        <div key={job.id} className="relative group">
                            <JobRoleCard job={job} />
                            {/* Overlay link to route to specific report instead of manage role */}
                            <a href={`/reports/${job.id}`} className="absolute inset-0 z-10" aria-label={`View report for ${job.title}`}></a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

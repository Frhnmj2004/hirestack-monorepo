import { PageHeader } from '@/components/layout/PageHeader';
import { MetricsRow } from '@/components/features/dashboard/MetricsRow';
import { PipelineOverview } from '@/components/features/dashboard/PipelineOverview';
import { RecentActivity } from '@/components/features/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <PageHeader
                title="Dashboard overview"
                description="Monitor your hiring pipeline and recent platform activity."
            >
                <Button className="bg-brand-violet hover:bg-brand-violet/80 text-white border-none shadow-glow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job Role
                </Button>
            </PageHeader>

            <MetricsRow />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PipelineOverview />
                <RecentActivity />
            </div>
        </div>
    );
}

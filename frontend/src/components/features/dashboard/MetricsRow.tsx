import { Users, Briefcase, Video, FileText } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

export function MetricsRow() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Active Candidates"
                value="1,248"
                icon={<Users className="w-5 h-5" />}
                trend={{ value: 12, isPositive: true }}
            />

            <StatCard
                title="Open Roles"
                value="24"
                icon={<Briefcase className="w-5 h-5" />}
                trend={{ value: 4, isPositive: true }}
            />

            <StatCard
                title="AI Interviews Conducted"
                value="386"
                icon={<Video className="w-5 h-5" />}
                trend={{ value: 28, isPositive: true }}
            />

            <StatCard
                title="Resumes Processed"
                value="8,405"
                icon={<FileText className="w-5 h-5" />}
            />
        </div>
    );
}

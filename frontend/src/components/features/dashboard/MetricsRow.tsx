import { Users, Briefcase, Video, FileText, Star, Clock } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

export function MetricsRow() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
                title="Active Candidates"
                value="1,248"
                icon={<Users className="w-4 h-4" />}
                trend={{ value: 12, isPositive: true, label: 'vs last month' }}
                variant="violet"
            />

            <StatCard
                title="Open Roles"
                value="24"
                icon={<Briefcase className="w-4 h-4" />}
                trend={{ value: 4, isPositive: true, label: 'new this week' }}
                variant="sky"
            />

            <StatCard
                title="AI Interviews"
                value="386"
                icon={<Video className="w-4 h-4" />}
                trend={{ value: 28, isPositive: true, label: 'vs last month' }}
                variant="emerald"
            />

            <StatCard
                title="Resumes Processed"
                value="8,405"
                icon={<FileText className="w-4 h-4" />}
                trend={{ value: 34, isPositive: true, label: 'this cycle' }}
                variant="rose"
            />

            <StatCard
                title="Avg. Match Score"
                value="78%"
                icon={<Star className="w-4 h-4" />}
                trend={{ value: 5, isPositive: true, label: 'AI accuracy up' }}
                variant="amber"
            />

            <StatCard
                title="Time to Hire"
                value="11d"
                icon={<Clock className="w-4 h-4" />}
                trend={{ value: 18, isPositive: true, label: 'faster than avg' }}
                variant="violet"
            />
        </div>
    );
}

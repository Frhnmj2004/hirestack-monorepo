import { Building2, MapPin, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface JobRole {
    id: string;
    title: string;
    department: string;
    location: string;
    status: 'Open' | 'Closed' | 'Draft';
    candidateCount: number;
    createdAt: string;
}

export function JobRoleCard({ job }: { job: JobRole }) {
    const isClosed = job.status === 'Closed';

    return (
        <div className={cn("glow-card p-6 flex flex-col justify-between h-full group", isClosed && "opacity-60")}>
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-brand-light-textPrimary dark:text-white group-hover:text-brand-violet dark:group-hover:text-brand-lavender transition-colors">
                        {job.title}
                    </h3>
                    <span className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-full border",
                        job.status === 'Open' ? "badge-active" :
                            job.status === 'Draft' ? "bg-black/5 dark:bg-white/10 text-brand-light-textSecondary dark:text-white/70 border-brand-gray dark:border-white/20" :
                                "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20"
                    )}>
                        {job.status}
                    </span>
                </div>

                <div className="space-y-2 mb-6 text-sm text-brand-light-textSecondary dark:text-white/60">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 shrink-0" />
                        <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>Opened {job.createdAt}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brand-gray dark:border-white/10">
                <div className="flex items-center gap-2 text-sm text-brand-light-textSecondary dark:text-white/50">
                    <Users className="w-4 h-4 text-brand-violet dark:text-brand-lavender" />
                    <span><strong className="text-brand-light-textPrimary dark:text-white font-medium">{job.candidateCount}</strong> candidates</span>
                </div>

                <Link href={`${ROUTES.JOB_ROLES}/${job.id}`}>
                    <Button variant="ghost" className="text-brand-violet dark:text-brand-lavender hover:text-brand-violet dark:hover:text-white hover:bg-brand-violet/10 dark:hover:bg-brand-violet/20 h-8 px-3 text-xs">
                        Manage Role
                    </Button>
                </Link>
            </div>
        </div>
    );
}

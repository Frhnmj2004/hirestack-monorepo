import { Building2, MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
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
        <div
            className={cn("p-6 rounded-2xl flex flex-col justify-between h-full group transition-all duration-300 hover:-translate-y-1", isClosed && "opacity-60")}
            style={{
                background: 'rgba(255,255,255,0.70)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '6px solid rgba(255,255,255,0.45)',
                backgroundClip: 'padding-box',
                boxShadow: '0 8px 32px rgba(90,70,218,0.07)',
            }}
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-brand-light-textPrimary group-hover:text-brand-violet transition-colors">
                        {job.title}
                    </h3>
                    <span className={cn(
                        "px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full border",
                        job.status === 'Open' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            job.status === 'Draft' ? "bg-black/5 text-brand-light-textSecondary border-gray-200" :
                                "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    )}>
                        {job.status}
                    </span>
                </div>

                <div className="space-y-2.5 mb-6 text-xs text-brand-light-textSecondary">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Opened {job.createdAt}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(230,230,240,0.8)' }}>
                <div className="flex items-center gap-2 text-sm text-brand-light-textSecondary">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-violet/10">
                        <Users className="w-4 h-4 text-brand-violet" />
                    </div>
                    <span><strong className="text-brand-light-textPrimary font-semibold">{job.candidateCount}</strong> candidates</span>
                </div>

                <Link href={`${ROUTES.JOB_ROLES}/${job.id}`}>
                    <Button variant="ghost" className="text-brand-violet hover:text-brand-violet hover:bg-brand-violet/10 h-8 px-3 text-xs gap-1 transition-all">
                        Manage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

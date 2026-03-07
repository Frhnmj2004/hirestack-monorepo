import { Video, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface Interview {
    id: string;
    candidateName: string;
    jobTitle: string;
    date: string;
    duration: string;
    status: 'Completed' | 'Scheduled' | 'In Progress';
    score?: number;
}

export function InterviewCard({ interview }: { interview: Interview }) {
    const isCompleted = interview.status === 'Completed';

    return (
        <div className={cn("glow-card p-6 flex flex-col justify-between h-full group", !isCompleted && "opacity-80")}>
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border",
                            isCompleted ? "bg-brand-violet/20 border-brand-violet/30 text-brand-violet dark:text-brand-lavender shadow-glow-sm" : "bg-black/5 dark:bg-white/5 border-brand-gray dark:border-white/10 text-brand-light-textSecondary/40 dark:text-white/40"
                        )}>
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-brand-light-textPrimary dark:text-white group-hover:text-brand-violet dark:group-hover:text-brand-lavender transition-colors truncate">
                                {interview.candidateName}
                            </h3>
                            <p className="text-sm text-brand-light-textSecondary dark:text-white/50">{interview.jobTitle}</p>
                        </div>
                    </div>
                    <span className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-full border",
                        interview.status === 'Completed' ? "badge-active" :
                            interview.status === 'In Progress' ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10" :
                                "bg-black/5 dark:bg-white/5 text-brand-light-textSecondary dark:text-white/50 border-brand-gray dark:border-white/10"
                    )}>
                        {interview.status}
                    </span>
                </div>

                <div className="space-y-2 mb-6 text-sm text-brand-light-textSecondary dark:text-white/60">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>{interview.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{interview.duration}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brand-gray dark:border-white/10">
                <div className="flex items-center gap-2 text-sm">
                    {isCompleted && interview.score ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-brand-light-textSecondary dark:text-white/60">Score: <strong className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">{interview.score}/100</strong></span>
                        </>
                    ) : (
                        <span className="text-brand-light-textSecondary/40 dark:text-white/40 italic">Pending evaluation</span>
                    )}
                </div>

                <Link href={`${ROUTES.INTERVIEWS}/${interview.id}`}>
                    <Button variant="ghost" className="text-brand-violet dark:text-brand-lavender hover:text-brand-violet dark:hover:text-white hover:bg-brand-violet/10 dark:hover:bg-brand-violet/20 h-8 px-3 text-xs">
                        {isCompleted ? 'View Results' : 'Manage'}
                    </Button>
                </Link>
            </div>
        </div>
    );
}

import { Video, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
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
        <div
            className={cn("p-6 rounded-2xl flex flex-col justify-between h-full group transition-all duration-300 hover:-translate-y-1", !isCompleted && "opacity-80")}
            style={{
                background: 'rgba(255,255,255,0.70)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '10px solid rgba(255,255,255,0.45)',
                backgroundClip: 'padding-box',
                boxShadow: '0 8px 32px rgba(90,70,218,0.07)',
            }}
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            isCompleted ? "bg-brand-violet/15 text-brand-violet" : "bg-black/5 text-brand-light-textSecondary/40"
                        )}>
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-brand-light-textPrimary group-hover:text-brand-violet transition-colors truncate">
                                {interview.candidateName}
                            </h3>
                            <p className="text-xs text-brand-light-textSecondary">{interview.jobTitle}</p>
                        </div>
                    </div>
                    <span className={cn(
                        "px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full border",
                        interview.status === 'Completed' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            interview.status === 'In Progress' ? "border-amber-500/20 text-amber-600 bg-amber-500/10" :
                                "bg-black/5 text-brand-light-textSecondary border-gray-200"
                    )}>
                        {interview.status}
                    </span>
                </div>

                <div className="space-y-2.5 mb-6 text-xs text-brand-light-textSecondary">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{interview.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{interview.duration}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(230,230,240,0.8)' }}>
                <div className="flex items-center gap-2 text-sm">
                    {isCompleted && interview.score ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-brand-light-textSecondary">
                                Score: <strong className="text-emerald-600 font-bold ml-1">{interview.score}/100</strong>
                            </span>
                        </>
                    ) : (
                        <span className="text-brand-light-textSecondary/40 italic">Pending evaluation</span>
                    )}
                </div>

                <Link href={`${ROUTES.INTERVIEWS}/${interview.id}`}>
                    <Button variant="ghost" className="text-brand-violet hover:text-brand-violet hover:bg-brand-violet/10 h-8 px-3 text-xs gap-1 transition-all">
                        {isCompleted ? 'View Results' : 'Manage'}
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

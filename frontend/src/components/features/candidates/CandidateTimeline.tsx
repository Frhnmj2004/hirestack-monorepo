import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    status: 'completed' | 'current' | 'upcoming';
}

export function CandidateTimeline({ events }: { events: TimelineEvent[] }) {
    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-6">Hiring Timeline</h3>

            <div className="space-y-6">
                {events.map((event, idx) => {
                    const isCompleted = event.status === 'completed';
                    const isCurrent = event.status === 'current';

                    return (
                        <div key={event.id} className="relative pl-6">
                            {/* Connector line */}
                            {idx !== events.length - 1 && (
                                <div className={cn(
                                    "absolute left-2.5 top-6 bottom-[-1.5rem] w-[2px]",
                                    isCompleted ? "bg-brand-violet" : "bg-white/10"
                                )} />
                            )}

                            {/* Node */}
                            <div className="absolute left-[3px] top-1">
                                {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-brand-violet bg-brand-midnight rounded-full" />
                                ) : isCurrent ? (
                                    <Clock className="w-4 h-4 text-amber-400 bg-brand-midnight rounded-full" />
                                ) : (
                                    <Circle className="w-4 h-4 text-white/20 bg-brand-midnight rounded-full" />
                                )}
                            </div>

                            {/* Content */}
                            <div className={cn("flex flex-col gap-1", !isCompleted && !isCurrent && "opacity-50")}>
                                <div className="flex items-center justify-between">
                                    <h4 className={cn("text-sm font-semibold", isCurrent ? "text-amber-400" : "text-white")}>
                                        {event.title}
                                    </h4>
                                    <span className="text-xs text-white/50">{event.date}</span>
                                </div>
                                <p className="text-sm text-white/60">{event.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

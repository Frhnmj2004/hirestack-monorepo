import { Mail, Phone, MapPin, Linkedin, Github, Globe, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CandidateProfileProps {
    candidate: {
        name: string;
        role: string;
        location: string;
        email: string;
        phone: string;
        matchScore: number;
        skills: string[];
        summary: string;
    };
}

export function CandidateProfileCard({ candidate }: CandidateProfileProps) {
    return (
        <div className="glass-card p-6 flex flex-col md:flex-row gap-8">
            {/* Left side: Basic Info */}
            <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                        {/* Avatar placeholder */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-violet to-brand-royal flex items-center justify-center text-xl font-bold text-white shadow-glow-sm">
                            {candidate.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-brand-light-textPrimary dark:text-white tracking-tight">{candidate.name}</h2>
                            <p className="text-brand-violet dark:text-brand-lavender font-medium">{candidate.role}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-xs text-brand-light-textSecondary dark:text-white/50 uppercase tracking-widest font-semibold mb-1">Match Score</span>
                        <div className="flex items-center gap-2">
                            <Star className={cn("w-5 h-5", candidate.matchScore >= 90 ? "text-emerald-500 fill-emerald-500" : "text-amber-500 fill-amber-500")} />
                            <span className="text-3xl font-bold text-brand-light-textPrimary dark:text-white">{candidate.matchScore}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-brand-light-textSecondary dark:text-white/70 mb-6 border-y border-brand-gray dark:border-white/5 py-6">
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-brand-light-textSecondary/40 dark:text-white/40" />
                        <a href={`mailto:${candidate.email}`} className="hover:text-brand-violet dark:hover:text-white transition-colors">{candidate.email}</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-brand-light-textSecondary/40 dark:text-white/40" />
                        <span>{candidate.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-brand-light-textSecondary/40 dark:text-white/40" />
                        <span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Linkedin className="w-4 h-4 text-brand-light-textSecondary/40 dark:text-white/40" />
                        <a href="#" className="hover:text-brand-violet dark:hover:text-white transition-colors">LinkedIn Profile</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Github className="w-4 h-4 text-brand-light-textSecondary/40 dark:text-white/40" />
                        <a href="#" className="hover:text-brand-violet dark:hover:text-white transition-colors">GitHub Profile</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-brand-light-textSecondary/40 dark:text-white/40" />
                        <a href="#" className="hover:text-brand-violet dark:hover:text-white transition-colors">Portfolio</a>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-brand-light-textPrimary dark:text-white mb-2 text-sm uppercase tracking-wider">AI Extracted Summary</h3>
                    <p className="text-sm text-brand-light-textSecondary dark:text-white/60 leading-relaxed mb-6">
                        {candidate.summary}
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold text-brand-light-textPrimary dark:text-white mb-3 text-sm uppercase tracking-wider">Top Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {candidate.skills.map(skill => (
                            <span key={skill} className="px-3 py-1 bg-brand-violet/5 dark:bg-white/5 border border-brand-violet/20 dark:border-white/10 rounded-full text-xs text-brand-violet dark:text-brand-lavender font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side: Actions */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
                <Button className="w-full bg-brand-violet hover:bg-brand-violet/80 text-white shadow-glow-sm">
                    Schedule Interview
                </Button>
                <Button variant="outline" className="w-full border-brand-gray dark:border-white/20 text-brand-light-textPrimary dark:text-white hover:bg-black/5 dark:hover:bg-white/10">
                    Download Resume
                </Button>
                <div className="h-[1px] bg-brand-gray dark:bg-white/10 my-2"></div>
                <Button variant="ghost" className="w-full text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10">
                    Move to Offer
                </Button>
                <Button variant="ghost" className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10">
                    Reject Candidate
                </Button>
            </div>
        </div>
    );
}

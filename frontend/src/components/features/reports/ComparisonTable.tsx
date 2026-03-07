import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CandidateComparison {
    id: string;
    name: string;
    matchScore: number;
    technical: number;
    cultural: number;
    experience: 'Exceeds' | 'Meets' | 'Below';
    redFlags: number;
}

export function ComparisonTable({ candidates }: { candidates: CandidateComparison[] }) {
    // Sort by match score descending
    const sorted = [...candidates].sort((a, b) => b.matchScore - a.matchScore);

    return (
        <div className="w-full overflow-x-auto glass-card border-white/60 dark:border-white/10 p-0">
            <table className="w-full text-left text-sm text-white">
                <thead className="bg-brand-indigo uppercase tracking-wider text-xs font-semibold text-white/70">
                    <tr>
                        <th className="px-6 py-4 rounded-tl-[24px] border-b border-white/10">Candidate</th>
                        <th className="px-6 py-4 border-b border-white/10 text-center">Match Score</th>
                        <th className="px-6 py-4 border-b border-white/10 text-center">Technical Fit</th>
                        <th className="px-6 py-4 border-b border-white/10 text-center">Cultural Fit</th>
                        <th className="px-6 py-4 border-b border-white/10 text-center">Exp. Req.</th>
                        <th className="px-6 py-4 border-b border-white/10 text-center">Ref. Checks</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-brand-midnight/40">
                    {sorted.map((c, idx) => (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 font-bold">
                                <span className="flex items-center gap-2">
                                    {idx === 0 && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                                    {c.name}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center text-emerald-400 font-bold">{c.matchScore}%</td>
                            <td className="px-6 py-4 text-center">{c.technical}/100</td>
                            <td className="px-6 py-4 text-center">{c.cultural}/100</td>
                            <td className="px-6 py-4 text-center">
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-medium",
                                    c.experience === 'Exceeds' ? "bg-emerald-500/10 text-emerald-400" :
                                        c.experience === 'Meets' ? "bg-white/10 text-white/70" :
                                            "bg-amber-500/10 text-amber-400"
                                )}>
                                    {c.experience}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center flex-col items-center">
                                    {c.redFlags === 0 ? (
                                        <Check className="w-4 h-4 text-white/40" />
                                    ) : (
                                        <span className="text-red-400 text-xs font-bold">{c.redFlags} Flag(s)</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

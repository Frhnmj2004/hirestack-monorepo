'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { LiveSessionBanner } from '@/components/features/interviews/LiveSessionBanner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, FileText } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useParams } from 'next/navigation';

export default function InterviewDetailPage() {
    const params = useParams();
    const interviewId = params.id as string;

    // Simulate a live session if ID is 3 for demonstration
    const isLive = interviewId === '3';

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
            <Link href={ROUTES.INTERVIEWS} className="inline-flex items-center text-sm text-brand-lavender hover:text-white transition-colors w-max">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Interviews
            </Link>

            {isLive && <LiveSessionBanner />}

            <PageHeader
                title="Interview Results: Alex Harper"
                description="Senior Frontend Engineer • Conducted Oct 14, 2025 • 15 minutes"
            >
                <Link href={`${ROUTES.INTERVIEWS}/${interviewId}/transcript`}>
                    <Button className="bg-brand-violet hover:bg-brand-violet/80 text-white shadow-glow-sm border-none">
                        <FileText className="w-4 h-4 mr-2" />
                        Full Transcript
                    </Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Col: Overview */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-card p-6 flex flex-col items-center text-center">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">AI Assessment Score</h3>
                        <div className="text-5xl font-extrabold text-emerald-400 mb-2">94<span className="text-2xl text-white/40">/100</span></div>
                        <p className="text-sm text-emerald-400/80 font-medium">Strong Hire Recommendation</p>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold text-white mb-4">Interview Recording</h3>
                        <div className="aspect-video bg-black/50 border border-white/10 rounded-xl flex items-center justify-center relative group cursor-pointer overflow-hidden">
                            <div className="absolute inset-0 bg-brand-violet/10 group-hover:bg-brand-violet/20 transition-colors"></div>
                            <Play className="w-12 h-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all relative z-10" />
                        </div>
                    </div>
                </div>

                {/* Right Col: Details */}
                <div className="md:col-span-2 glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4">AI Evaluation Summary</h3>
                    <div className="space-y-4 mb-8">
                        <p className="text-white/70 leading-relaxed text-sm">
                            Alex provided comprehensive, highly technical answers to React architecture questions. When challenged on state management trade-offs between Redux, Zustand, and Context, Alex articulated clear, context-aware decisions supported by past experience.
                        </p>
                        <p className="text-white/70 leading-relaxed text-sm">
                            The candidate demonstrated excellent communication skills and stayed calm during the technical pressure-test scenarios. Wait times before answering were brief, indicating strong domain mastery.
                        </p>
                    </div>

                    <h3 className="font-bold text-white mb-4">Competency Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Technical Accuracy', score: 95 },
                            { label: 'Communication Clarity', score: 92 },
                            { label: 'Problem Solving', score: 98 },
                            { label: 'Role Fit', score: 90 },
                        ].map((comp, idx) => (
                            <div key={idx} className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/80">{comp.label}</span>
                                    <span className="font-bold text-white">{comp.score}/100</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-lavender/80" style={{ width: `${comp.score}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

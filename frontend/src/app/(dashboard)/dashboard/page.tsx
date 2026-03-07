import Link from 'next/link';
import { Plus, ArrowRight, Users, Briefcase, Video, FileText, Star, Clock } from 'lucide-react';
import { HeroStatCard } from '@/components/features/dashboard/HeroStatCard';
import { PipelineOverview } from '@/components/features/dashboard/PipelineOverview';
import { RecentActivity } from '@/components/features/dashboard/RecentActivity';
import { AIInsightsWidget } from '@/components/features/dashboard/AIInsightsWidget';
import { HiringVelocityChart } from '@/components/features/dashboard/HiringVelocityChart';
import { StatCard } from '@/components/shared/StatCard';
import { ROUTES } from '@/lib/constants';

const glassCard = {
    background: 'rgba(255,255,255,0.70)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '10px solid rgba(255,255,255,0.45)',
    backgroundClip: 'padding-box',
    boxShadow: '0 8px 32px rgba(90,70,218,0.07)',
} as const;

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">

            {/* ── Page header ─────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-violet mb-1">Overview</p>
                    <h1 className="text-2xl font-bold tracking-tight text-brand-light-textPrimary">Hiring Dashboard</h1>
                    <p className="text-sm text-brand-light-textSecondary mt-0.5">
                        Monitor your pipeline and candidate activity.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        href={ROUTES.REPORTS}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{ color: '#5A46DA', background: 'rgba(90,70,218,0.07)', border: '1px solid rgba(90,70,218,0.15)' }}
                    >
                        Reports <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                        href={`${ROUTES.JOB_ROLES}/create`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{
                            background: 'linear-gradient(135deg, #5A46DA 0%, #7B6CFF 100%)',
                            boxShadow: '0 4px 15px rgba(90,70,218,0.35)',
                        }}
                    >
                        <Plus className="w-4 h-4" /> New Job Role
                    </Link>
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                BENTO GRID — SECTION 1  (top priority)
                Layout (3 cols):
                  [  Hero dark (AI Interviews)  ] [ Open Roles ] [ Active Candidates ]
                  [  Hiring Velocity (2 cols)   ]               [ AI Insights        ]
            ══════════════════════════════════════════════ */}
            <div
                className="grid gap-4"
                style={{
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'auto auto',
                }}
            >
                {/* ① Hero dark — AI Interviews this month */}
                <div style={{ gridColumn: '1', gridRow: '1', minHeight: 200 }}>
                    <HeroStatCard
                        label="AI Interviews This Month"
                        value="386"
                        sub="Total screened by HireLens AI"
                        trend={{ value: 28, isPositive: true }}
                        dark
                    />
                </div>

                {/* ② Open Roles */}
                <div style={{ gridColumn: '2', gridRow: '1', minHeight: 200 }}>
                    <HeroStatCard
                        label="Open Roles"
                        value="24"
                        sub="Active hiring positions"
                        trend={{ value: 4, isPositive: true }}
                    />
                </div>

                {/* ③ Active Candidates */}
                <div style={{ gridColumn: '3', gridRow: '1', minHeight: 200 }}>
                    <HeroStatCard
                        label="Active Candidates"
                        value="1,248"
                        sub="In pipeline right now"
                        trend={{ value: 12, isPositive: true }}
                    />
                </div>

                {/* ④ Hiring Velocity — spans 2 cols */}
                <div style={{ gridColumn: '1 / span 2', gridRow: '2' }}>
                    <HiringVelocityChart />
                </div>

                {/* ⑤ AI Insights — 1 col */}
                <div style={{ gridColumn: '3', gridRow: '2' }}>
                    <AIInsightsWidget />
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                BENTO GRID — SECTION 2  (pipeline + activity)
                2 equal cols
            ══════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 gap-4">
                <PipelineOverview />
                <RecentActivity />
            </div>

            {/* ══════════════════════════════════════════════
                SECTION 3 — All-time / secondary stats
                (moved to bottom, smaller cards)
            ══════════════════════════════════════════════ */}
            <div>
                {/* Section label */}
                <div className="flex items-center gap-3 mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-light-textSecondary/70">
                        All-time statistics
                    </p>
                    <div className="flex-1 h-px" style={{ background: 'rgba(90,70,218,0.12)' }} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        title="Resumes Processed"
                        value="8,405"
                        icon={<FileText className="w-4 h-4" />}
                        trend={{ value: 34, isPositive: true, label: 'this cycle' }}
                        variant="violet"
                    />
                    <StatCard
                        title="Avg. Match Score"
                        value="78%"
                        icon={<Star className="w-4 h-4" />}
                        trend={{ value: 5, isPositive: true, label: 'AI accuracy' }}
                        variant="violet"
                    />
                    <StatCard
                        title="Time to Hire"
                        value="11 days"
                        icon={<Clock className="w-4 h-4" />}
                        trend={{ value: 18, isPositive: true, label: 'faster than avg' }}
                        variant="violet"
                    />
                    <StatCard
                        title="Total Hires Made"
                        value="42"
                        icon={<Users className="w-4 h-4" />}
                        trend={{ value: 7, isPositive: true, label: 'this quarter' }}
                        variant="violet"
                    />
                </div>
            </div>

        </div>
    );
}

import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { MetricsRow } from '@/components/features/dashboard/MetricsRow';
import { PipelineOverview } from '@/components/features/dashboard/PipelineOverview';
import { RecentActivity } from '@/components/features/dashboard/RecentActivity';
import { AIInsightsWidget } from '@/components/features/dashboard/AIInsightsWidget';
import { HiringVelocityChart } from '@/components/features/dashboard/HiringVelocityChart';
import { ROUTES } from '@/lib/constants';

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">

            {/* ── Page Header ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-violet mb-1">
                        Overview
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-brand-light-textPrimary">
                        Hiring Dashboard
                    </h1>
                    <p className="text-sm text-brand-light-textSecondary mt-1">
                        Monitor your pipeline, AI interviews, and candidate activity.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <Link
                        href={ROUTES.REPORTS}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                            color: '#5A46DA',
                            background: 'rgba(90, 70, 218, 0.06)',
                            border: '1px solid rgba(90, 70, 218, 0.15)',
                        }}
                    >
                        View Reports
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                        href={`${ROUTES.JOB_ROLES}/create`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300"
                        style={{
                            background: 'linear-gradient(135deg, #5A46DA 0%, #7B6CFF 60%, #9B8CFF 100%)',
                            boxShadow: '0 4px 15px rgba(90, 70, 218, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        New Job Role
                    </Link>
                </div>
            </div>

            {/* ── Stat Cards ──────────────────────────────── */}
            <MetricsRow />

            {/* ── Main Content Grid ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Velocity Chart — spans 2 cols */}
                <div className="lg:col-span-2">
                    <HiringVelocityChart />
                </div>

                {/* AI Insights — 1 col */}
                <div className="lg:col-span-1">
                    <AIInsightsWidget />
                </div>
            </div>

            {/* ── Bottom Row ──────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PipelineOverview />
                <RecentActivity />
            </div>

        </div>
    );
}

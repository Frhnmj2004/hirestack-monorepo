'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useUiStore } from '@/store/uiStore';
import {
    LayoutDashboard,
    Briefcase,
    Files,
    Users,
    Video,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

const NAV_GROUPS = [
    {
        label: 'Main',
        items: [
            { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
            { name: 'Job Roles', href: ROUTES.JOB_ROLES, icon: Briefcase },
            { name: 'Resumes', href: ROUTES.RESUMES, icon: Files },
            { name: 'Candidates', href: ROUTES.CANDIDATES, icon: Users },
        ],
    },
    {
        label: 'Intelligence',
        items: [
            { name: 'AI Interviews', href: ROUTES.INTERVIEWS, icon: Video },
            { name: 'Reports', href: ROUTES.REPORTS, icon: BarChart3 },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isSidebarCollapsed, toggleSidebar } = useUiStore();

    return (
        <aside
            className={cn(
                'fixed left-3 top-3 bottom-3 z-40 flex flex-col',
                'transition-all duration-300 ease-in-out',
                isSidebarCollapsed ? 'w-[76px]' : 'w-[256px]'
            )}
            style={{
                /* Glassmorphism */
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.55)',
                boxShadow:
                    '0 8px 32px rgba(90, 70, 218, 0.10), 0 2px 8px rgba(0,0,0,0.04)',
                borderRadius: '20px',
            }}
        >
            {/* ── Logo ─────────────────────────────────── */}
            <div
                className={cn(
                    'flex h-[60px] items-center shrink-0 px-4',
                    isSidebarCollapsed ? 'justify-center' : 'justify-between'
                )}
                style={{
                    borderBottom: '1px solid rgba(230, 230, 240, 0.6)',
                }}
            >
                {isSidebarCollapsed ? (
                    <Link href={ROUTES.DASHBOARD}>
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                                background:
                                    'linear-gradient(135deg, #5A46DA 0%, #9B8CFF 100%)',
                                boxShadow: '0 4px 12px rgba(90,70,218,0.40)',
                            }}
                        >
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                    </Link>
                ) : (
                    <Link
                        href={ROUTES.DASHBOARD}
                        className="flex items-center gap-2.5"
                    >
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                                background:
                                    'linear-gradient(135deg, #5A46DA 0%, #9B8CFF 100%)',
                                boxShadow: '0 4px 12px rgba(90,70,218,0.40)',
                            }}
                        >
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="leading-none">
                            <p className="font-bold text-[15px] tracking-tight text-brand-light-textPrimary">
                                HireLens
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-violet/70 mt-0.5">
                                AI Platform
                            </p>
                        </div>
                    </Link>
                )}
            </div>

            {/* ── Navigation ───────────────────────────── */}
            <div className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2.5 space-y-4">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label}>
                        {!isSidebarCollapsed && (
                            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-violet/50">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={isSidebarCollapsed ? item.name : undefined}
                                        className={cn(
                                            'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer select-none',
                                            isSidebarCollapsed
                                                ? 'justify-center p-2.5'
                                                : 'px-3 py-2.5',
                                            isActive
                                                ? 'text-white'
                                                : 'text-brand-light-textSecondary hover:text-brand-light-textPrimary hover:bg-brand-violet/6'
                                        )}
                                        style={
                                            isActive
                                                ? {
                                                    background:
                                                        'linear-gradient(135deg, #5A46DA 0%, #7B6CFF 100%)',
                                                    boxShadow:
                                                        '0 4px 14px rgba(90,70,218,0.35)',
                                                }
                                                : {}
                                        }
                                    >
                                        <Icon
                                            className={cn(
                                                'w-[18px] h-[18px] shrink-0',
                                                isActive
                                                    ? 'text-white'
                                                    : 'text-brand-light-textSecondary'
                                            )}
                                        />
                                        {!isSidebarCollapsed && (
                                            <span>{item.name}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Bottom ───────────────────────────────── */}
            <div
                className="px-2.5 pb-3 pt-2 space-y-0.5"
                style={{ borderTop: '1px solid rgba(230, 230, 240, 0.6)' }}
            >
                <Link
                    href={ROUTES.SETTINGS}
                    title={isSidebarCollapsed ? 'Settings' : undefined}
                    className={cn(
                        'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                        isSidebarCollapsed
                            ? 'justify-center p-2.5'
                            : 'px-3 py-2.5',
                        pathname.startsWith(ROUTES.SETTINGS)
                            ? 'text-white'
                            : 'text-brand-light-textSecondary hover:text-brand-light-textPrimary hover:bg-brand-violet/6'
                    )}
                    style={
                        pathname.startsWith(ROUTES.SETTINGS)
                            ? {
                                background:
                                    'linear-gradient(135deg, #5A46DA 0%, #7B6CFF 100%)',
                                boxShadow: '0 4px 14px rgba(90,70,218,0.35)',
                            }
                            : {}
                    }
                >
                    <Settings
                        className={cn(
                            'w-[18px] h-[18px] shrink-0',
                            pathname.startsWith(ROUTES.SETTINGS)
                                ? 'text-white'
                                : 'text-brand-light-textSecondary'
                        )}
                    />
                    {!isSidebarCollapsed && <span>Settings</span>}
                </Link>

                {/* Collapse toggle */}
                <button
                    onClick={toggleSidebar}
                    title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className={cn(
                        'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                        'text-brand-light-textSecondary hover:text-brand-violet hover:bg-brand-violet/6',
                        isSidebarCollapsed
                            ? 'justify-center p-2.5'
                            : 'px-3 py-2.5'
                    )}
                >
                    {isSidebarCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}

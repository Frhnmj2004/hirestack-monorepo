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
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col",
                isSidebarCollapsed ? "w-[76px]" : "w-[256px]"
            )}
            style={{
                background: 'var(--sidebar-bg)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRight: '1px solid var(--sidebar-border)',
                boxShadow: '4px 0 24px rgba(90, 70, 218, 0.05)',
            }}
        >
            {/* Logo Area */}
            <div className={cn(
                "flex h-16 items-center border-b transition-all duration-300",
                isSidebarCollapsed ? "px-0 justify-center" : "px-5 justify-between"
            )}
                style={{ borderColor: 'var(--sidebar-border)' }}
            >
                {!isSidebarCollapsed ? (
                    <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2.5 group">
                        {/* Logo mark */}
                        <div className="relative w-8 h-8 flex-shrink-0">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, #5A46DA 0%, #9B8CFF 100%)',
                                    boxShadow: '0 4px 12px rgba(90, 70, 218, 0.4)',
                                }}
                            >
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-bold text-[15px] tracking-tight text-brand-light-textPrimary">
                                HireLens
                            </span>
                            <span className="text-[10px] text-brand-light-textSecondary font-medium tracking-wide uppercase">
                                AI Platform
                            </span>
                        </div>
                    </Link>
                ) : (
                    <Link href={ROUTES.DASHBOARD}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #5A46DA 0%, #9B8CFF 100%)',
                                boxShadow: '0 4px 12px rgba(90, 70, 218, 0.4)',
                            }}
                        >
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                    </Link>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto scrollbar-thin py-5 px-3 space-y-6">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label}>
                        {!isSidebarCollapsed && (
                            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-brand-light-textSecondary/60">
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
                                        className={cn(
                                            "nav-link group relative",
                                            isActive && "active",
                                            isSidebarCollapsed && "justify-center px-0 py-3"
                                        )}
                                        title={isSidebarCollapsed ? item.name : undefined}
                                    >
                                        <Icon className={cn(
                                            "w-[18px] h-[18px] flex-shrink-0 transition-all duration-200",
                                            isActive
                                                ? "text-brand-violet"
                                                : "text-brand-light-textSecondary group-hover:text-brand-light-textPrimary"
                                        )} />
                                        {!isSidebarCollapsed && (
                                            <span className={cn(
                                                "text-sm transition-all duration-200",
                                                isActive ? "text-brand-violet font-semibold" : ""
                                            )}>
                                                {item.name}
                                            </span>
                                        )}
                                        {/* Active indicator dot */}
                                        {isActive && isSidebarCollapsed && (
                                            <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-violet" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Actions */}
            <div
                className="p-3 space-y-0.5"
                style={{ borderTop: '1px solid var(--sidebar-border)' }}
            >
                <Link
                    href={ROUTES.SETTINGS}
                    className={cn(
                        "nav-link group",
                        pathname.startsWith(ROUTES.SETTINGS) && "active",
                        isSidebarCollapsed && "justify-center px-0 py-3"
                    )}
                    title={isSidebarCollapsed ? "Settings" : undefined}
                >
                    <Settings className={cn(
                        "w-[18px] h-[18px] flex-shrink-0",
                        pathname.startsWith(ROUTES.SETTINGS)
                            ? "text-brand-violet"
                            : "text-brand-light-textSecondary group-hover:text-brand-light-textPrimary"
                    )} />
                    {!isSidebarCollapsed && <span>Settings</span>}
                </Link>

                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium",
                        "text-brand-light-textSecondary hover:text-brand-light-textPrimary",
                        "hover:bg-brand-violet/6 transition-all duration-200 cursor-pointer",
                        isSidebarCollapsed && "justify-center px-0"
                    )}
                    title={isSidebarCollapsed ? "Expand" : "Collapse"}
                >
                    {isSidebarCollapsed
                        ? <ChevronRight className="w-4 h-4" />
                        : (
                            <>
                                <ChevronLeft className="w-4 h-4" />
                                <span>Collapse</span>
                            </>
                        )
                    }
                </button>
            </div>
        </aside>
    );
}

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
    BarChart,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
    { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Job Roles', href: ROUTES.JOB_ROLES, icon: Briefcase },
    { name: 'Resumes', href: ROUTES.RESUMES, icon: Files },
    { name: 'Candidates', href: ROUTES.CANDIDATES, icon: Users },
    { name: 'Interviews', href: ROUTES.INTERVIEWS, icon: Video },
    { name: 'Reports', href: ROUTES.REPORTS, icon: BarChart },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isSidebarCollapsed, toggleSidebar } = useUiStore();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-border dark:border-white/10 bg-white/60 dark:bg-brand-midnight/80 backdrop-blur-xl flex flex-col",
                isSidebarCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Logo Area */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border dark:border-white/5">
                {!isSidebarCollapsed && (
                    <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-violet to-brand-lavender flex items-center justify-center shadow-md dark:shadow-glow-sm">
                            <span className="text-white font-bold text-lg leading-none">H</span>
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-brand-light-textPrimary dark:text-white">HireLens</span>
                    </Link>
                )}
                {isSidebarCollapsed && (
                    <div className="w-full flex justify-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-violet to-brand-lavender flex items-center justify-center shadow-md dark:shadow-glow-sm">
                            <span className="text-white font-bold text-lg leading-none">H</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto scrollbar-thin py-6 px-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "nav-link group relative",
                                isActive && "active",
                                isSidebarCollapsed && "justify-center px-0"
                            )}
                            title={isSidebarCollapsed ? item.name : undefined}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-brand-violet dark:text-brand-lavender" : "text-brand-light-textSecondary dark:text-white/50 group-hover:text-brand-light-textPrimary dark:group-hover:text-white/80")} />
                            {!isSidebarCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-border dark:border-white/5 space-y-1">
                <Link
                    href={ROUTES.SETTINGS}
                    className={cn(
                        "nav-link group",
                        pathname.startsWith(ROUTES.SETTINGS) && "active",
                        isSidebarCollapsed && "justify-center px-0"
                    )}
                    title={isSidebarCollapsed ? "Settings" : undefined}
                >
                    <Settings className="w-5 h-5 text-brand-light-textSecondary dark:text-white/50 group-hover:text-brand-light-textPrimary dark:group-hover:text-white/80" />
                    {!isSidebarCollapsed && <span>Settings</span>}
                </Link>

                <button
                    onClick={toggleSidebar}
                    className="w-full nav-link group justify-center text-brand-light-textSecondary dark:text-white/40 hover:text-brand-light-textPrimary dark:hover:text-white/70"
                    title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>
        </aside>
    );
}

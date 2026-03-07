'use client';

import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/TopNavbar';

// Floating sidebar dimensions (including the 12px left margin + 12px gap after)
const SIDEBAR_EXPANDED = 256 + 12 + 12; // 280px
const SIDEBAR_COLLAPSED = 76 + 12 + 12; // 100px
// Topbar height + 12px top margin + 12px gap below
const TOPBAR_OFFSET = 56 + 12 + 12;       // 80px

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSidebarCollapsed } = useUiStore();

    return (
        <div className="min-h-screen">
            {/* Floating Sidebar */}
            <Sidebar />

            {/* Floating Topbar */}
            <Topbar />

            {/* Main content — shifts right of sidebar + topbar */}
            <main
                className={cn(
                    'transition-all duration-300 ease-in-out min-h-screen',
                    isSidebarCollapsed
                        ? `pl-[${SIDEBAR_COLLAPSED}px]`
                        : `pl-[${SIDEBAR_EXPANDED}px]`
                )}
                style={{
                    paddingLeft: isSidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
                    paddingTop: TOPBAR_OFFSET,
                    paddingRight: '12px',
                }}
            >
                <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}

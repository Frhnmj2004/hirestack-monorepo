'use client';

import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSidebarCollapsed } = useUiStore();

    return (
        <div className="min-h-screen bg-brand-midnight text-foreground flex">
            <Sidebar />
            <Topbar />

            <main
                className={cn(
                    "flex-1 transition-all duration-300 pt-16 min-h-screen",
                    isSidebarCollapsed ? "pl-[80px]" : "pl-[260px]"
                )}
            >
                <div className="p-8 max-w-[1600px] mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}

'use client';

import { Bell, Search, User, Sun, Moon } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';


export function Topbar() {
    const { isSidebarCollapsed } = useUiStore();
    const { theme, setTheme } = useTheme();

    return (
        <header
            className={cn(
                "fixed top-0 right-0 z-30 transition-all duration-300 h-16 border-b border-border dark:border-white/5 bg-white/60 dark:bg-brand-midnight/50 backdrop-blur-md flex items-center justify-between px-6 pl-10",
                isSidebarCollapsed ? "left-[80px]" : "left-[260px]"
            )}
        >
            <div className="flex-1 flex items-center max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-light-textSecondary dark:text-white/40" />
                    <input
                        type="text"
                        placeholder="Search candidates, jobs, or interviews..."
                        className="w-full bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-brand-light-textPrimary dark:text-white placeholder:text-brand-light-textSecondary dark:placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-brand-violet/50 focus:border-brand-violet/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="relative p-2 rounded-full text-brand-light-textSecondary dark:text-white/60 hover:text-brand-light-textPrimary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="h-8 w-[1px] bg-border dark:bg-white/10 mx-1"></div>

                <button className="relative p-2 rounded-full text-brand-light-textSecondary dark:text-white/60 hover:text-brand-light-textPrimary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-violet ring-2 ring-brand-light-surface dark:ring-brand-midnight"></span>
                </button>

                <div className="h-8 w-[1px] bg-border dark:bg-white/10 mx-1"></div>

                <button className="flex items-center gap-2 pl-2">
                    <div className="w-8 h-8 rounded-full bg-brand-violet/10 dark:bg-brand-indigo border border-brand-violet/30 dark:border-brand-royal flex items-center justify-center overflow-hidden">
                        <User className="w-4 h-4 text-brand-violet dark:text-brand-lavender" />
                    </div>
                </button>
            </div>
        </header>
    );
}

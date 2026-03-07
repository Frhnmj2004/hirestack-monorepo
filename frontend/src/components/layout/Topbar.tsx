'use client';

import { Bell, Search, User } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export function Topbar() {
    const { isSidebarCollapsed } = useUiStore();

    return (
        <header
            className={cn(
                "fixed top-0 right-0 z-30 transition-all duration-300 h-16",
                "flex items-center justify-between px-6",
                isSidebarCollapsed ? "left-[76px]" : "left-[256px]"
            )}
            style={{
                background: 'rgba(247, 248, 252, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(230, 230, 240, 0.8)',
                boxShadow: '0 1px 0 rgba(230, 230, 240, 0.5), 0 2px 12px rgba(90, 70, 218, 0.04)',
            }}
        >
            {/* Greeting + Search */}
            <div className="flex items-center gap-6 flex-1">
                <div className="hidden md:block">
                    <h2 className="text-sm font-semibold text-brand-light-textPrimary leading-none">
                        Good morning 👋
                    </h2>
                    <p className="text-xs text-brand-light-textSecondary mt-0.5">
                        Here's what's happening today
                    </p>
                </div>

                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-light-textSecondary/60" />
                    <input
                        type="text"
                        placeholder="Search candidates, roles..."
                        className="w-full text-sm py-2 pl-9 pr-4 rounded-xl outline-none transition-all duration-200"
                        style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '1px solid rgba(230, 230, 240, 0.9)',
                            color: '#1A1A2E',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.border = '1px solid rgba(90, 70, 218, 0.4)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(90, 70, 218, 0.08)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.border = '1px solid rgba(230, 230, 240, 0.9)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-4">
                {/* Notification Bell */}
                <button
                    className="relative p-2.5 rounded-xl transition-all duration-200 group"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(90, 70, 218, 0.06)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                >
                    <Bell className="w-4.5 h-4.5 text-brand-light-textSecondary group-hover:text-brand-light-textPrimary transition-colors" style={{ width: '18px', height: '18px' }} />
                    {/* Notification badge */}
                    <span
                        className="absolute top-2 right-2 w-2 h-2 rounded-full"
                        style={{
                            background: 'linear-gradient(135deg, #5A46DA, #9B8CFF)',
                            boxShadow: '0 0 0 2px rgba(247, 248, 252, 0.9)',
                        }}
                    />
                </button>

                {/* Divider */}
                <div className="w-px h-6 mx-1" style={{ background: 'rgba(230, 230, 240, 0.9)' }} />

                {/* User Avatar */}
                <button className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-xl transition-all duration-200 hover:bg-brand-violet/6">
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, rgba(90,70,218,0.15), rgba(155,140,255,0.1))',
                            border: '1px solid rgba(90, 70, 218, 0.2)',
                        }}
                    >
                        <User className="w-4 h-4 text-brand-violet" />
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-semibold text-brand-light-textPrimary leading-none">Recruiter</p>
                        <p className="text-[10px] text-brand-light-textSecondary mt-0.5">Admin</p>
                    </div>
                </button>
            </div>
        </header>
    );
}

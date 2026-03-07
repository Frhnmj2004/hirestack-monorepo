'use client';

import { Bell, Search, User } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

// Must match layout.tsx constants
const SIDEBAR_EXPANDED = 256 + 12 + 12; // 280px
const SIDEBAR_COLLAPSED = 76 + 12 + 12; // 100px

export function Topbar() {
    const { isSidebarCollapsed } = useUiStore();

    return (
        <header
            className="fixed top-3 right-3 z-30 transition-all duration-300 ease-in-out h-[56px]"
            style={{
                left: isSidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
                /* Glassmorphism */
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '10px solid rgba(255, 255, 255, 0.45)',
                backgroundClip: 'padding-box',
                boxShadow:
                    '0 8px 32px rgba(90, 70, 218, 0.08), 0 2px 8px rgba(0,0,0,0.04)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
            }}
        >
            {/* Left — Greeting + Search */}
            <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="hidden lg:block shrink-0">
                    <p className="text-sm font-semibold text-brand-light-textPrimary leading-none">
                        Good morning 👋
                    </p>
                    <p className="text-xs text-brand-light-textSecondary mt-0.5">
                        Here&apos;s what&apos;s happening today
                    </p>
                </div>

                {/* Search bar */}
                <div className="relative max-w-xs w-full">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light-textSecondary/60"
                        style={{ width: 14, height: 14 }}
                    />
                    <input
                        type="text"
                        placeholder="Search candidates, roles..."
                        className={cn(
                            'w-full text-sm leading-none py-2 pl-9 pr-4 outline-none transition-all duration-200',
                            'text-brand-light-textPrimary placeholder:text-brand-light-textSecondary/60'
                        )}
                        style={{
                            background: 'rgba(247, 248, 252, 0.9)',
                            border: '1px solid rgba(230, 230, 240, 0.9)',
                            borderRadius: '12px',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.border =
                                '1px solid rgba(90, 70, 218, 0.4)';
                            e.currentTarget.style.boxShadow =
                                '0 0 0 3px rgba(90, 70, 218, 0.08)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.border =
                                '1px solid rgba(230, 230, 240, 0.9)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2 ml-4 shrink-0">
                {/* Notification */}
                <button
                    className="relative p-2 rounded-xl transition-all duration-200 hover:bg-brand-violet/6"
                    style={{ color: '#6B6B8D' }}
                >
                    <Bell style={{ width: 18, height: 18 }} />
                    <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                        style={{
                            background:
                                'linear-gradient(135deg, #5A46DA, #9B8CFF)',
                            boxShadow: '0 0 0 2px rgba(255,255,255,0.9)',
                        }}
                    />
                </button>

                {/* Divider */}
                <div
                    className="w-px h-5 mx-1"
                    style={{ background: 'rgba(230, 230, 240, 0.9)' }}
                />

                {/* Avatar */}
                <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl transition-all duration-200 hover:bg-brand-violet/6">
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background:
                                'linear-gradient(135deg, #5A46DA 0%, #7B6CFF 100%)',
                            boxShadow: '0 3px 10px rgba(90,70,218,0.35)',
                        }}
                    >
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left leading-none">
                        <p className="text-xs font-semibold text-brand-light-textPrimary">
                            Recruiter
                        </p>
                        <p className="text-[10px] text-brand-light-textSecondary mt-0.5">
                            Admin
                        </p>
                    </div>
                </button>
            </div>
        </header>
    );
}

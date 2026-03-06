'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

// For brevity, a simple mobile overlay
export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(true)} className="p-2 text-white/70 hover:text-white">
                <Menu className="w-6 h-6" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-brand-midnight/95 backdrop-blur-xl flex flex-col p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <span className="font-bold text-xl text-white">HireLens</span>
                        <button onClick={() => setIsOpen(false)} className="p-2 text-white/70 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="flex flex-col gap-4 text-lg">
                        <Link href={ROUTES.DASHBOARD} onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">Dashboard</Link>
                        <Link href={ROUTES.JOB_ROLES} onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">Job Roles</Link>
                        <Link href={ROUTES.RESUMES} onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">Resumes</Link>
                        <Link href={ROUTES.CANDIDATES} onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">Candidates</Link>
                        <Link href={ROUTES.INTERVIEWS} onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">Interviews</Link>
                        <Link href={ROUTES.REPORTS} onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">Reports</Link>
                    </nav>
                </div>
            )}
        </div>
    );
}

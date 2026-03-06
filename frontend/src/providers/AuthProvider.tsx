'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER, '/'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

        if (!isAuthenticated && !isPublicRoute) {
            router.push(ROUTES.LOGIN);
        } else if (isAuthenticated && isPublicRoute) {
            router.push(ROUTES.DASHBOARD);
        }
    }, [isAuthenticated, pathname, router, isMounted]);

    // Prevent hydration errors by not rendering until mounted
    if (!isMounted) {
        return <div className="min-h-screen bg-brand-midnight" />;
    }

    return <>{children}</>;
}

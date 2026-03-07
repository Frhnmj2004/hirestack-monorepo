'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: ReactNode; // Action buttons area
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-6" style={{ borderColor: 'rgba(230,230,240,0.8)' }}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-brand-light-textPrimary">{title}</h1>
                {description && (
                    <p className="text-sm text-brand-light-textSecondary mt-1 leading-relaxed max-w-2xl">{description}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3 shrink-0">
                    {children}
                </div>
            )}
        </div>
    );
}

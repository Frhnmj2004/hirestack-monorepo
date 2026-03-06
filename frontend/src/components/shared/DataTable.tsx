'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    totalItems: number;
    pageSize?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    searchPlaceholder?: string;
    onSearch?: (term: string) => void;
    emptyStateMessage?: string;
}

export function DataTable<T>({
    data,
    columns,
    totalItems,
    pageSize = 10,
    currentPage = 1,
    onPageChange,
    searchPlaceholder,
    onSearch,
    emptyStateMessage = "No results found"
}: DataTableProps<T>) {

    const totalPages = Math.ceil(totalItems / pageSize);

    return (
        <div className="flex flex-col gap-4">
            {/* Table Actions (Search) */}
            {onSearch && (
                <div className="flex justify-between items-center bg-brand-midnight/40 p-4 rounded-t-xl border border-white/5 border-b-0">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder || "Search..."}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
                        />
                    </div>
                </div>
            )}

            {/* Table Body */}
            <div className="w-full overflow-x-auto glass-card rounded-t-none">
                <table className="w-full text-left text-sm text-white/70">
                    <thead className="bg-white/5 text-white/90 border-b border-white/10 uppercase text-xs tracking-wider">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className={cn("px-6 py-4 font-medium", col.className)}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-white/40">
                                    {emptyStateMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-white/[0.02] transition-colors">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className={cn("px-6 py-4 whitespace-nowrap", col.className)}>
                                            {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 text-sm text-white/60">
                    <div>
                        Showing <span className="text-white font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-white font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="text-white font-medium">{totalItems}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange && onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-3 py-1 rounded bg-brand-violet/20 text-brand-lavender font-medium">
                            {currentPage}
                        </span>
                        <button
                            onClick={() => onPageChange && onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

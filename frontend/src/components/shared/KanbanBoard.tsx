'use client';

import { ReactNode } from 'react';


interface Column<T> {
    id: string;
    title: string;
    items: T[];
}

interface KanbanBoardProps<T> {
    columns: Column<T>[];
    renderCard: (item: T) => ReactNode;
    onDragEnd?: (itemId: string, sourceColId: string, destColId: string) => void;
}

export function KanbanBoard<T extends { id: string }>({ columns, renderCard }: KanbanBoardProps<T>) {

    // NOTE: Simple visual representation for MVP. 
    // In a real app, integrate @hello-pangea/dnd or react-beautiful-dnd here.

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[600px] snap-x">
            {columns.map((col) => (
                <div
                    key={col.id}
                    className="flex-shrink-0 w-80 flex flex-col snap-start"
                >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-semibold text-white/90 uppercase tracking-wider text-sm">{col.title}</h3>
                        <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded-full text-xs font-medium">
                            {col.items.length}
                        </span>
                    </div>

                    {/* Column Body Container */}
                    <div className="flex-1 rounded-xl bg-black/20 border border-white/5 p-3 flex flex-col gap-3 overflow-y-auto">
                        {col.items.length === 0 ? (
                            <div className="h-full flex items-center justify-center p-4 border-2 border-dashed border-white/5 rounded-lg">
                                <span className="text-sm text-white/30 text-center">Drop candidates here</span>
                            </div>
                        ) : (
                            col.items.map((item) => (
                                <div key={item.id} className="cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform">
                                    {renderCard(item)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

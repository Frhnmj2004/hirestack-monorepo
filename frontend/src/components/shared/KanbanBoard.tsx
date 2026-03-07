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
        <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[600px] snap-x scrollbar-thin">
            {columns.map((col) => (
                <div
                    key={col.id}
                    className="flex-shrink-0 w-[340px] flex flex-col snap-start"
                >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-brand-light-textPrimary tracking-tight text-sm">
                                {col.title}
                            </h3>
                            <span className="bg-brand-violet/10 text-brand-violet px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
                                {col.items.length}
                            </span>
                        </div>
                    </div>

                    {/* Column Body Container */}
                    <div
                        className="flex-1 rounded-[24px] p-4 flex flex-col gap-4 overflow-y-auto"
                        style={{
                            background: 'rgba(255,255,255,0.40)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.70)',
                            boxShadow: 'inset 0 4px 20px rgba(90,70,218,0.03)',
                        }}
                    >
                        {col.items.length === 0 ? (
                            <div className="h-full flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl">
                                <span className="text-sm text-brand-light-textSecondary/60 text-center font-medium">No candidates</span>
                            </div>
                        ) : (
                            col.items.map((item) => (
                                <div key={item.id} className="cursor-grab active:cursor-grabbing">
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

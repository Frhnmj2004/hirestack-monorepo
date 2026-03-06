'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function FileUploadZone() {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    }, []);

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full">
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                    "w-full rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center py-16 px-6 text-center cursor-pointer",
                    isDragging
                        ? "border-brand-violet bg-brand-violet/5"
                        : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"
                )}
            >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <UploadCloud className={cn("w-8 h-8", isDragging ? "text-brand-lavender" : "text-white/40")} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Drag & drop resumes here</h3>
                <p className="text-white/50 text-sm max-w-sm mb-6">
                    Upload PDF or DOCX files. The AI will automatically extract text, parse skills, and rank candidates against the job description.
                </p>
                <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                    Browse Files
                </Button>
            </div>

            {files.length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-white">Selected Files ({files.length})</h4>
                        <Button className="bg-brand-violet hover:bg-brand-violet/80 shadow-glow-sm">
                            Process & Rank Candidates
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file, idx) => (
                            <div key={idx} className="glass-card p-3 flex items-center gap-3">
                                <div className="p-2 bg-brand-violet/20 rounded text-brand-lavender shrink-0">
                                    <File className="w-5 h-5" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                    <p className="text-xs text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button onClick={() => removeFile(idx)} className="p-1.5 text-white/40 hover:text-red-400 rounded hover:bg-white/10">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

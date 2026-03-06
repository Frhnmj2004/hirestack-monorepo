'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDestructive = false
}: ConfirmDialogProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-brand-midnight/80 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/10 bg-[#130B35] p-6 shadow-2xl sm:rounded-2xl animate-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            {isDestructive && (
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                            )}
                            <div>
                                <Dialog.Title className="text-lg font-bold text-white mb-2">{title}</Dialog.Title>
                                <Dialog.Description className="text-sm text-white/70 leading-relaxed">
                                    {description}
                                </Dialog.Description>
                            </div>
                        </div>
                        <Dialog.Close asChild>
                            <button className="text-white/40 hover:text-white transition-colors" aria-label="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/10">
                            {cancelLabel}
                        </Button>
                        <Button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={isDestructive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-brand-violet hover:bg-brand-violet/80 text-white'}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

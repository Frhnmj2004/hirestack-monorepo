import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface Message {
    id: string;
    sender: 'ai' | 'candidate';
    text: string;
    timestamp: string;
}

export function TranscriptViewer({ messages }: { messages: Message[] }) {
    return (
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin max-h-[600px]">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={cn(
                        "flex gap-4 max-w-[85%]",
                        msg.sender === 'candidate' ? "ml-auto flex-row-reverse" : ""
                    )}
                >
                    {/* Avatar */}
                    <div className={cn(
                        "w-10 h-10 rounded-full flex shrink-0 items-center justify-center border",
                        msg.sender === 'ai'
                            ? "bg-brand-violet/20 border-brand-violet shadow-glow-sm text-brand-lavender"
                            : "bg-white/10 border-white/20 text-white/70"
                    )}>
                        {msg.sender === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>

                    {/* Bubble */}
                    <div className={cn(
                        "flex flex-col gap-1",
                        msg.sender === 'candidate' ? "items-end" : "items-start"
                    )}>
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-sm font-semibold text-white/80">
                                {msg.sender === 'ai' ? 'HireLens AI' : 'Candidate'}
                            </span>
                            <span className="text-xs text-white/40">{msg.timestamp}</span>
                        </div>
                        <div className={cn(
                            "px-5 py-3 rounded-2xl text-[15px] leading-relaxed",
                            msg.sender === 'ai'
                                ? "bg-brand-midnight border border-white/10 text-white rounded-tl-sm"
                                : "bg-brand-violet text-white rounded-tr-sm"
                        )}>
                            {msg.text}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

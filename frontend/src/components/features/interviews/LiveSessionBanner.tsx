import { Radio } from 'lucide-react';

export function LiveSessionBanner() {
    return (
        <div className="bg-gradient-to-r from-red-500/20 to-brand-midnight border border-red-500/30 rounded-xl p-4 flex items-center justify-between mb-8 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full bg-red-500/40 animate-ping"></div>
                    <Radio className="w-5 h-5 text-red-500 relative z-10" />
                </div>
                <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                        Live Interview in Progress
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white uppercase tracking-wider">Live</span>
                    </h4>
                    <p className="text-sm text-white/70">Alex Harper is currently completing the behavior screen.</p>
                </div>
            </div>

            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors">
                Join Silent Observer
            </button>
        </div>
    );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-brand-lavender/20 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-40 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-brand-violet/10 blur-3xl -translate-x-1/2"></div>

            <div className="container mx-auto px-4 sm:px-8 text-center max-w-4xl">
                <div className="inline-flex items-center rounded-full border border-brand-violet/20 bg-brand-violet/5 px-3 py-1 text-sm text-brand-violet mb-8 animate-fade-in shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-brand-violet mr-2"></span>
                    Announcing HireLens AI Interviews
                </div>

                <h1 className="text-5xl lg:text-7xl font-serif text-brand-light-textPrimary mb-8 leading-tight animate-slide-in">
                    Hire the <span className="text-brand-violet italic">perfect</span> candidate, without the guesswork.
                </h1>

                <p className="text-lg lg:text-xl text-brand-light-textSecondary mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-in" style={{ animationDelay: '100ms' }}>
                    HireLens automates resume screening, conducts initial AI interviews, and ranks candidates based on empirical data—saving your team hundreds of hours.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in" style={{ animationDelay: '200ms' }}>
                    <Link href={ROUTES.REGISTER}>
                        <Button size="lg" className="btn-marketing-primary text-lg px-8 h-14 w-full sm:w-auto">
                            Start Hiring Free
                        </Button>
                    </Link>
                    <Link href="#product-preview">
                        <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-white/50 border-border text-brand-light-textPrimary hover:bg-white w-full sm:w-auto">
                            See how it works
                        </Button>
                    </Link>
                </div>

                <div className="mt-16 pt-8 border-t border-border/50 animate-slide-in flex flex-col items-center" style={{ animationDelay: '300ms' }}>
                    <p className="text-sm text-brand-light-textSecondary mb-6 font-medium">TRUSTED BY INNOVATIVE HR TEAMS</p>
                    <div className="flex flex-wrap justify-center gap-8 lg:gap-16 opacity-50 grayscale">
                        {/* Placeholder Logos */}
                        <div className="text-xl font-bold font-serif">Acme Corp</div>
                        <div className="text-xl font-bold font-sans tracking-widest">GLOBAL</div>
                        <div className="text-xl font-bold font-serif italic">Stark Ind.</div>
                        <div className="text-xl font-bold font-sans">WayneTech</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

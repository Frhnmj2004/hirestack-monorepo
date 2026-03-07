import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-8">
                <div className="relative rounded-3xl bg-brand-midnight overflow-hidden px-6 py-20 text-center sm:px-16 shadow-2xl">
                    {/* Dark Mode Background Elements Inside CTA */}
                    <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-20"></div>
                    <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-violet/40 blur-[80px]"></div>

                    <h2 className="relative z-10 text-3xl font-bold tracking-tight text-white sm:text-5xl mb-6">
                        Ready to transform your hiring?
                    </h2>
                    <p className="relative z-10 mx-auto max-w-2xl text-lg leading-relaxed text-white/70 mb-10">
                        Join hundreds of innovative HR teams using HireLens to cut time-to-hire by 50% and eliminate bias from the screening process.
                    </p>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href={ROUTES.REGISTER}>
                            <Button size="lg" className="h-14 px-8 text-lg bg-white text-brand-midnight hover:bg-gray-100 w-full sm:w-auto font-bold shadow-xl hover:-translate-y-1 transition-transform">
                                Start your free trial
                            </Button>
                        </Link>
                        <p className="text-sm text-white/50 sm:ml-4 mt-4 sm:mt-0">
                            No credit card required.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

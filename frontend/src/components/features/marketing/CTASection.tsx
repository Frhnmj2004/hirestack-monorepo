import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import ScrollReveal from '@/components/ui/scroll-reveal';

export function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-8">
                <div className="relative rounded-[2rem] bg-brand-midnight overflow-hidden px-6 py-24 text-center sm:px-16 shadow-2xl">
                    {/* Dark Mode Background Elements Inside CTA */}
                    <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-20"></div>
                    <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-violet/40 blur-[80px]"></div>

                    <h2 className="relative z-10 text-4xl lg:text-6xl font-dm font-light text-white mb-6 leading-tight">
                        Ready to transform{' '}
                        <span className="text-brand-lavender italic font-instrument font-light text-[0.9em]">your hiring?</span>
                    </h2>

                    <ScrollReveal
                        baseOpacity={0.1}
                        enableBlur
                        baseRotation={2}
                        blurStrength={4}
                        splitBy="words"
                        wordAnimationEnd="bottom center"
                        containerClassName="relative z-10 text-white/70 leading-relaxed text-center text-balance mx-auto max-w-2xl mb-12"
                        textClassName="!text-lg md:!text-xl !font-normal font-sans"
                    >
                        {`Join hundreds of innovative HR teams using HireLens to cut time-to-hire by 50% and eliminate bias from the screening process.`}
                    </ScrollReveal>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href={ROUTES.REGISTER}>
                            <Button size="lg" className="h-14 px-10 text-lg bg-white text-brand-midnight hover:bg-gray-100 rounded-full w-full sm:w-auto font-medium shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all duration-300">
                                Start your free trial
                            </Button>
                        </Link>
                        <p className="text-sm text-white/50">
                            No credit card required.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

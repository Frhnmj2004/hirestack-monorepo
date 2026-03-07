import ScrollReveal from '@/components/ui/scroll-reveal';
import dashboardImg from '@/assets/dashboard.png';

export function ProductPreview() {
    return (
        <section id="product-preview" className="pt-8 pb-24 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-5xl lg:text-7xl font-dm font-light text-brand-light-textPrimary mb-6 leading-tight">
                        See the platform{' '}
                        <span className="text-brand-violet italic font-instrument font-light text-[0.85em]">in action</span>
                    </h2>
                    <ScrollReveal
                        baseOpacity={0.1}
                        enableBlur
                        baseRotation={2}
                        blurStrength={4}
                        splitBy="words"
                        wordAnimationEnd="bottom center"
                        containerClassName="text-brand-light-textSecondary leading-relaxed text-center text-balance mx-auto"
                        textClassName="!text-xl md:!text-2xl lg:!text-3xl !font-normal font-sans"
                    >
                        {`A clean, intuitive dashboard surface that gives you complete control over your hiring pipeline.`}
                    </ScrollReveal>
                </div>

                <div className="relative mx-auto w-full max-w-[95vw] lg:max-w-[1400px]">
                    {/* Decorative glow behind dashboard */}
                    <div className="absolute top-1/2 left-1/2 -z-10 h-[60%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-brand-violet/20 blur-[100px]"></div>

                    {/* Dashboard Image */}
                    <div className="rounded-xl lg:rounded-2xl border border-border shadow-2xl shadow-brand-violet/10 overflow-hidden bg-brand-light-bg mx-auto">
                        <img
                            src={dashboardImg.src}
                            alt="HireLens Dashboard Interface"
                            className="w-full h-auto object-cover"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

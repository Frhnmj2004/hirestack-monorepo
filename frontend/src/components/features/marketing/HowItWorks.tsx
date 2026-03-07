import ScrollReveal from '@/components/ui/scroll-reveal';

export function HowItWorks() {
    const steps = [
        {
            number: '01',
            title: 'Create a Job Role',
            description: 'Define the position, required skills, and the custom rubric for the AI interviewer.',
        },
        {
            number: '02',
            title: 'Upload Resumes',
            description: 'Drop thousands of resumes at once. HireLens instantly parses and ranks them against the job role.',
        },
        {
            number: '03',
            title: 'AI Screening',
            description: 'Invite top matches to a conversational AI interview that assesses their fit dynamically.',
        },
        {
            number: '04',
            title: 'Review & Hire',
            description: 'Compare empirical scores, read transcripts, and move the best candidates to the final round.',
        },
    ];

    return (
        <section id="how-it-works" className="py-20 relative">
            <div className="container mx-auto px-4 sm:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-5xl lg:text-7xl font-dm font-light text-brand-light-textPrimary mb-6 leading-tight">
                        A seamless process from JD{' '}
                        <span className="text-brand-violet italic font-instrument font-light text-[0.85em]">to offer</span>
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
                        {`Our platform orchestrates every step of the early hiring funnel automatically.`}
                    </ScrollReveal>
                </div>

                <div className="relative">
                    {/* Connecting UI Line */}
                    <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-brand-violet/20 to-transparent"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center group cursor-default">
                                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-white shadow-xl shadow-brand-violet/5 border border-brand-violet/10 flex items-center justify-center mb-6 relative z-10 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-brand-violet/10 group-hover:border-brand-violet/20">
                                    <span className="text-2xl md:text-3xl font-serif font-bold text-brand-violet">
                                        {step.number}
                                    </span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-dm font-bold text-brand-light-textPrimary mb-3 tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-brand-light-textSecondary text-sm md:text-base leading-relaxed text-balance">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

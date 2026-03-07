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
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-3xl lg:text-4xl font-bold text-brand-light-textPrimary mb-4">
                        A seamless process from JD to offer
                    </h2>
                    <p className="text-lg text-brand-light-textSecondary">
                        Our platform orchestrates every step of the early hiring funnel automatically.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting UI Line */}
                    <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-brand-violet/20 to-transparent"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center">
                                <div className="h-24 w-24 rounded-full bg-white shadow-xl border border-border flex items-center justify-center mb-6 relative z-10">
                                    <span className="text-3xl font-serif font-bold text-brand-violet group-hover:scale-110 transition-transform">
                                        {step.number}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-brand-light-textPrimary mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-brand-light-textSecondary">
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

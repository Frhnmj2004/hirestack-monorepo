export function FeatureGrid() {
    const features = [
        {
            title: 'AI Resume Parsing',
            description: 'Instantly extract skills, experience, and education from thousands of resumes with human-level accuracy.',
            icon: '📄',
        },
        {
            title: 'Automated Shortlisting',
            description: 'Define your ideal criteria and let HireLens rank the best matches out of all applicants.',
            icon: '🎯',
        },
        {
            title: 'AI Video Interviews',
            description: 'Our conversational AI conducts structured first-round interviews, assessing technical and soft skills.',
            icon: '🤖',
        },
        {
            title: 'Empirical Scoring',
            description: 'Say goodbye to bias. Candidates are scored on a standardized rubric based purely on performance.',
            icon: '⚖️',
        },
        {
            title: 'Collaborative Hiring',
            description: 'Share transcripts, replay interview highlights, and align your hiring team effortlessly.',
            icon: '👥',
        },
        {
            title: 'Actionable Insights',
            description: 'Track your hiring pipeline, time-to-hire, and diversity metrics through powerful reporting.',
            icon: '📈',
        },
    ];

    return (
        <section id="features" className="py-20 bg-brand-light-surface/50 border-y border-border">
            <div className="container mx-auto px-4 sm:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-brand-light-textPrimary mb-4">
                        Everything you need to scale your team
                    </h2>
                    <p className="text-lg text-brand-light-textSecondary">
                        HireLens replaces scattered tools with a single, intelligent workflow designed for modern recruiters.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="glass-marketing-card p-8 rounded-2xl group hover:-translate-y-1 transition-transform duration-300">
                            <div className="h-12 w-12 rounded-xl bg-brand-violet/10 flex items-center justify-center text-2xl mb-6 group-hover:bg-brand-violet group-hover:text-white transition-colors duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-brand-light-textPrimary mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-brand-light-textSecondary leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

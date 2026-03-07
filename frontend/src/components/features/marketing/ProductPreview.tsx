export function ProductPreview() {
    return (
        <section id="product-preview" className="py-20 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-brand-light-textPrimary mb-4">
                        See the platform in action
                    </h2>
                    <p className="text-lg text-brand-light-textSecondary">
                        A clean, intuitive dashboard surface that gives you complete control over your hiring pipeline.
                    </p>
                </div>

                <div className="relative mx-auto max-w-5xl">
                    {/* Decorative glow behind dashboard */}
                    <div className="absolute top-1/2 left-1/2 -z-10 h-[60%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-brand-violet/20 blur-[100px]"></div>

                    {/* Fake Dashboard UI */}
                    <div className="rounded-2xl border border-border bg-white shadow-2xl overflow-hidden">
                        {/* Fake Browser window header */}
                        <div className="flex items-center gap-2 border-b border-border bg-brand-light-bg px-4 py-3">
                            <div className="flex gap-1.5">
                                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                                <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                            </div>
                            <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-white text-[10px] text-brand-light-textSecondary shadow-sm">
                                hirelens.app/dashboard
                            </div>
                        </div>

                        {/* Real fake UI body */}
                        <div className="flex h-[400px] sm:h-[600px] w-full bg-brand-midnight text-white">
                            {/* Fake Sidebar */}
                            <div className="hidden sm:flex w-64 flex-col border-r border-white/10 p-4">
                                <div className="mb-8 font-bold text-lg">HireLens</div>
                                <div className="space-y-2">
                                    <div className="rounded-lg bg-brand-violet/20 p-2 text-sm text-brand-lavender border border-brand-violet/30">📊 Dashboard</div>
                                    <div className="rounded-lg p-2 text-sm text-white/50">💼 Job Roles</div>
                                    <div className="rounded-lg p-2 text-sm text-white/50">📄 Resumes</div>
                                    <div className="rounded-lg p-2 text-sm text-white/50">👥 Candidates</div>
                                </div>
                            </div>
                            {/* Fake Main Content */}
                            <div className="flex-1 p-8">
                                <div className="mb-8 h-8 w-48 rounded bg-white/10"></div>
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="h-24 rounded-xl bg-white/5 border border-white/10"></div>
                                    <div className="h-24 rounded-xl bg-white/5 border border-white/10"></div>
                                    <div className="h-24 rounded-xl bg-white/5 border border-white/10"></div>
                                </div>
                                <div className="h-64 rounded-xl bg-white/5 border border-white/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

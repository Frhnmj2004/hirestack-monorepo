'use client';

import { useRef } from 'react';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { ParticleCard, GlobalSpotlight, useMobileDetection } from '@/components/ui/MagicBento';

/* ─── Glow colour: brand violet on white cards ───────────────── */
const GLOW_COLOR = '90, 70, 218';

/* ─── Card glow CSS ──────────────────────────────────────────── */
const BENTO_STYLES = `
  .bento-feature-card {
    --glow-x: 50%;
    --glow-y: 50%;
    --glow-intensity: 0;
    --glow-radius: 300px;
  }
  .bento-feature-card::after {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px;
    background: radial-gradient(
      var(--glow-radius) circle at var(--glow-x) var(--glow-y),
      rgba(${GLOW_COLOR}, calc(var(--glow-intensity) * 1.0)) 0%,
      rgba(${GLOW_COLOR}, calc(var(--glow-intensity) * 0.5)) 30%,
      transparent 65%
    );
    border-radius: inherit;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
    transition: opacity 0.3s ease;
  }
  .bento-feature-card.inverted::after {
    --glow-color-inverted: 255, 255, 255;
    background: radial-gradient(
      var(--glow-radius) circle at var(--glow-x) var(--glow-y),
      rgba(255, 255, 255, calc(var(--glow-intensity) * 0.7)) 0%,
      rgba(255, 255, 255, calc(var(--glow-intensity) * 0.3)) 30%,
      transparent 65%
    );
  }
`;

/* ─── Mockups ─────────────────────────────────────────────────── */

/** On white card bg */
function ResumeMockup() {
    return (
        <div className="w-full rounded-xl bg-gray-50 border border-gray-100 p-4 font-sans text-xs">
            <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-300" />
                <span className="w-2 h-2 rounded-full bg-yellow-300" />
                <span className="w-2 h-2 rounded-full bg-green-300" />
                <div className="ml-2 flex-1 h-3.5 rounded-md bg-white border border-gray-100 flex items-center px-2 text-[9px] text-gray-300">resume.pdf</div>
            </div>
            {[
                { name: 'Aisha Rajan', score: 94, tag: 'ML Engineer' },
                { name: 'Marcus Lee', score: 87, tag: 'Backend' },
                { name: 'Sara Müller', score: 81, tag: 'Full-Stack' },
            ].map((c) => (
                <div key={c.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-violet flex items-center justify-center text-white text-[8px] font-bold">{c.name[0]}</div>
                        <span className="text-gray-700 font-medium text-[10px]">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-violet/10 text-brand-violet font-medium">{c.tag}</span>
                        <span className="text-[10px] font-bold text-brand-violet">{c.score}%</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/** On inverted (violet) card bg */
function ResumeMockupInverted() {
    return (
        <div className="w-full rounded-xl bg-white/10 border border-white/20 p-4 font-sans text-xs">
            <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-white/30" />
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-white/10" />
                <div className="ml-2 flex-1 h-3.5 rounded-md bg-white/10 flex items-center px-2 text-[9px] text-white/30">resume.pdf</div>
            </div>
            {[
                { name: 'Aisha Rajan', score: 94, tag: 'ML Engineer' },
                { name: 'Marcus Lee', score: 87, tag: 'Backend' },
                { name: 'Sara Müller', score: 81, tag: 'Full-Stack' },
            ].map((c) => (
                <div key={c.name} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[8px] font-bold">{c.name[0]}</div>
                        <span className="text-white/80 font-medium text-[10px]">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/15 text-white/80 font-medium">{c.tag}</span>
                        <span className="text-[10px] font-bold text-white">{c.score}%</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ShortlistMockup() {
    return (
        <div className="w-full rounded-xl bg-gray-50 border border-gray-100 p-4 font-sans space-y-3">
            <div className="text-[10px] text-gray-400 font-medium">Top Matches — Senior Engineer</div>
            {[
                { name: 'Taylor Kim', match: 97 },
                { name: 'Priya Nair', match: 91 },
                { name: 'Joaquin R.', match: 85 },
            ].map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-violet/10 flex items-center justify-center text-[8px] font-bold text-brand-violet">{c.name[0]}</div>
                    <div className="flex-1">
                        <div className="text-[10px] font-medium text-gray-600 mb-1">{c.name}</div>
                        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-full rounded-full bg-brand-violet" style={{ width: `${c.match}%` }} />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-violet">{c.match}%</span>
                </div>
            ))}
        </div>
    );
}

function InterviewMockup() {
    return (
        <div className="w-full rounded-xl bg-gray-50 border border-gray-100 p-4 font-sans space-y-3 relative overflow-hidden">
            <div className="w-full h-24 rounded-lg bg-white border border-gray-100 flex items-center justify-center relative">
                <div className="w-9 h-9 rounded-full bg-brand-violet/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-brand-violet" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-[8px] text-gray-300">REC</span>
                </div>
            </div>
            <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-brand-violet flex items-center justify-center text-[8px] text-white font-bold shrink-0">AI</div>
                <div className="bg-brand-violet/8 text-gray-600 text-[9px] rounded-lg px-2.5 py-1.5 max-w-[85%] border border-brand-violet/10">
                    Tell me about a time you resolved a production incident under pressure.
                </div>
            </div>
            <div className="flex items-start gap-2 flex-row-reverse">
                <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[8px] text-gray-400 shrink-0">U</div>
                <div className="bg-white text-gray-500 text-[9px] rounded-lg px-2.5 py-1.5 max-w-[85%] border border-gray-100">
                    Sure — in Q2 we had a Redis cluster melt under load...
                </div>
            </div>
        </div>
    );
}

function ScoringMockup() {
    return (
        <div className="flex flex-col gap-3 w-full font-sans">
            {[
                { label: 'Technical Skills', score: 9.2, pct: 92 },
                { label: 'Communication', score: 8.7, pct: 87 },
                { label: 'Problem Solving', score: 9.5, pct: 95 },
                { label: 'Culture Fit', score: 8.1, pct: 81 },
            ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                    <span className="text-[9px] text-gray-400 w-24 shrink-0">{s.label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-brand-violet" style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500 w-6 text-right">{s.score}</span>
                </div>
            ))}
        </div>
    );
}

function CollabMockup() {
    return (
        <div className="w-full rounded-xl bg-gray-50 border border-gray-100 p-4 font-sans text-xs space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-500">Hiring Team · 4 reviewers</span>
                <div className="flex -space-x-1.5">
                    {['A', 'B', 'C', 'D'].map((m, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-brand-violet border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">{m}</div>
                    ))}
                </div>
            </div>
            <div className="bg-brand-violet/5 rounded-lg p-2.5 text-[9px] text-gray-500 italic border-l-2 border-brand-violet/30">
                "Strong systems design fundamentals, recommend advancing." — Reviewer A
            </div>
            <div className="flex gap-2">
                <button className="flex-1 py-1.5 text-[9px] rounded-lg bg-brand-violet text-white font-semibold">Advance</button>
                <button className="flex-1 py-1.5 text-[9px] rounded-lg bg-gray-100 text-gray-400 border border-gray-200">Pass</button>
            </div>
        </div>
    );
}

function InsightsMockup() {
    return (
        <div className="w-full rounded-xl bg-gray-50 border border-gray-100 p-4 font-sans space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
                {[{ label: 'Applications', value: '1,204' }, { label: 'Shortlisted', value: '84' }, { label: 'Time-to-Hire', value: '6d' }].map((m) => (
                    <div key={m.label} className="bg-white rounded-lg py-2.5 border border-gray-100">
                        <div className="text-[11px] font-bold text-brand-violet">{m.value}</div>
                        <div className="text-[8px] text-gray-400 mt-0.5">{m.label}</div>
                    </div>
                ))}
            </div>
            <div className="flex items-end gap-1 h-12">
                {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-brand-violet/20 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-brand-violet rounded-sm" style={{ height: `${h}%` }} />
                    </div>
                ))}
            </div>
            <div className="text-[8px] text-gray-400 text-center">Applications — last 7 days</div>
        </div>
    );
}

/* ─── BentoCard ──────────────────────────────────────────────── */

type BentoCardProps = {
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
    inverted?: boolean;
    disableAnimations?: boolean;
};

function BentoCard({ title, description, children, className = '', inverted = false, disableAnimations = false }: BentoCardProps) {
    return (
        <ParticleCard
            className={[
                'card bento-feature-card rounded-2xl flex flex-col p-7 gap-5 min-h-[340px] cursor-default transition-all duration-300',
                inverted
                    ? 'inverted bg-brand-violet border border-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-brand-violet/30'
                    : 'bg-white border border-gray-100 shadow-sm hover:border-brand-violet/20 hover:shadow-md hover:shadow-brand-violet/8',
                className,
            ].join(' ')}
            disableAnimations={disableAnimations}
            particleCount={inverted ? 10 : 6}
            glowColor={inverted ? '255, 255, 255' : GLOW_COLOR}
            enableTilt={false}
            clickEffect
            enableMagnetism={false}
        >
            {inverted && (
                <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            )}

            <div className="relative z-10">
                <h3 className={`text-lg font-semibold mb-2 font-dm leading-snug ${inverted ? 'text-white' : 'text-brand-light-textPrimary'}`}>
                    {title}
                </h3>
                <p className={`text-sm leading-relaxed ${inverted ? 'text-white/70' : 'text-brand-light-textSecondary'}`}>
                    {description}
                </p>
            </div>

            <div className="flex-1 flex items-end relative z-10">{children}</div>
        </ParticleCard>
    );
}

/* ─── Section ─────────────────────────────────────────────────── */

export function FeatureGrid() {
    const gridRef = useRef<HTMLDivElement>(null);
    const isMobile = useMobileDetection();

    return (
        <section id="features" className="py-24 bg-brand-light-bg border-y border-border">
            <style dangerouslySetInnerHTML={{ __html: BENTO_STYLES }} />

            <GlobalSpotlight
                gridRef={gridRef}
                enabled
                disableAnimations={isMobile}
                spotlightRadius={380}
                glowColor={GLOW_COLOR}
            />

            {/* narrower container for generous side whitespace */}
            <div className="max-w-6xl mx-auto px-8 lg:px-16">

                {/* Heading */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-5xl lg:text-7xl font-dm font-light text-brand-light-textPrimary mb-6 leading-tight">
                        Scale your team{' '}
                        <span className="text-brand-violet italic font-instrument font-light text-[0.85em]">effortlessly</span>
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
                        {`HireLens replaces scattered tools with a single, intelligent workflow designed for modern recruiters. From automated top-of-funnel screening to deep empirical candidate insights, every step of your hiring process is accelerated without compromising quality.`}
                    </ScrollReveal>
                </div>

                {/* Bento Grid */}
                <div
                    ref={gridRef}
                    id="features-grid"
                    className="bento-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {/* Row 1 — inverted wide card + normal card */}
                    <BentoCard
                        title="AI Resume Parsing"
                        description="Instantly extract skills, experience, and education from thousands of resumes with human-level accuracy."
                        className="lg:col-span-2"
                        disableAnimations={isMobile}
                    >
                        <ResumeMockup />
                    </BentoCard>

                    <BentoCard
                        title="Automated Shortlisting"
                        description="Define your ideal criteria and HireLens surfaces the best-fit candidates, ranked automatically."
                        disableAnimations={isMobile}
                    >
                        <ShortlistMockup />
                    </BentoCard>

                    {/* Row 2 */}
                    <BentoCard
                        title="Empirical Scoring"
                        description="Say goodbye to bias. Candidates are scored on a standardised rubric based purely on performance."
                        disableAnimations={isMobile}
                    >
                        <ScoringMockup />
                    </BentoCard>

                    <BentoCard
                        title="AI Video Interviews"
                        description="Our conversational AI conducts structured first-round interviews, assessing both technical and soft skills."
                        className="lg:col-span-2"
                        disableAnimations={isMobile}
                    >
                        <InterviewMockup />
                    </BentoCard>

                    {/* Row 3 */}
                    <BentoCard
                        title="Collaborative Hiring"
                        description="Share transcripts, replay interview highlights, and align your hiring team with a single click."
                        disableAnimations={isMobile}
                    >
                        <CollabMockup />
                    </BentoCard>

                    <BentoCard
                        title="Actionable Insights"
                        description="Track your hiring pipeline, time-to-hire, and diversity metrics through a powerful real-time dashboard."
                        className="lg:col-span-2"
                        disableAnimations={isMobile}
                    >
                        <InsightsMockup />
                    </BentoCard>
                </div>
            </div>
        </section>
    );
}

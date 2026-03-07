import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import TextType from '@/components/ui/text-type';
import LogoLoop from '@/components/ui/logo-loop';
import AnimatedContent from '@/components/ui/animated-content';
import { SiGoogle, SiNetflix, SiApple, SiAirbnb, SiUber, SiStripe } from 'react-icons/si';
import { FaAmazon, FaMicrosoft } from 'react-icons/fa';

const hrLogos = [
    { node: <SiGoogle className="opacity-60" />, title: "Google" },
    { node: <FaAmazon className="opacity-60" />, title: "Amazon" },
    { node: <SiNetflix className="opacity-60" />, title: "Netflix" },
    { node: <FaMicrosoft className="opacity-60" />, title: "Microsoft" },
    { node: <SiApple className="opacity-60" />, title: "Apple" },
    { node: <SiAirbnb className="opacity-60" />, title: "Airbnb" },
    { node: <SiUber className="opacity-60" />, title: "Uber" },
    { node: <SiStripe className="opacity-60" />, title: "Stripe" }
];

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-12 pb-12 lg:pt-20 lg:pb-16">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-brand-lavender/20 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-40 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-brand-violet/10 blur-3xl -translate-x-1/2"></div>

            <AnimatedContent
                distance={100}
                direction="vertical"
                reverse={false}
                duration={0.8}
                ease="power3.out"
                initialOpacity={0}
                animateOpacity
                scale={1}
                threshold={0.1}
                delay={0}
            >
                <div className="container mx-auto px-4 sm:px-8 text-center max-w-4xl font-dm font-light">
                    <div className="inline-flex items-center rounded-full border border-brand-violet/20 bg-brand-violet/5 px-3 py-1 text-sm text-brand-violet mb-6 animate-fade-in shadow-sm font-medium">
                        <span className="flex h-2 w-2 rounded-full bg-brand-violet mr-2"></span>
                        Announcing HireLens AI Interviews
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-dm font-light text-brand-light-textPrimary mb-8 leading-tight animate-slide-in">
                        Hire the <TextType
                            text={["perfect", "ideal", "right", "best", "brilliant"]}
                            typingSpeed={120}
                            deletingSpeed={80}
                            pauseDuration={1500}
                            showCursor={false}
                            className="text-brand-violet italic font-instrument font-light text-[0.85em]"
                        /> candidates,<br /> without the guesswork.
                    </h1>

                    <p className="text-lg lg:text-xl text-brand-light-textSecondary mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-in" style={{ animationDelay: '100ms' }}>
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

                    <div className="mt-8 pt-6 border-t border-border/50 animate-slide-in flex flex-col items-center w-full" style={{ animationDelay: '300ms' }}>
                        <p className="text-sm text-brand-light-textSecondary mb-4 font-medium">TRUSTED BY INNOVATIVE HR TEAMS</p>
                        <div className="w-full relative overflow-hidden h-[60px]">
                            <LogoLoop
                                logos={hrLogos}
                                speed={100}
                                direction="left"
                                logoHeight={40}
                                gap={60}
                                hoverSpeed={0}
                                scaleOnHover
                                fadeOut
                                fadeOutColor="#F7F8FC"
                                ariaLabel="Partner logos"
                            />
                        </div>
                    </div>
                </div>
            </AnimatedContent>
        </section>
    );
}

'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { ROUTES } from '@/lib/constants';
import hireLensLogo from '@/assets/HireLens_Dark.svg';

export function Header() {
    const [open, setOpen] = React.useState(false);
    const scrolled = useScroll(10);
    const [overDarkSection, setOverDarkSection] = React.useState(false);

    // Detect when the dark bento grid crosses into the header zone
    React.useEffect(() => {
        const grid = document.getElementById('features-grid');
        if (!grid) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setOverDarkSection(entry.isIntersecting);
            },
            {
                // fire only when the grid is within the top ~64px of the viewport (header height)
                rootMargin: '-0px 0px -90% 0px',
                threshold: 0,
            }
        );

        observer.observe(grid);
        return () => observer.disconnect();
    }, []);

    const links = [
        {
            label: 'Features',
            href: '#features',
        },
        {
            label: 'How it Works',
            href: '#how-it-works',
        },
    ];

    React.useEffect(() => {
        if (open) {
            // Disable scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable scroll
            document.body.style.overflow = '';
        }

        // Cleanup when component unmounts (important for Next.js)
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <header
            className={cn(
                'sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-full md:border md:transition-all md:ease-out',
                {
                    'bg-background/80 supports-[backdrop-filter]:bg-background/40 border-border backdrop-blur-xl md:top-6 md:shadow-lg':
                        scrolled && !open,
                    'bg-background/80': open,
                },
            )}
        >
            <nav
                className={cn(
                    'flex h-14 w-full items-center justify-between px-6 md:h-16 md:px-8 md:transition-all md:ease-out',
                    {
                        'md:px-6': scrolled,
                    },
                )}
            >
                <Link href="/" className="flex items-center">
                    <Image
                        src={hireLensLogo}
                        alt="HireLens Logo"
                        height={32}
                        priority
                        className="h-7 md:h-8 w-auto"
                    />
                </Link>
                <div className="hidden items-center gap-4 md:flex">
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            className={buttonVariants({
                                variant: 'ghost',
                                className: cn(
                                    'text-sm transition-colors duration-300',
                                    overDarkSection
                                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                                        : 'text-brand-light-textSecondary hover:text-brand-light-textPrimary'
                                ),
                            })}
                            href={link.href}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href={ROUTES.LOGIN}>
                        <Button variant="outline" className="ml-4 font-semibold text-sm py-6 px-6">Log In</Button>
                    </Link>
                    <Link href={ROUTES.REGISTER}>
                        <Button className="font-semibold text-sm py-6 px-6 btn-marketing-primary border-0">Get Started</Button>
                    </Link>
                </div>
                <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden h-10 w-10 rounded-full border-brand-violet/20 flex items-center justify-center">
                    <MenuToggleIcon open={open} className="size-5 text-brand-violet" duration={300} />
                </Button>
            </nav>

            <div
                className={cn(
                    'bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-2xl fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-t md:hidden',
                    open ? 'block' : 'hidden',
                )}
            >
                <div
                    data-slot={open ? 'open' : 'closed'}
                    className={cn(
                        'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out duration-300',
                        'flex h-full w-full flex-col justify-start gap-y-8 p-6 pt-12',
                    )}
                >
                    <div className="grid gap-y-4">
                        {links.map((link) => (
                            <Link
                                key={link.label}
                                className={buttonVariants({
                                    variant: 'ghost',
                                    className: 'justify-start text-xl font-medium py-6 px-4 hover:bg-brand-violet/10',
                                })}
                                href={link.href}
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4 mt-8">
                        <Link href={ROUTES.LOGIN} onClick={() => setOpen(false)} className="w-full">
                            <Button variant="outline" className="w-full font-semibold text-lg py-8 border-brand-violet/20">
                                Log In
                            </Button>
                        </Link>
                        <Link href={ROUTES.REGISTER} onClick={() => setOpen(false)} className="w-full">
                            <Button className="w-full font-semibold text-lg py-8 btn-marketing-primary border-0">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

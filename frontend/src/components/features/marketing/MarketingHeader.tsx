import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export function MarketingHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-violet text-white font-bold text-xl">
                        H
                    </div>
                    <span className="text-xl font-bold tracking-tight text-brand-light-textPrimary">
                        HireLens
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-light-textSecondary">
                    <Link href="#features" className="hover:text-brand-violet transition-colors">Features</Link>
                    <Link href="#how-it-works" className="hover:text-brand-violet transition-colors">How it Works</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href={ROUTES.LOGIN}>
                        <Button variant="ghost" className="text-brand-light-textSecondary hover:text-brand-light-textPrimary">
                            Log in
                        </Button>
                    </Link>
                    <Link href={ROUTES.REGISTER}>
                        <Button className="btn-marketing-primary border-0">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

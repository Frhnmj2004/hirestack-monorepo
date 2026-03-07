import Link from 'next/link';
import Image from 'next/image';
import hireLensLogo from '@/assets/HireLens_Dark.svg';

export function Footer() {
    return (
        <footer className="border-t border-border bg-white pt-20 pb-12 text-sm text-brand-light-textSecondary relative overflow-hidden">
            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -z-10 h-[1px] w-[80%] max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-violet/20 to-transparent"></div>

            <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 px-4 sm:px-8">
                <div className="md:col-span-5">
                    <div className="flex items-center gap-3 mb-6">
                        <Image
                            src={hireLensLogo}
                            alt="HireLens Logo"
                            height={32}
                            priority
                            className="h-7 md:h-8 w-auto"
                        />
                    </div>
                    <p className="max-w-xs text-brand-light-textSecondary/80 text-balance leading-relaxed">
                        The AI-powered hiring platform that helps you find, evaluate, and hire the best candidates faster.
                    </p>
                </div>

                <div className="md:col-span-2">
                    <h3 className="font-dm font-bold text-brand-light-textPrimary mb-6">Product</h3>
                    <ul className="space-y-4">
                        <li><Link href="#" className="text-brand-light-textSecondary/80 hover:text-brand-violet transition-colors duration-200">Features</Link></li>
                        <li><Link href="#" className="text-brand-light-textSecondary/80 hover:text-brand-violet transition-colors duration-200">Pricing</Link></li>
                        <li><Link href="#" className="text-brand-light-textSecondary/80 hover:text-brand-violet transition-colors duration-200">AI Interviews</Link></li>
                    </ul>
                </div>

                <div className="md:col-span-2">
                    <h3 className="font-dm font-bold text-brand-light-textPrimary mb-6">Company</h3>
                    <ul className="space-y-4">
                        <li><Link href="#" className="text-brand-light-textSecondary/80 hover:text-brand-violet transition-colors duration-200">About</Link></li>
                        <li><Link href="#" className="text-brand-light-textSecondary/80 hover:text-brand-violet transition-colors duration-200">Blog</Link></li>
                        <li><Link href="#" className="text-brand-light-textSecondary/80 hover:text-brand-violet transition-colors duration-200">Careers</Link></li>
                    </ul>
                </div>

                <div className="md:col-span-3">
                    <h3 className="font-dm font-bold text-brand-light-textPrimary mb-6">Legal</h3>
                    <ul className="space-y-4">
                        <li><Link href="#" className="text-brand-light-textSecondary/80 hover:text-brand-violet transition-colors duration-200">Privacy Policy</Link></li>
                        <li><Link href="#" className="text-brand-light-textSecondary/80 hover:text-brand-violet transition-colors duration-200">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto mt-20 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-brand-light-textSecondary/60 pt-8 border-t border-border/50">
                <p>&copy; {new Date().getFullYear()} HireLens. All rights reserved.</p>
                <div className="mt-4 sm:mt-0 flex gap-4 text-xs font-medium">
                    <Link href="#" className="hover:text-brand-violet transition-colors">Twitter</Link>
                    <Link href="#" className="hover:text-brand-violet transition-colors">LinkedIn</Link>
                    <Link href="#" className="hover:text-brand-violet transition-colors">GitHub</Link>
                </div>
            </div>
        </footer>
    );
}

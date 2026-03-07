import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-border bg-white py-12 text-sm text-brand-light-textSecondary">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 sm:px-8">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-violet text-white font-bold text-xs">
                            H
                        </div>
                        <span className="text-lg font-bold tracking-tight text-brand-light-textPrimary">
                            HireLens
                        </span>
                    </div>
                    <p className="max-w-xs">
                        The AI-powered hiring platform that helps you find, evaluate, and hire the best candidates faster.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-brand-light-textPrimary mb-4">Product</h3>
                    <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-brand-violet transition-colors">Features</Link></li>
                        <li><Link href="#" className="hover:text-brand-violet transition-colors">Pricing</Link></li>
                        <li><Link href="#" className="hover:text-brand-violet transition-colors">AI Interviews</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-brand-light-textPrimary mb-4">Company</h3>
                    <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-brand-violet transition-colors">About</Link></li>
                        <li><Link href="#" className="hover:text-brand-violet transition-colors">Blog</Link></li>
                        <li><Link href="#" className="hover:text-brand-violet transition-colors">Careers</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-brand-light-textPrimary mb-4">Legal</h3>
                    <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-brand-violet transition-colors">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-brand-violet transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto mt-12 px-4 sm:px-8 text-center text-brand-light-textSecondary/60">
                <p>&copy; {new Date().getFullYear()} HireLens. All rights reserved.</p>
            </div>
        </footer>
    );
}

import { MarketingHeader } from '@/components/features/marketing/MarketingHeader';
import { Footer } from '@/components/features/marketing/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-brand-light-bg text-brand-light-textPrimary font-sans">
            <MarketingHeader />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

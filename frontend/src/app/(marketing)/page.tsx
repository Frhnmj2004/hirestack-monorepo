import { HeroSection } from '@/components/features/marketing/HeroSection';
import { FeatureGrid } from '@/components/features/marketing/FeatureGrid';
import { ProductPreview } from '@/components/features/marketing/ProductPreview';
import { HowItWorks } from '@/components/features/marketing/HowItWorks';
import { CTASection } from '@/components/features/marketing/CTASection';

export default function LandingPage() {
    return (
        <div className="flex flex-col gap-24 pb-24">
            <HeroSection />
            <FeatureGrid />
            <ProductPreview />
            <HowItWorks />
            <CTASection />
        </div>
    );
}

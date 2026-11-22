import type { Metadata } from 'next';
import { RoleSwitcherBar } from '../../components/ui/RoleSwitcherBar.tsx';
import { MarketingNav } from '../../components/marketing/navbar/MarketingNav.tsx';
import { Hero } from '../../components/marketing/hero/Hero.tsx';
import { BrandIntro } from '../../components/marketing/brand-intro/BrandIntro.tsx';
import { Services } from '../../components/marketing/services/Services.tsx';
import { WhyGrowthPrint } from '../../components/marketing/why-growthprint/WhyGrowthPrint.tsx';
import { OurWork } from '../../components/marketing/case-studies/OurWork.tsx';
import { Faq } from '../../components/marketing/faq/Faq.tsx';
import { FinalCta } from '../../components/marketing/final-cta/FinalCta.tsx';
import { ContactSection } from '../../components/marketing/contact/ContactSection.tsx';
import { MarketingFooter } from '../../components/marketing/footer/MarketingFooter.tsx';
import { FAQS } from '../../components/marketing/content.ts';

const TITLE = 'GrowthPrint | Build Smarter. Scale Without Limits.';
const DESCRIPTION = 'GrowthPrint brings software engineering and intelligent automation together: websites and applications, '
  + 'custom software, AI and business automation, API integration and ongoing technical support.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: TITLE, description: DESCRIPTION, type: 'website', siteName: 'GrowthPrint',
    images: [{ url: '/images/growthprint-og.jpg', width: 1200, height: 630, alt: 'GrowthPrint: Build Smarter. Scale Without Limits.' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/images/growthprint-og.jpg'] },
};

/** FAQ structured data for search engines, generated from the same answers shown on the page. */
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function HomePage() {
  return (
    <div className="gp-marketing min-h-screen overflow-x-clip">
      {/* Demo-mode only: lets testers switch between the public site, client hub and studio. Renders nothing otherwise. */}
      <RoleSwitcherBar />
      <a href="#main" className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-mk-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <MarketingNav />
      <main id="main">
        <Hero />
        <BrandIntro />
        <Services />
        <WhyGrowthPrint />
        <OurWork />
        <Faq />
        <FinalCta />
        <ContactSection />
      </main>
      <MarketingFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
}

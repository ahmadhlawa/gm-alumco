import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { getServices } from '@/lib/api';
import { useLanguage } from '@/i18n';
import { useState, useEffect } from 'react';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Service } from '@/types';

export function Services() {
  const { t, language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getServices(language)
      .then(data => setServices(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [language]);

  return (
    <div className="bg-brand-navy">
      <PageHero 
        title={t("השירותים והפתרונות שלנו", "Our services & solutions")} 
        subtitle={t("מגוון שלם של חזיתות זכוכית ומערכות אלומיניום מעוצבות במיוחד לפרויקט שלך.", "A complete range of premium glass facades and aluminum systems, designed specifically for your project.")}
        breadcrumbs={[{ label: t('שירותים', "Services"), path: '/services' }]}
        image="/images/backgrounds/tas-bg-services.webp"
      />

      <section className="relative isolate overflow-hidden py-24">
        {/* Subtle architectural backdrop — navy-washed for text readability */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-services.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.28]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-brand-navy/85 via-brand-navy/55 to-brand-navy/80"
        />
        <div className="container relative z-10 mx-auto px-4">
          <SectionHeader
            title={t("פתרונות הנדסיים מיועדים ליצירתיות", "Engineering solutions built for creativity")}
            centered
          />
          <div className="min-h-[400px]">
             {loading ? (
                <LoadingState variant="card-grid" />
             ) : error ? (
                <ErrorState message={t('טעינת השירותים נכשלה. נסה שוב.', 'Could not load services. Please try again.')} />
             ) : services.length === 0 ? (
                <EmptyState message={t('אין שירותים להצגה כעת.', "No services to display at the moment.")} />
             ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {services.map((service, idx) => (
                    <ServiceCard key={service.id} service={service} index={idx} />
                  ))}
                </div>
             )}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}

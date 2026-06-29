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
        title={t("خدماتنا وحلولنا", "השירותים והפתרונות שלנו", "Our services & solutions")} 
        subtitle={t("مجموعة متكاملة من أرقى الواجهات الزجاجية وأنظمة الألمنيوم المصممة خصيصاً لمشروعك.", "מגוון שלם של חזיתות זכוכית ומערכות אלומיניום מעוצבות במיוחד לפרויקט שלך.", "A complete range of premium glass facades and aluminum systems, designed specifically for your project.")}
        breadcrumbs={[{ label: t('خدماتنا', 'שירותים', "Services"), path: '/services' }]}
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80"
      />

      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title={t("حلول هندسية مصممة للإبداع", "פתרונות הנדסיים מיועדים ליצירתיות", "Engineering solutions built for creativity")} 
            centered
          />
          <div className="min-h-[400px]">
             {loading ? (
                <LoadingState message={t('جاري تحميل الخدمات...', 'טוען שירותים...', 'Loading services...')} />
             ) : error ? (
                <ErrorState message={t('تعذر تحميل الخدمات. يرجى المحاولة مرة أخرى.', 'טעינת השירותים נכשלה. נסה שוב.', 'Could not load services. Please try again.')} />
             ) : services.length === 0 ? (
                <EmptyState message={t('لا توجد خدمات لعرضها حالياً.', 'אין שירותים להצגה כעת.', "No services to display at the moment.")} />
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

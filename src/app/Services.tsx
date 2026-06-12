import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { getServices } from '@/lib/api';
import { useLanguage } from '@/i18n';
import { useState, useEffect } from 'react';
import { LoadingState } from '@/components/common/LoadingState';
import { Service } from '@/types';

export function Services() {
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices().then(data => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-brand-navy">
      <PageHero 
        title={t("خدماتنا وحلولنا", "השירותים והפתרונות שלנו")} 
        subtitle={t("مجموعة متكاملة من أرقى الواجهات الزجاجية وأنظمة الألمنيوم المصممة خصيصاً لمشروعك.", "מגוון שלם של חזיתות זכוכית ומערכות אלומיניום מעוצבות במיוחד לפרויקט שלך.")}
        breadcrumbs={[{ label: t('خدماتنا', 'שירותים'), path: '/services' }]}
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80"
      />

      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title={t("حلول هندسية مصممة للإبداع", "פתרונות הנדסיים מיועדים ליצירתיות")} 
            centered
          />
          <div className="min-h-[400px]">
             {loading ? (
                <LoadingState />
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';
import { useLanguage } from '@/i18n';
import type { CmsLocale, LocalizedText, Service } from '@/types';
import { getServices } from '@/lib/api';
import { CONTACT_EMAIL, WHATSAPP_DISPLAY_NUMBER } from '@/components/common/ContactActions';

export interface FooterCmsContent {
  logoText: LocalizedText;
  description: LocalizedText;
  address: LocalizedText;
  phone: string;
  email: string;
  copyright: LocalizedText;
}

interface FooterProps {
  cmsContent?: FooterCmsContent;
  previewLocale?: CmsLocale;
}

/**
 * Pure presentational services list for the footer. It only renders the
 * services it is given (already localized by the API adapter) — it never
 * fabricates fallback service names. While the list is still loading it
 * renders nothing; once loading has finished with no services it shows a
 * clean empty state. Kept as its own exported component so it is testable
 * without an async data layer (mirrors how ServicesShowcase is fed `services`).
 */
export function FooterServices({
  services,
  loaded,
  heading,
  emptyLabel,
}: {
  services: Service[];
  loaded: boolean;
  heading: string;
  emptyLabel: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold mb-6 text-white">{heading}</h3>
      {services.length > 0 ? (
        <ul className="space-y-4">
          {services.map((service) => (
            <li key={service.id}>
              <Link
                to={`/services/${service.slug}`}
                className="text-gray-400 hover:text-brand-gold transition-colors block"
              >
                {service.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : loaded ? (
        <p className="text-gray-400">{emptyLabel}</p>
      ) : null}
    </div>
  );
}

export function Footer({ cmsContent, previewLocale }: FooterProps = {}) {
  const currentYear = new Date().getFullYear();
  const { t, language } = useLanguage();
  const locale = previewLocale ?? language;

  // Real services come from the public services API only — no mock fallback.
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setServicesLoaded(false);
    getServices(locale)
      .then((data) => {
        if (active) setServices(data);
      })
      .catch(() => {
        if (active) setServices([]);
      })
      .finally(() => {
        if (active) setServicesLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [locale]);
  const cmsText = (value: LocalizedText | undefined, ar: string, he: string, en: string) => {
    if (!value) return t(ar, he, en);
    if (locale === 'he') return value.he || value.en || value.ar || '';
    if (locale === 'en') return value.en || value.he || value.ar || '';
    return value.ar || value.he || value.en || '';
  };

  return (
    <footer className="bg-brand-navy text-white pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src="/images/logo-TAS-footer.png" alt="T.A.S" className="w-10 h-10 object-contain" />
              <span className="font-bold text-xl tracking-tight text-white">{cmsText(cmsContent?.logoText, 'T.A.S', 'T.A.S', 'T.A.S')}</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {cmsText(
                cmsContent?.description,
                'شركة رائدة متخصصة في تصميم وتصنيع وتركيب أنظمة الألمنيوم والزجاج المتطورة للمشاريع السكنية والتجارية ببصمة معمارية فريدة.',
                'חברה מובילה המתמחה בתכנון, ייצור והתקנה של מערכות אלומיניום וזכוכית מתקדמות לפרויקטים למגורים ולמסחר.',
                'A leading company specializing in design, fabrication and installation of advanced aluminum and glass systems for residential and commercial projects.',
              )}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-brand-surface/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-surface/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-surface/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-surface/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">{t('روابط سريعة', 'קישורים מהירים', 'Quick links')}</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('عن الشركة', 'עלינו', 'About')}</Link></li>
              <li><Link to="/projects" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('معرض المشاريع', 'פרויקטים', 'Projects')}</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('الوظائف', 'קריירה', 'Careers')}</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('اتصل بنا', 'צור קשר', 'Contact')}</Link></li>
            </ul>
          </div>

          <FooterServices
            services={services}
            loaded={servicesLoaded}
            heading={t('خدماتنا', 'שירותים', 'Services')}
            emptyLabel={t('لا توجد خدمات متاحة حالياً.', 'אין שירותים זמינים כרגע.', 'No services available')}
          />

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">{t('تواصل معنا', 'צור קשר', 'Contact us')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <span>{cmsText(cmsContent?.address, 'متاح بموعد مسبق', 'זמין בתיאום מראש', 'Available by appointment')}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                <span dir="ltr">{cmsContent?.phone ?? WHATSAPP_DISPLAY_NUMBER}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                <span>{cmsContent?.email ?? CONTACT_EMAIL}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:rtl:text-right md:ltr:text-left">
          <p className="text-brand-silver text-sm">
            &copy; {currentYear} {cmsText(cmsContent?.copyright, 'شركة T.A.S. جميع الحقوق محفوظة.', 'T.A.S. כל הזכויות שמורות.', 'T.A.S. All rights reserved.')}
          </p>
          <div className="flex gap-4 text-sm text-brand-silver">
            <Link to="/admin/login" className="hover:text-brand-gold transition-colors">{t('تسجيل دخول الإدارة', 'התחברות מנהל', 'Admin login')}</Link>
            <Link to="#" className="hover:text-white transition-colors">{t('الشروط والأحكام', 'תנאים והגבלות', 'Terms')}</Link>
            <Link to="#" className="hover:text-white transition-colors">{t('سياسة الخصوصية', 'מדיניות פרטיות', 'Privacy policy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';
import { useLanguage } from '@/i18n';
import type { CmsLocale, LocalizedText } from '@/types';
import { translated } from '@/lib/cms';

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

export function Footer({ cmsContent, previewLocale }: FooterProps = {}) {
  const currentYear = new Date().getFullYear();
  const { t, language } = useLanguage();
  const locale = previewLocale ?? language;
  const cmsText = (value: LocalizedText | undefined, ar: string, he: string) => value ? translated(value, locale) : t(ar, he);

  return (
    <footer className="bg-brand-navy text-white pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-gold/10 border border-brand-gold/30 rounded flex items-center justify-center">
                <span className="text-brand-gold font-bold text-xl">AL</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                {cmsText(cmsContent?.logoText, 'أفق الألمنيوم', 'אופק אלומיניום')}
              </span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {cmsText(cmsContent?.description, 'شركة رائدة متخصصة في تصميم وتصنيع وتركيب أنظمة الألمنيوم والزجاج المتطورة للمشاريع السكنية والتجارية بصمة معمارية فريدة.', 'חברה מובילה המתמחה בתכנון, ייצור והתקנה של מערכות אלומיניום וזכוכית מתקדמות לפרויקטים למגורים ומסחר, טביעת רגל אדריכלית ייחודית.')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-brand-surface/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-surface/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-surface/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-surface/5 flex items-center justify-center text-gray-400 hover:bg-brand-gold hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">{t('روابط سريعة', 'קישורים מהירים')}</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('عن الشركة', 'עלינו')}</Link></li>
              <li><Link to="/projects" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('معرض المشاريع', 'פרויקטים')}</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('كتالوج المنتجات', 'מוצרים')}</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('الوظائف', 'קריירה')}</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('اتصل بنا', 'צור קשר')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">{t('خدماتنا', 'שירותים')}</h3>
            <ul className="space-y-4">
              <li><Link to="/services/curtain-walls" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('واجهات الكيرتن وول', 'קירות מסך')}</Link></li>
              <li><Link to="/services/windows-doors" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('نوافذ وأبواب حرارية', 'חלונות ודלתות')}</Link></li>
              <li><Link to="/services/pergolas" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('برجولات ومظلات', 'פרגולות וסוככים')}</Link></li>
              <li><Link to="/services/handrails" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('درابزين زجاجي', 'מעקות זכוכית')}</Link></li>
              <li><Link to="/services/aluminum-cladding" className="text-gray-400 hover:text-brand-gold transition-colors block">{t('تجليد واجهات', 'חיפוי קירות')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">{t('تواصل معنا', 'צור קשר')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <span>{cmsText(cmsContent?.address, 'المنطقة الصناعية، شارع الملك فهد، الرياض، المملكة العربية السعودية', 'אזור תעשייה, רחוב המלך פהד, ריאד, ערב הסעודית')}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                <span dir="ltr">{cmsContent?.phone ?? '+966 50 123 4567'}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                <span>{cmsContent?.email ?? 'info@alu-horizon.com'}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <p className="text-brand-silver text-sm">
            &copy; {currentYear} {cmsText(cmsContent?.copyright, 'شركة أفق الألمنيوم. جميع الحقوق محفوظة.', 'אופק אלומיניום. כל הזכויות שמורות.')}
          </p>
          <div className="flex gap-4 text-sm text-brand-silver">
            <Link to="/admin/login" className="hover:text-brand-gold transition-colors">{t('تسجيل دخول الإدارة', 'התחברות מנהל')}</Link>
            <Link to="#" className="hover:text-white transition-colors">{t('الشروط والأحكام', 'תנאים והגבלות')}</Link>
            <Link to="#" className="hover:text-white transition-colors">{t('سياسة الخصوصية', 'מדיניות פרטיות')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

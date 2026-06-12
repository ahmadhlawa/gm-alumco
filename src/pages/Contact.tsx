import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { ContactForm } from '@/components/forms/ContactForm';

export function Contact() {
  const { t } = useLanguage();

  return (
    <div className="bg-brand-navy">
      <PageHero 
        title={t("اتصل بنا", "צור קשר")} 
        subtitle={t("نحن هنا للرد على استفساراتكم ومناقشة تفاصيل مشاريعكم.", "אנחנו כאן כדי לענות על שאלותיכם ולדון בפרטי הפרויקט שלכם.")}
        breadcrumbs={[{ label: t('اتصل بنا', 'צור קשר'), path: '/contact' }]}
      />

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
            >
              <SectionHeader title={t("معلومات التواصل", "פרטי התקשרות")} />
              <p className="text-brand-silver mb-12 text-lg">
                {t('نسعد بتواصلكم معنا في أي وقت. يمكنكم زيارة مقر الشركة أو مراسلتنا عبر القنوات التالية.', 'אנו נשמח להיות אתכם בקשר בכל עת. אתם מוזמנים לבקר במטה החברה או ליצור קשר דרך הערוצים הבאים.')}
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 bg-brand-surface border border-white/5 flex items-center justify-center shadow-sm group-hover:border-brand-gold group-hover:text-brand-gold transition-colors text-white shrink-0">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('العنوان', 'כתובת')}</h3>
                    <p className="text-brand-silver">{t('المنطقة الصناعية، شارع الملك فهد،', 'אזור תעשייה, רחוב המלך פהד,')}<br/>{t('الرياض، المملكة العربية السعودية', 'ריאד, ערב הסעודית')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 bg-brand-surface border border-white/5 flex items-center justify-center shadow-sm group-hover:border-brand-gold group-hover:text-brand-gold transition-colors text-white shrink-0">
                    <Phone className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('الهاتف', 'טֵלֵפוֹן')}</h3>
                    <p className="text-brand-silver" dir="ltr">+966 50 123 4567</p>
                    <p className="text-brand-silver" dir="ltr">+966 11 234 5678</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 bg-brand-surface border border-white/5 flex items-center justify-center shadow-sm group-hover:border-brand-gold group-hover:text-brand-gold transition-colors text-white shrink-0">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('البريد الإلكتروني', 'אימייל')}</h3>
                    <p className="text-brand-silver">info@alu-horizon.com</p>
                    <p className="text-brand-silver">sales@alu-horizon.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-brand-surface p-10 shadow-xl shadow-brand-border/50 border border-white/5 rounded-lg"
            >
              <h3 className="text-2xl font-bold text-white mb-8">{t('أرسل لنا رسالة', 'שלח לנו הודעה')}</h3>
              <ContactForm t={t} />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Map Placeholder */}
      <div className="h-96 bg-gray-300 w-full relative">
         <div className="absolute inset-0 flex items-center justify-center h-full text-gray-500 text-xl font-bold bg-white/20">
           [Google Maps Placeholder]
         </div>
      </div>
    </div>
  );
}

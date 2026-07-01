import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { ContactForm } from '@/components/forms/ContactForm';
import { ContactActions, WHATSAPP_DISPLAY_NUMBER } from '@/components/common/ContactActions';

export function Contact() {
  const { t } = useLanguage();

  return (
    <div className="bg-brand-navy">
      <PageHero
        title={t("اتصل بنا", "צור קשר", "Contact us")}
        subtitle={t("نحن هنا للرد على استفساراتكم ومناقشة تفاصيل مشاريعكم.", "אנחנו כאן כדי לענות על שאלותיכם ולדון בפרטי הפרויקט שלכם.", "We are here to answer your questions and discuss your project details.")}
        breadcrumbs={[{ label: t('اتصل بنا', 'צור קשר', 'Contact us'), path: '/contact' }]}
      />

      <section className="relative isolate overflow-hidden py-24">
        {/* Subtle architectural backdrop — navy-washed for text readability */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-contact.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.24]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-brand-navy/82 via-brand-navy/52 to-brand-navy/85"
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <SectionHeader title={t("معلومات التواصل", "פרטי התקשרות", "Contact information")} />
              <p className="text-brand-silver mb-12 text-lg">
                {t('نسعد بتواصلكم معنا في أي وقت. يمكنكم زيارة مقر الشركة أو مراسلتنا عبر القنوات التالية.', 'נשמח להיות איתכם בקשר בכל עת. אתם מוזמנים לבקר במטה החברה או ליצור קשר דרך הערוצים הבאים.', 'We are happy to hear from you at any time. You can visit our office or contact us through the following channels.')}
              </p>

              <ContactActions title={t('تواصل معنا مباشرة', 'צרו איתנו קשר ישירות', 'Contact us directly')} className="mb-12" />

              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 bg-brand-surface border border-white/5 flex items-center justify-center shadow-sm group-hover:border-brand-gold group-hover:text-brand-gold transition-colors text-white shrink-0">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('العنوان', 'כתובת', 'Address')}</h3>
                    <p className="text-brand-silver">{t('متاح بموعد مسبق', 'זמין בתיאום מראש', 'Available by appointment')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 bg-brand-surface border border-white/5 flex items-center justify-center shadow-sm group-hover:border-brand-gold group-hover:text-brand-gold transition-colors text-white shrink-0">
                    <Phone className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('الهاتف', 'טלפון', 'Phone')}</h3>
                    <p className="text-brand-silver" dir="ltr">{WHATSAPP_DISPLAY_NUMBER}</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 bg-brand-surface border border-white/5 flex items-center justify-center shadow-sm group-hover:border-brand-gold group-hover:text-brand-gold transition-colors text-white shrink-0">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('البريد الإلكتروني', 'אימייל', 'Email')}</h3>
                    <p className="text-brand-silver" dir="ltr">Mina@techno-alum.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-brand-surface p-10 shadow-xl shadow-brand-border/50 border border-white/5 rounded-lg"
            >
              <h3 className="text-2xl font-bold text-white mb-8">{t('أرسل لنا رسالة', 'שלח לנו הודעה', 'Send us a message')}</h3>
              <ContactForm t={t} />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="h-96 bg-gray-300 w-full relative">
         <div className="absolute inset-0 flex items-center justify-center h-full text-gray-500 text-xl font-bold bg-white/20">
           [Google Maps Placeholder]
         </div>
      </div>
    </div>
  );
}

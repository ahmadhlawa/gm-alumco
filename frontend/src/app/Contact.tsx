import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { motion } from 'motion/react';
import { ExternalLink, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { ContactForm } from '@/components/forms/ContactForm';
import { ContactActions, WHATSAPP_DISPLAY_NUMBER } from '@/components/common/ContactActions';

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/pYcDJeSKoVqDzdrP7';
const ADDRESS_EN = 'Isefya, Abu Hushi Street 5';
const ADDRESS_HE = 'עוספיא, רח׳ אבא חושי 5';

export function Contact() {
  const { t } = useLanguage();

  return (
    <div className="bg-brand-navy">
      <PageHero
        title={t("צור קשר", "Contact us")}
        subtitle={t("אנחנו כאן כדי לענות על שאלותיכם ולדון בפרטי הפרויקט שלכם.", "We are here to answer your questions and discuss your project details.")}
        breadcrumbs={[{ label: t('צור קשר', 'Contact us'), path: '/contact' }]}
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
              <SectionHeader title={t("פרטי התקשרות", "Contact information")} />
              <p className="text-brand-silver mb-12 text-lg">
                {t('נשמח להיות איתכם בקשר בכל עת. אתם מוזמנים לבקר במטה החברה או ליצור קשר דרך הערוצים הבאים.', 'We are happy to hear from you at any time. You can visit our office or contact us through the following channels.')}
              </p>

              <ContactActions title={t('צרו איתנו קשר ישירות', 'Contact us directly')} className="mb-12" />

              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 bg-brand-surface border border-white/5 flex items-center justify-center shadow-sm group-hover:border-brand-gold group-hover:text-brand-gold transition-colors text-white shrink-0">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('כתובת', 'Address')}</h3>
                    <p className="text-brand-silver">{t('זמין בתיאום מראש', 'Available by appointment')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 bg-brand-surface border border-white/5 flex items-center justify-center shadow-sm group-hover:border-brand-gold group-hover:text-brand-gold transition-colors text-white shrink-0">
                    <Phone className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('טלפון', 'Phone')}</h3>
                    <p className="text-brand-silver" dir="ltr">{WHATSAPP_DISPLAY_NUMBER}</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-16 h-16 bg-brand-surface border border-white/5 flex items-center justify-center shadow-sm group-hover:border-brand-gold group-hover:text-brand-gold transition-colors text-white shrink-0">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('אימייל', 'Email')}</h3>
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
              <h3 className="text-2xl font-bold text-white mb-8">{t('שלח לנו הודעה', 'Send us a message')}</h3>
              <ContactForm t={t} />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/5 bg-brand-surface py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-brand-gold">
                {t('מיקום', 'Location')}
              </p>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                {t('בקרו אותנו במשרד', 'Visit our office')}
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-brand-silver">
                {t('אנו מקבלים לקוחות ושותפים במיקום שלנו בעוספיא לתיאום פרויקטים ופרטים הנדסיים.',
                  'We welcome clients and partners at our Isefya location for project planning and engineering details.',
                )}
              </p>
            </div>

            <div className="rounded-lg border border-brand-gold/30 bg-brand-navy p-8 shadow-2xl shadow-black/30 md:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-brand-gold/40 bg-brand-gold text-brand-navy">
                    <MapPin className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-gold">
                      GM Alumco
                    </p>
                    <address className="mt-4 space-y-2 not-italic">
                      <p className="text-2xl font-bold text-white" dir="ltr">{ADDRESS_EN}</p>
                      <p className="text-2xl font-bold text-white" dir="rtl">{ADDRESS_HE}</p>
                    </address>
                  </div>
                </div>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-3 bg-brand-gold px-6 py-3 font-bold text-brand-navy transition-colors hover:bg-[#e3c458] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
                >
                  <Navigation className="h-5 w-5" aria-hidden="true" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { motion } from 'motion/react';
import { useLanguage } from '@/i18n';
import { QuoteRequestForm } from '@/components/forms/QuoteRequestForm';
import { ContactActions } from '@/components/common/ContactActions';

export function RequestQuote() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-brand-navy">
      {/* Subtle architectural backdrop + premium navy wash */}
      <img
        src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.07]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(185,199,228,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(185,199,228,0.04)_1px,transparent_1px)] bg-[size:46px_46px]" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-brand-navy/40 via-transparent to-brand-navy" />

      {/* Faint geometric accent shape */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 right-[8%] hidden h-56 w-56 border border-brand-gold/15 lg:block"
        style={{ clipPath: 'polygon(50% 0%, 100% 28%, 100% 72%, 50% 100%, 0% 72%, 0% 28%)' }}
      />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[38fr_62fr] lg:gap-16 lg:py-28">
        {/* Left — info panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src="/images/logo-TAS-transparent.png" alt="T.A.S" className="h-14 w-auto object-contain" />

          <span className="mt-10 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.25em] text-brand-gold">
            <span className="h-px w-8 bg-brand-gold" />
            {t('اطلب عرض سعر', 'בקשת הצעת מחיר', 'Request a Quote')}
          </span>

          <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl">
            {t('احصل على عرض سعر لمشروعك', 'קבלת הצעת מחיר לפרויקט שלך', 'Get a quote for your project')}
          </h1>

          <p className="mt-5 max-w-md text-lg leading-8 text-brand-silver">
            {t(
              'شاركنا تفاصيل مشروعك وسيقوم فريقنا الهندسي بدراستها وتقديم أفضل عرض سعر يناسب رؤيتك.',
              'שתפו אותנו בפרטי הפרויקט והצוות ההנדסי שלנו ילמד אותם ויחזור אליכם עם הצעת המחיר הטובה ביותר.',
              'Share your project details and our engineering team will review them and return the best quote tailored to your vision.',
            )}
          </p>

          <ContactActions
            title={t('هل تحتاج إلى مساعدة فورية؟', 'זקוקים לעזרה מיידית?', 'Need immediate help?')}
            compact
            className="mt-10 max-w-md"
          />
        </motion.div>

        {/* Right — form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/10 bg-brand-surface/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8 lg:p-10"
        >
          <h2 className="mb-6 text-xl font-bold text-white">
            {t('تفاصيل المشروع', 'פרטי הפרויקט', 'Project details')}
          </h2>
          <QuoteRequestForm />
        </motion.div>
      </div>
    </section>
  );
}

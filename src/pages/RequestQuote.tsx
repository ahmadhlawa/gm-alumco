import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { motion } from 'motion/react';
import { useLanguage } from '@/lib/i18n';
import { QuoteRequestForm } from '@/components/forms/QuoteRequestForm';

export function RequestQuote() {
  const { t } = useLanguage();

  return (
    <div className="bg-brand-navy min-h-screen">
      <PageHero 
        title={t("اطلب عرض سعر", "בקש הצעת מחיר")} 
        subtitle={t("قدم تفاصيل مشروعك وسيقوم فريقنا الهندسي بدراستها وتقديم أفضل عرض سعر.", "הגש את פרטי הפרויקט שלך והצוות ההנדסי שלנו ילמד אותם ויספק את הצעת המחיר הטובה ביותר.")}
        breadcrumbs={[{ label: t('عرض سعر', 'הצעת מחיר'), path: '/request-quote' }]}
        image="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80"
      />

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-brand-surface p-8 md:p-12 shadow-2xl shadow-brand-border/50 border border-white/5 rounded-lg"
            >
              <SectionHeader title={t("تفاصيل المشروع", "פרטי פרויקט")} centered className="mb-10" />
              <QuoteRequestForm t={t} />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { useEffect, useState } from 'react';
import { getPublicStatsContent } from '@/api/content';
import { defaultPublicStats, type PublicStatsContent } from '@/data/publicStats';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/i18n';

export function About() {
  const { t } = useLanguage();
  const [publicStats, setPublicStats] = useState<PublicStatsContent>(defaultPublicStats);
  const stats = publicStats.aboutPageStats.map((stat) => ({
    value: stat.value,
    label: t(stat.label.ar, stat.label.he, stat.label.en),
    suffix: stat.suffix ?? '',
  }));
  const highlight = publicStats.aboutHighlight;

  useEffect(() => {
    getPublicStatsContent().then(setPublicStats).catch(() => setPublicStats(defaultPublicStats));
  }, []);

  return (
    <div className="bg-brand-surface">
      <PageHero 
        title={t("عن T.A.S", "על T.A.S", "About T.A.S")}
        subtitle={t("شريكك الموثوق في تقديم أرقى حلول الواجهات الزجاجية والألمنيوم.", "השותף המהימן שלך במתן פתרונות חזית זכוכית ואלומיניום.", "Your trusted partner in delivering the finest glass and aluminum facade solutions.")}
        breadcrumbs={[{ label: t('عن الشركة', 'אודות', "About"), path: '/about' }]}
        image="https://images.unsplash.com/photo-1541888048600-410a8d622941?auto=format&fit=crop&q=80"
      />

      <section className="relative isolate overflow-hidden py-24">
        {/* Subtle architectural backdrop — navy-washed for text readability */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-about.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.14]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-brand-surface/95 via-brand-surface/88 to-brand-surface/95"
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader 
                title={t("قصة نجاحنا", "סיפור ההצלחה שלנו", "Our success story")} 
                subtitle={t("رحلة من الشغف في عالم الهندسة المعمارية بدأناها لتقديم الجودة التي تليق بكم.", "מסע של תשוקה בעולם האדריכלות למען איכות.", "A journey of passion in architecture, begun to deliver the quality you deserve.")}
              />
              <p className="text-brand-silver mb-6 leading-relaxed text-lg">
                {t('تأسست شركة T.A.S برؤية واضحة تهدف إلى إحداث نقلة نوعية في صناعة الواجهات الزجاجية وأنظمة الألمنيوم في المنطقة. منذ اليوم الأول، ركزنا على الجودة الفائقة، والالتزام بالمعايير الهندسية الدقيقة، واحترام مواعيد تسليم المشاريع.', 'T.A.S הוקמה בחזון ברור לחולל שינוי מהותי בתעשיית קירוי מבנים ומערכות אלומיניום.', "T.A.S was founded with a clear vision to drive a real shift in the building cladding and aluminum systems industry. From day one we have focused on superior quality, strict engineering standards and on-time delivery.")}
              </p>
              <p className="text-brand-silver mb-8 leading-relaxed text-lg">
                {t('نحن نفخر بتوظيف نخبة من الكوادر الهندسية والفنية، ونسعى دائماً لاعتماد أحدث ما توصلت إليه تكنولوجيا التصنيع، لضمان تقديم حلول مستدامة وآمنة للقطاعين السكني والتجاري.', 'אנו גאים להעסיק אנשי מקצוע ומהנדסים מובילים לפיתוח בר קיימא עבור המגזר הפרטי והעסקי.', "We are proud to employ leading professionals and engineers, and we continually adopt the latest manufacturing technology to deliver sustainable, safe solutions for the residential and commercial sectors.")}
              </p>
              
              <ul className="space-y-4">
                {[
                  t('تطبيق أقصى معايير السلامة والجودة', 'יישום תקני בטיחות ואיכות מחמירים', "Applying the strictest safety and quality standards"),
                  t('استخدام مواد أولية معتمدة عالمياً', 'שימוש בחומרי גלם באישור בינלאומי', "Using internationally certified raw materials"),
                  t('فريق فني ذو كفاءة وخبرة عالية', 'צוות טכני מיומן ומנוסה', "A skilled and experienced technical team"),
                  t('خدمات ما بعد البيع وضمان حقيقي', 'שירותי לאחר המכירה ואחריות מקיפה', "Comprehensive after-sales service and genuine warranty")
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-medium">
                    <CheckCircle2 className="text-brand-gold w-5 h-5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80" 
                alt="Our Engineering Team" 
                className="w-full h-[500px] object-cover rounded-sm shadow-2xl shadow-brand-border/50"
              />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-navy border-8 border-brand-surface p-6 hidden md:flex flex-col justify-center text-center">
                <span className="text-brand-gold text-5xl font-bold mb-2" dir="ltr">{highlight.value}{highlight.suffix ?? ''}</span>
                <span className="text-white">{t(highlight.label.ar, highlight.label.he, highlight.label.en)}</span>
              </div>
            </motion.div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {stats.map((stat, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className="bg-brand-navy p-8 text-center border-b-4 border-transparent hover:border-brand-gold transition-colors"
               >
                 <div className="text-4xl lg:text-5xl font-bold text-white mb-4" dir="ltr">{stat.value}{stat.suffix}</div>
                 <div className="text-brand-silver font-bold">{stat.label}</div>
               </motion.div>
            ))}
          </div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-brand-navy text-white p-12"
            >
              <h3 className="text-3xl font-bold mb-6 text-brand-gold">{t('رؤيتنا', 'החזון שלנו', "Our vision")}</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {t('أن نكون الخيار الأول والشركة الرائدة في مجال تقديم الحلول المعمارية المبتكرة من الألمنيوم والزجاج في المنطقة، من خلال إرساء معايير جديدة للجودة، التصميم، والموثوقية.', 'להיות הבחירה הראשונה והחברה המובילה במתן פתרונות אלומיניום וזכוכית חדשניים ואיכותיים ביות', "To be the first choice and leading company providing innovative aluminum and glass solutions in the region, setting new standards for quality, design and reliability.")}
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-brand-navy border border-white/5 p-12"
            >
              <h3 className="text-3xl font-bold mb-6 text-white">{t('رسالتنا', 'המשימה שלנו', "Our mission")}</h3>
              <p className="text-brand-silver leading-relaxed text-lg">
                {t('تلبية تطلعات عملائنا عبر تصميم وإنتاج أنظمة متطورة تصمد أمام الزمن، مع الالتزام بأعلى قيم النزاهة المهنية وتقديم خدمة عملاء استثنائية قبل وأثناء وبعد التنفيذ.', 'לספק מענה מלא לדרישות הלקוחות בעזרת ייצור מתקדם ואמינות מתמשכת לפני, תוך ולאחר הייצור.', "To fully meet our clients' aspirations through advanced, time-resistant systems, with the highest professional integrity and exceptional service before, during and after execution.")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}

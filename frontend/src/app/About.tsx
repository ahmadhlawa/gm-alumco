import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { getCompanyStats } from '@/data/siteContent';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/i18n';

export function About() {
  const { t } = useLanguage();
  const stats = getCompanyStats(t);

  return (
    <div className="bg-brand-surface">
      <PageHero 
        title={t("عن T.A.S", "על T.A.S")}
        subtitle={t("شريكك الموثوق في تقديم أرقى حلول الواجهات الزجاجية والألمنيوم.", "השותף המהימן שלך במתן פתרונות חזית זכוכית ואלומיניום.")}
        breadcrumbs={[{ label: t('عن الشركة', 'عن الشركة'), path: '/about' }]}
        image="https://images.unsplash.com/photo-1541888048600-410a8d622941?auto=format&fit=crop&q=80"
      />

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader 
                title={t("قصة نجاحنا", "סיפור ההצלחה שלנו")} 
                subtitle={t("رحلة من الشغف في عالم الهندسة المعمارية بدأناها لتقديم الجودة التي تليق بكم.", "מסע של תשוקה בעולם האדריכלות למען איכות.")}
              />
              <p className="text-brand-silver mb-6 leading-relaxed text-lg">
                {t('تأسست شركة T.A.S برؤية واضحة تهدف إلى إحداث نقلة نوعية في صناعة الواجهات الزجاجية وأنظمة الألمنيوم في المنطقة. منذ اليوم الأول، ركزنا على الجودة الفائقة، والالتزام بالمعايير الهندسية الدقيقة، واحترام مواعيد تسليم المشاريع.', 'T.A.S הוקמה בחזון ברור לחולל שינוי מהותי בתעשיית קירוי מבנים ומערכות אלומיניום.')}
              </p>
              <p className="text-brand-silver mb-8 leading-relaxed text-lg">
                {t('نحن نفخر بتوظيف نخبة من الكوادر الهندسية والفنية، ونسعى دائماً لاعتماد أحدث ما توصلت إليه تكنولوجيا التصنيع، لضمان تقديم حلول مستدامة وآمنة للقطاعين السكني والتجاري.', 'אנו גאים להעסיק אנשי מקצוע ומהנדסים מובילים לפיתוח בר קיימא עבור המגזר הפרטי והעסקי.')}
              </p>
              
              <ul className="space-y-4">
                {[
                  t('تطبيق أقصى معايير السلامة والجودة', 'יישום תקני בטיחות ואיכות מחמירים'),
                  t('استخدام مواد أولية معتمدة عالمياً', 'שימוש בחומרי גלם באישור בינלאומי'),
                  t('فريق فني ذو كفاءة وخبرة عالية', 'צוות טכני מיומן ומנוסה'),
                  t('خدمات ما بعد البيع وضمان حقيقي', 'שירותי לאחר המכירה ואחריות מקיפה')
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
                <span className="text-brand-gold text-5xl font-bold mb-2">15+</span>
                <span className="text-white">{t('عاماً من الريادة في المملكة', 'שנים של מצוינות בבנייה')}</span>
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
                 <div className="text-4xl lg:text-5xl font-bold text-white mb-4" dir="ltr">{stat.value}</div>
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
              <h3 className="text-3xl font-bold mb-6 text-brand-gold">{t('رؤيتنا', 'החזון שלנו')}</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {t('أن نكون الخيار الأول والشركة الرائدة في مجال تقديم الحلول المعمارية المبتكرة من الألمنيوم والزجاج في المنطقة، من خلال إرساء معايير جديدة للجودة، التصميم، والموثوقية.', 'להיות הבחירה הראשונה והחברה המובילה במתן פתרונות אלומיניום וזכוכית חדשניים ואיכותיים ביות')}
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-brand-navy border border-white/5 p-12"
            >
              <h3 className="text-3xl font-bold mb-6 text-white">{t('رسالتنا', 'המשימה שלנו')}</h3>
              <p className="text-brand-silver leading-relaxed text-lg">
                {t('تلبية تطلعات عملائنا عبر تصميم وإنتاج أنظمة متطورة تصمد أمام الزمن، مع الالتزام بأعلى قيم النزاهة المهنية وتقديم خدمة عملاء استثنائية قبل وأثناء وبعد التنفيذ.', 'לספק מענה מלא לדרישות הלקוחות בעזרת ייצור מתקדם ואמינות מתמשכת לפני, תוך ולאחר הייצור.')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}

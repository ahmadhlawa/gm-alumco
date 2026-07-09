import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { useEffect, useState } from 'react';
import { getAboutPageContent } from '@/api/aboutPageContent';
import { toAboutContentView } from '@/api/adapters';
import { defaultAboutPageContent } from '@/data/aboutPageContent';
import type { AboutPageContentDto } from '@/api/types';
import { getPublicStatsContent } from '@/api/content';
import { defaultPublicStats, type PublicStatsContent } from '@/data/publicStats';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { normalizeImageUrl } from '@/lib/utils';

export function About() {
  const { t, language } = useLanguage();
  const [aboutContent, setAboutContent] = useState<AboutPageContentDto>(defaultAboutPageContent);
  // The Difference/Stats/CTA band is fixed website structure, not admin
  // content — it keeps reading from the pre-existing public_stats system
  // (also used by the Home page hero and the "Company numbers" admin page),
  // not from about_page_content.
  const [publicStats, setPublicStats] = useState<PublicStatsContent>(defaultPublicStats);
  const stats = publicStats.aboutPageStats.map((stat) => ({
    value: stat.value,
    label: t(stat.label.he, stat.label.en),
    suffix: stat.suffix ?? '',
  }));

  useEffect(() => {
    getAboutPageContent()
      .then(setAboutContent)
      .catch(() => setAboutContent(defaultAboutPageContent));
    getPublicStatsContent().then(setPublicStats).catch(() => setPublicStats(defaultPublicStats));
    // Run once on mount; the view below re-derives from `language` on every
    // render, so a language toggle updates instantly without refetching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const content = toAboutContentView(aboutContent, language);

  return (
    <div className="bg-brand-surface">
      <PageHero
        title={t("על T.A.S", "About T.A.S")}
        subtitle={t("השותף המהימן שלך במתן פתרונות חזית זכוכית ואלומיניום.", "Your trusted partner in delivering the finest glass and aluminum facade solutions.")}
        breadcrumbs={[{ label: t('אודות', "About"), path: '/about' }]}
        image="/images/backgrounds/tas-bg-about.webp"
      />

      <section className="relative isolate overflow-hidden py-24">
        {/* Subtle architectural backdrop — navy-washed for text readability */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-about.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.24]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-brand-surface/82 via-brand-surface/52 to-brand-surface/85"
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                title={content.title}
                subtitle={content.subtitle}
              />
              <p className="text-brand-silver mb-6 leading-relaxed text-lg">
                {content.paragraph1}
              </p>
              <p className="text-brand-silver mb-8 leading-relaxed text-lg">
                {content.paragraph2}
              </p>

              <ul className="space-y-4">
                {content.bullets.map((item, i) => (
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
                src={normalizeImageUrl(content.imageUrl)}
                alt="Our Engineering Team"
                className="w-full h-[500px] object-cover rounded-sm shadow-2xl shadow-brand-border/50"
              />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-navy border-8 border-brand-surface p-6 hidden md:flex flex-col justify-center text-center">
                <span className="text-brand-gold text-5xl font-bold mb-2" dir="ltr">{content.experienceNumber}</span>
                <span className="text-white">{content.experienceLabel}</span>
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
              <h3 className="text-3xl font-bold mb-6 text-brand-gold">{content.visionTitle}</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {content.visionText}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-brand-navy border border-white/5 p-12"
            >
              <h3 className="text-3xl font-bold mb-6 text-white">{content.missionTitle}</h3>
              <p className="text-brand-silver leading-relaxed text-lg">
                {content.missionText}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}

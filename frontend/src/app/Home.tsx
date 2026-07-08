import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/common/Button';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { SuccessPartners } from '@/components/sections/SuccessPartners';
import { FeaturedProjectsShowcase } from '@/components/sections/FeaturedProjectsShowcase';
import { GeometricHero } from '@/components/sections/GeometricHero';
import { HomepageVideoSection } from '@/components/sections/HomepageVideoSection';
import { ServicesShowcase } from '@/components/sections/ServicesShowcase';
import { getServices, getProjects, getTestimonials } from '@/lib/api';
import { getHomepageVideoSection } from '@/api/homepageVideoSection';
import type { HomepageVideoSectionDto } from '@/api/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';
import { ShieldCheck, Ruler, Clock, LayoutTemplate, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { Service, Project, Testimonial } from '@/types';
import { siteContent } from '@/data/siteContent';
import { defaultPublicStats, type PublicStatsContent } from '@/data/publicStats';
import { getPublicStatsContent } from '@/api/content';
import {
  HOME_SECTION_IDS,
  scrollToHomeSection,
  type HomeSectionId,
} from '@/lib/homeNavigation';

export function Home() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const content = siteContent;
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [publicStats, setPublicStats] = useState<PublicStatsContent>(defaultPublicStats);
  const [videoSection, setVideoSection] = useState<HomepageVideoSectionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(1);

  const stats = publicStats.aboutPreviewStats.map(stat => ({
    value: stat.value,
    label: t(stat.label.he, stat.label.en),
    suffix: stat.suffix ?? '',
  }));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getServices(language),
      getProjects(language),
      getTestimonials(language),
      getPublicStatsContent(),
      getHomepageVideoSection().catch(() => null)
    ]).then(([svcs, projs, tests, statsContent, video]) => {
      setServices(svcs);
      setProjects(projs);
      setTestimonials(tests);
      setPublicStats(statsContent);
      setVideoSection(video);
    }).catch(() => {
      setServices([]);
      setProjects([]);
      setTestimonials([]);
      setPublicStats(defaultPublicStats);
      setVideoSection(null);
    }).finally(() => setLoading(false));
  }, [language]);

  // Cross-route navbar clicks scroll after API-backed homepage sections render.
  const scrollTarget = (location.state as { scrollTo?: string } | null)?.scrollTo;
  useEffect(() => {
    if (loading || !HOME_SECTION_IDS.includes(scrollTarget as HomeSectionId)) return;
    requestAnimationFrame(() => scrollToHomeSection(scrollTarget as HomeSectionId));
    // Clear the navigation state so the scroll does not repeat on refresh/back.
    window.history.replaceState({}, '');
  }, [loading, scrollTarget]);

  useEffect(() => {
    setActiveTestimonial((current) => {
      if (testimonials.length === 0) return 0;
      return Math.min(current, testimonials.length - 1);
    });
  }, [testimonials.length]);

  const activeTestimonialIndex = testimonials.length > 0
    ? Math.min(activeTestimonial, testimonials.length - 1)
    : 0;
  const showTestimonialControls = testimonials.length > 1;
  const goToTestimonial = (delta: number) => {
    setActiveTestimonial((current) => {
      if (testimonials.length === 0) return 0;
      return (Math.min(current, testimonials.length - 1) + delta + testimonials.length) % testimonials.length;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-navy">
        <LoadingState variant="page" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <GeometricHero stats={publicStats.heroStats} valueChips={publicStats.valueChips} heroSince={publicStats.heroSince} />

      {/* Configurable full-width autoplay video (renders nothing when disabled) */}
      <HomepageVideoSection section={videoSection} />

      {/* About Preview */}
      <section id="about" className="relative isolate scroll-mt-24 overflow-hidden py-24 bg-brand-surface">
        {/* Decorative architectural backdrop — subtle, navy-washed for readability */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-about.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.26]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-brand-surface/82 via-brand-surface/52 to-brand-navy/78"
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader 
                title={t(content.about.title.he, content.about.title.en)}
                subtitle={t(content.about.subtitle.he, content.about.subtitle.en)}
              />
              <p className="text-brand-silver mb-8 leading-relaxed text-lg">
                {t(content.about.description.he, content.about.description.en)}
              </p>
              <Button href="/about" variant="outline">
                {t(content.about.buttonText.he, content.about.buttonText.en)}
              </Button>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-6 font-sans">
              {stats.map((stat, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-brand-navy p-8 border border-white/5 text-center hover:border-brand-gold transition-colors block"
                 >
                   <div className="text-4xl font-bold text-white mb-2" dir="ltr">{stat.value}{stat.suffix}</div>
                   <div className="text-brand-silver font-medium">{stat.label}</div>
                 </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServicesShowcase
        services={services}
        title={t(content.services.title.he, content.services.title.en)}
        subtitle={t(content.services.subtitle.he, content.services.subtitle.en)}
        emptyMessage={t('אין שירותים זמינים כרגע.', "No services available at the moment.")}
        actionLabel={t('בקש ייעוץ', "Request a consultation")}
      />

      {/* Featured Projects */}
      <FeaturedProjectsShowcase projects={projects} />

      {/* Process / Why Choose Us */}
      <section className="py-24 bg-brand-navy text-white relative isolate overflow-hidden">
        {/* Aluminum & glass facade backdrop — subtle texture behind the grid */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-process.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.30]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-brand-navy/80 via-brand-navy/50 to-brand-navy/85"
        />
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader 
            title={t("איך אנחנו עובדים", "How we work")}
            subtitle={t("אנו עוקבים אחר צעדים זהירים כדי להבטיח את הסטנדרטים הגבוהים ביותר.", "We follow careful, considered steps to ensure your project is delivered to the highest standards.")}
            light
            centered
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: t("ייעוץ ועיצוב", "Consultation & design"), desc: t("לימוד דרישות והגשת הצעות הנדסיות.", "Studying requirements and presenting architectural engineering proposals."), icon: Ruler },
              { title: t("מדידה מסחרית", "Site survey"), desc: t("מדידות מדויקות לאתר באמצעות המכשירים העדכניים.", "Precise on-site measurements using the latest equipment."), icon: ShieldCheck },
              { title: t("ייצור מצטיין", "Premium manufacturing"), desc: t("ייצור בגובה רב בסדנאות המצוידות שלנו.", "High-quality manufacturing in our fully equipped workshops."), icon: LayoutTemplate },
              { title: t("התקנה ואחריות", "Installation & warranty"), desc: t("התקנה מקצועית ואספקה עם תעודת אחריות.", "Professional installation and handover with a warranty certificate."), icon: Clock },
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-brand-surface/5 border border-white/10 p-8 backdrop-blur-sm hover:bg-brand-surface/10 transition-colors"
              >
                <step.icon className="w-12 h-12 text-brand-gold mb-6" />
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Partners */}
      <SuccessPartners />

      {/* Testimonials — only rendered when real testimonials exist (no orphan section) */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="relative isolate scroll-mt-24 overflow-hidden bg-brand-navy py-24">
          <img
            aria-hidden
            src="/images/backgrounds/tas-bg-about.webp"
            alt=""
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.24]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-brand-navy/82 via-brand-navy/50 to-brand-navy/85"
          />
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-14 max-w-4xl text-center">
              <span className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-brand-gold">
                {t('לקוחות', 'Testimonials')}
              </span>
              <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">
                {t(content.testimonials.title.he, content.testimonials.title.en)}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-silver">
                {t(content.testimonials.subtitle.he, content.testimonials.subtitle.en)}
              </p>
            </div>

            <div className="relative mx-auto flex min-h-[520px] max-w-5xl items-center justify-center [perspective:1200px]">
              {testimonials.map((testimonial, idx) => {
                const offset = (idx - activeTestimonialIndex + testimonials.length) % testimonials.length;
                const isActive = idx === activeTestimonialIndex;
                const isPrevious = showTestimonialControls && testimonials.length > 2 && offset === testimonials.length - 1;
                const isNext = showTestimonialControls && offset === 1;
                const isSide = isPrevious || isNext;

                return (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    index={idx}
                    active={isActive}
                    className={cn(
                      'absolute inset-x-0 mx-auto max-w-lg md:max-w-2xl',
                      isActive && 'z-20 scale-100 opacity-100',
                      isPrevious && 'z-10 hidden opacity-40 grayscale md:flex ltr:md:-translate-x-[42%] rtl:md:translate-x-[42%] md:scale-[0.82]',
                      isNext && 'z-10 hidden opacity-40 grayscale md:flex ltr:md:translate-x-[42%] rtl:md:-translate-x-[42%] md:scale-[0.82]',
                      !isActive && !isSide && 'pointer-events-none hidden opacity-0',
                    )}
                  />
                );
              })}
            </div>

            {showTestimonialControls && (
              <div className="mt-12 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => goToTestimonial(-1)}
                  aria-label={t('הקודם', 'Previous testimonial')}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-gold/35 text-brand-gold transition hover:bg-brand-gold hover:text-brand-navy"
                >
                  <ChevronLeft className="h-7 w-7 rtl:rotate-180" />
                </button>
                <div className="flex items-center gap-3">
                  {testimonials.map((testimonial, idx) => (
                    <button
                      key={testimonial.id}
                      type="button"
                      onClick={() => setActiveTestimonial(idx)}
                      aria-label={t('בחר המלצה', 'Select testimonial')}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        idx === activeTestimonialIndex ? 'w-6 bg-brand-gold' : 'w-2 bg-white/25 hover:bg-white/50',
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => goToTestimonial(1)}
                  aria-label={t('הבא', 'Next testimonial')}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-gold/35 text-brand-gold transition hover:bg-brand-gold hover:text-brand-navy"
                >
                  <ChevronRight className="h-7 w-7 rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}

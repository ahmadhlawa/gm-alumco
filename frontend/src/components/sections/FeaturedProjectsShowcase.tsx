import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { Building2, Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { Project } from '@/types';
import { useLanguage } from '@/i18n';
import { projectCategoryLabel } from '@/lib/projectCategories';
import { cn, handleImageError, normalizeImageUrl } from '@/lib/utils';

interface FeaturedProjectsShowcaseProps {
  projects: Project[];
}

const AUTOPLAY_MS = 5500;

// Cinematic easing reused across the staged reveal.
const EASE = [0.22, 1, 0.36, 1] as const;

// The image leads the sequence; content waits, then reveals one layer at a time.
const contentStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.42 } },
};

const layerReveal: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE } },
};

export function FeaturedProjectsShowcase({ projects }: FeaturedProjectsShowcaseProps) {
  const { t, dir, language } = useLanguage();
  const isLtr = dir === 'ltr';

  // Prefer featured projects; fall back to all active projects from the API.
  const showcase = useMemo(() => {
    const featured = projects.filter((project) => project.featured);
    return featured.length > 0 ? featured : projects;
  }, [projects]);

  const total = showcase.length;
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Keep the active index valid when the dataset changes (e.g. language switch).
  useEffect(() => {
    setActive((current) => (total === 0 ? 0 : current % total));
  }, [total]);

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      setActive((index + total) % total);
    },
    [total],
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Autoplay, paused on hover/focus.
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, total]);

  const title = t(
    'بعض من أعمالنا التي نفتخر بها',
    'כמה מהעבודות שאנו גאים בהן',
    'Some of the work we are proud of',
  );
  const subtitle = t(
    'مجموعة مختارة من مشاريع T.A.S التي تعكس التزامنا بالجودة والدقة والابتكار.',
    'מבחר פרויקטים של T.A.S המשקפים את המחויבות שלנו לאיכות, לדיוק ולחדשנות.',
    'A curated selection of T.A.S projects reflecting our commitment to quality, precision and innovation.',
  );
  const fallbackChips = [
    t('واجهات زجاجية', 'חזיתות זכוכית', 'Glass facades'),
    t('ألمنيوم عالي الجودة', 'אלומיניום באיכות גבוהה', 'High-quality aluminum'),
    t('تنفيذ احترافي', 'ביצוע מקצועי', 'Professional execution'),
  ];

  const current = showcase[active] ?? showcase[0];
  const chips = current?.tags && current.tags.length > 0 ? current.tags : fallbackChips;
  const description = current ? current.shortDescription || current.description || '' : '';

  return (
    <section
      id="projects"
      dir={dir}
      className="relative isolate flex min-h-[92vh] scroll-mt-24 flex-col justify-center overflow-hidden bg-brand-navy py-16 lg:py-20"
    >
      {/* Soft gold glow accents */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl"
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.1, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-brand-gold/5 blur-3xl"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section header — tightened to keep the showcase immersive */}
        <div className="mx-auto mb-10 max-w-3xl text-center lg:mb-12">
          <span className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.3em] text-brand-gold">
            <span className="h-px w-8 bg-brand-gold" /> T.A.S
          </span>
          <h2 className="text-3xl font-black leading-tight text-white md:text-4xl lg:text-5xl">{title}</h2>
          <p className="mt-4 text-lg leading-8 text-brand-silver">{subtitle}</p>
        </div>

        {total === 0 || !current ? (
          <div className="mx-auto flex min-h-[300px] max-w-xl flex-col items-center justify-center border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-gold/10">
              <Building2 className="h-7 w-7 text-brand-gold" />
            </div>
            <p className="text-xl font-bold text-white">
              {t('سيتم إضافة مشاريعنا قريباً', 'הפרויקטים שלנו יתווספו בקרוב', 'Our projects will be added soon')}
            </p>
          </div>
        ) : (
          <div
            className="grid items-center gap-8 lg:grid-cols-[1.85fr_1fr] lg:gap-12 xl:gap-16"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Hero showcase image — the dominant visual element */}
            <div className="group relative">
              {/* gold halo bloom behind the frame */}
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-brand-gold/15 blur-3xl transition-opacity duration-700 group-hover:bg-brand-gold/20" />

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/5 sm:aspect-[16/10] lg:aspect-auto lg:h-[75vh]">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, clipPath: 'inset(10% 0% 0% 0%)' }}
                    animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.95, ease: EASE }}
                    className="absolute inset-0"
                  >
                    {/* slow cinematic zoom (Ken Burns) — restarts each slide */}
                    <motion.img
                      src={normalizeImageUrl(current.mainImage)}
                      onError={handleImageError}
                      alt={current.title}
                      draggable={false}
                      initial={{ scale: 1 }}
                      animate={{ scale: 1.03 }}
                      transition={{ duration: 7, ease: 'easeOut' }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* cinematic gradient overlay for depth + legibility */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-navy/70 via-brand-navy/5 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-brand-gold/5 via-transparent to-transparent" />
                {/* soft top sheen + inset edge for premium glass-like depth */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-white/10 to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" />

                {/* Category badge */}
                {current.category && (
                  <motion.span
                    key={`cat-${current.id}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
                    className="absolute top-5 z-[4] rounded-full bg-brand-gold px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-navy shadow-lg shadow-black/30 ltr:left-5 rtl:right-5"
                  >
                    {projectCategoryLabel(current.category, language)}
                  </motion.span>
                )}

                {/* Slide counter */}
                {total > 1 && (
                  <div className="absolute bottom-5 z-[4] flex items-baseline gap-1 text-white ltr:right-6 rtl:left-6">
                    <span className="text-2xl font-black leading-none">{String(active + 1).padStart(2, '0')}</span>
                    <span className="text-sm font-medium text-white/60">/ {String(total).padStart(2, '0')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Project details — staged reveal */}
            <div className="flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div key={current.id} variants={contentStagger} initial="hidden" animate="show">
                  <motion.h3 variants={layerReveal} className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                    {current.title}
                  </motion.h3>

                  {(current.location || current.year) && (
                    <motion.div
                      variants={layerReveal}
                      className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-brand-silver"
                    >
                      {current.location && (
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-gold" />
                          {current.location}
                        </span>
                      )}
                      {current.year && (
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-brand-gold" />
                          {current.year}
                        </span>
                      )}
                    </motion.div>
                  )}

                  {description && (
                    <motion.p variants={layerReveal} className="mt-4 line-clamp-3 leading-8 text-brand-silver">
                      {description}
                    </motion.p>
                  )}

                  <motion.div variants={layerReveal} className="mt-5 flex flex-wrap gap-3">
                    {chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-brand-gold/30 bg-brand-gold/5 px-4 py-2 text-sm font-semibold text-brand-text"
                      >
                        {chip}
                      </span>
                    ))}
                  </motion.div>

                  {/* Controls + pagination finish the sequence */}
                  {total > 1 && (
                    <motion.div
                      variants={layerReveal}
                      className="mt-7 flex items-center gap-6 border-t border-white/10 pt-7"
                    >
                      <button
                        type="button"
                        onClick={prev}
                        aria-label={t('السابق', 'הקודם', 'Previous')}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-brand-gold hover:bg-brand-gold hover:text-brand-navy"
                      >
                        {isLtr ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        aria-label={t('التالي', 'הבא', 'Next')}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-brand-gold hover:bg-brand-gold hover:text-brand-navy"
                      >
                        {isLtr ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                      </button>

                      <div className="flex items-center gap-2 ltr:ml-2 rtl:mr-2">
                        {showcase.map((project, index) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => goTo(index)}
                            aria-label={`${t('مشروع', 'פרויקט', 'Project')} ${index + 1}`}
                            aria-current={index === active}
                            className={cn(
                              'h-2 rounded-full transition-all',
                              index === active ? 'w-8 bg-brand-gold' : 'w-2 bg-white/25 hover:bg-white/50',
                            )}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

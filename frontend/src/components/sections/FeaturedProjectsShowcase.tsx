import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Building2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { Project } from '@/types';
import { useLanguage } from '@/i18n';
import { cn, handleImageError, normalizeImageUrl } from '@/lib/utils';

interface FeaturedProjectsShowcaseProps {
  projects: Project[];
}

const AUTOPLAY_MS = 5500;

// Responsive horizontal gap between the stacked images (adapted from the
// reference CircularTestimonials component).
function calculateGap(width: number) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 48;
  const maxGap = 72;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth) return maxGap;
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export function FeaturedProjectsShowcase({ projects }: FeaturedProjectsShowcaseProps) {
  const { t, dir } = useLanguage();

  // Prefer featured projects; fall back to all active projects from the API.
  const showcase = useMemo(() => {
    const featured = projects.filter((project) => project.featured);
    return featured.length > 0 ? featured : projects;
  }, [projects]);

  const total = showcase.length;
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);
  const imageStackRef = useRef<HTMLDivElement>(null);

  // Keep the active index valid when the dataset changes (e.g. language switch).
  useEffect(() => {
    setActive((current) => (total === 0 ? 0 : current % total));
  }, [total]);

  // Track the image stack width for the responsive gap calculation.
  useEffect(() => {
    const handleResize = () => {
      if (imageStackRef.current) setContainerWidth(imageStackRef.current.offsetWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
  const meta = current ? [current.location, current.year].filter(Boolean).join(' • ') : '';
  const description = current ? current.description || current.shortDescription || '' : '';

  // Layered 3D positions: active (front), one to each side, the rest hidden.
  function getImageStyle(index: number): CSSProperties {
    const gap = calculateGap(containerWidth);
    const lift = gap * 0.55;
    const isActive = index === active;
    const isLeft = (active - 1 + total) % total === index;
    const isRight = (active + 1) % total === index;
    const transition = 'all 0.8s cubic-bezier(.4,2,.3,1)';

    if (isActive) {
      return { zIndex: 3, opacity: 1, transform: 'translateX(0px) translateY(0px) scale(1) rotateY(0deg)', transition };
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 0.7,
        transform: `translateX(-${gap}px) translateY(-${lift}px) scale(0.85) rotateY(15deg)`,
        transition,
      };
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 0.7,
        transform: `translateX(${gap}px) translateY(-${lift}px) scale(0.85) rotateY(-15deg)`,
        transition,
      };
    }
    return { zIndex: 1, opacity: 0, transform: 'scale(0.8)', transition };
  }

  return (
    <section id="projects" dir={dir} className="relative isolate overflow-hidden bg-brand-navy py-24">
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
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.3em] text-brand-gold">
            <span className="h-px w-8 bg-brand-gold" /> T.A.S
          </span>
          <h2 className="text-3xl font-black leading-tight text-white md:text-4xl lg:text-5xl">{title}</h2>
          <p className="mt-5 text-lg leading-8 text-brand-silver">{subtitle}</p>
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
            className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Layered rotating image stack */}
            <div
              ref={imageStackRef}
              className="relative mx-auto h-72 w-full max-w-xl sm:h-80 md:h-[26rem]"
              style={{ perspective: '1000px' }}
            >
              {showcase.map((project, index) => (
                <img
                  key={project.id}
                  src={normalizeImageUrl(project.mainImage)}
                  onError={handleImageError}
                  alt={project.title}
                  draggable={false}
                  className="absolute inset-0 h-full w-full rounded-2xl border border-white/10 object-cover shadow-2xl shadow-black/40"
                  style={getImageStyle(index)}
                />
              ))}
              {/* gentle gold halo behind the stack */}
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-gold/10 blur-2xl" />
              {current.category && (
                <span className="absolute top-4 z-[4] bg-brand-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-navy ltr:left-4 rtl:right-4">
                  {current.category}
                </span>
              )}
            </div>

            {/* Project details with motion text reveal */}
            <div className="flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <h3 className="text-2xl font-bold text-white md:text-3xl">{current.title}</h3>

                  {meta && (
                    <div className="mt-3 inline-flex items-center gap-2 text-brand-silver">
                      <MapPin className="h-4 w-4 text-brand-gold" />
                      <span>{meta}</span>
                    </div>
                  )}

                  {description && (
                    <p className="mt-5 leading-8 text-brand-silver">
                      {description.split(' ').map((word, i) => (
                        <motion.span
                          key={`${current.id}-${i}`}
                          initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
                          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut', delay: 0.02 * i }}
                          className="inline-block"
                        >
                          {word}&nbsp;
                        </motion.span>
                      ))}
                    </p>
                  )}

                  <div className="mt-7 flex flex-wrap gap-3">
                    {chips.map((chip) => (
                      <span
                        key={chip}
                        className="border border-brand-gold/30 bg-brand-gold/5 px-4 py-2 text-sm font-semibold text-brand-text"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls + pagination */}
              {total > 1 && (
                <div className="mt-10 flex items-center gap-6">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label={t('السابق', 'הקודם', 'Previous')}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-brand-gold hover:bg-brand-gold hover:text-brand-navy"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label={t('التالي', 'הבא', 'Next')}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-brand-gold hover:bg-brand-gold hover:text-brand-navy"
                  >
                    <ChevronLeft className="h-5 w-5" />
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

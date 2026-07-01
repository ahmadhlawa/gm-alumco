import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Service } from '@/types';
import { useLanguage } from '@/i18n';
import { cn, handleImageError, normalizeImageUrl } from '@/lib/utils';

interface ServicesShowcaseProps {
  services: Service[];
  title: string;
  subtitle: string;
  emptyMessage: string;
  actionLabel: string;
}

export function getServiceSlideIndex(
  currentIndex: number,
  total: number,
  direction: -1 | 1,
): number {
  if (total <= 0) return 0;
  return (currentIndex + direction + total) % total;
}

export function ServicesShowcase({
  services,
  title,
  subtitle,
  emptyMessage,
  actionLabel,
}: ServicesShowcaseProps) {
  const { t, dir } = useLanguage();
  const isLtr = dir === 'ltr';
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeIndex >= services.length) setActiveIndex(0);
  }, [activeIndex, services.length]);

  useEffect(() => {
    if (isPaused || services.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => getServiceSlideIndex(current, services.length, 1));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isPaused, services.length]);

  const moveSlide = (direction: -1 | 1) => {
    setActiveIndex((current) => getServiceSlideIndex(current, services.length, direction));
  };

  return (
    <section
      id="services"
      dir={dir}
      aria-labelledby="services-title"
      className="scroll-mt-24 overflow-hidden bg-[#040e1f] text-white"
    >
      <div className="relative overflow-hidden border-y border-white/10 bg-brand-navy px-4 py-16 md:px-8 md:py-20">
        {/* Architectural facade backdrop — subtle, navy-washed for readability */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-services.webp"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.26]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-brand-navy/80 via-brand-navy/52 to-brand-navy/82"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(185,199,228,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(185,199,228,0.035)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className={cn('relative z-10 mx-auto max-w-7xl', isLtr ? 'text-left' : 'text-right')}>
          <span className="mb-5 block text-xs font-bold tracking-[0.3em] text-brand-gold">T.A.S</span>
          <h2 id="services-title" className="max-w-4xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
            {title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-silver">{subtitle}</p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="mx-auto flex min-h-80 max-w-7xl items-center justify-center px-4 text-center">
          <p className="border border-brand-gold/30 bg-brand-navy px-8 py-6 text-brand-silver">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div
          className="relative h-[600px] overflow-hidden md:h-[700px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          {services.map((service, index) => {
            const isActive = index === activeIndex;
            return (
              <article
                key={service.id}
                aria-hidden={!isActive}
                className={cn(
                  'absolute inset-0 transition-[opacity,visibility] duration-1000 ease-in-out',
                  isActive ? 'visible z-10 opacity-100' : 'invisible z-0 opacity-0',
                )}
              >
                <img
                  src={normalizeImageUrl(service.image)}
                  onError={handleImageError}
                  alt={service.title}
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-transform duration-[10000ms] ease-out',
                    isActive ? 'scale-110' : 'scale-100',
                  )}
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#081425] via-[#081425]/85 to-transparent md:bg-linear-to-l md:from-[#081425]/95 md:via-[#081425]/80 md:to-transparent" />
                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-5 pb-28 pt-20 md:items-center md:px-16 md:pb-20">
                  <div className={cn('max-w-2xl', isLtr ? 'text-left' : 'text-right')}>
                    <div className="mb-7 h-0.5 w-16 bg-brand-gold" />
                    <h3 className="text-4xl font-extrabold leading-tight text-brand-gold md:text-6xl">
                      {service.title}
                    </h3>
                    <p className="mt-6 text-base leading-8 text-gray-100 md:text-lg">
                      {service.shortDescription || service.description}
                    </p>
                    <Link
                      to="/contact"
                      className="mt-9 inline-flex items-center gap-3 text-sm font-bold tracking-wide text-brand-gold transition-colors hover:text-white"
                    >
                      <span>{actionLabel}</span>
                      <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1 ltr:-scale-x-100" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {services.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveSlide(-1)}
                aria-label={t('الخدمة السابقة', 'השירות הקודם', 'Previous service')}
                className="absolute left-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-brand-gold/40 text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-navy md:flex"
              >
                {isLtr ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
              </button>
              <button
                type="button"
                onClick={() => moveSlide(1)}
                aria-label={t('الخدمة التالية', 'השירות הבא', 'Next service')}
                className="absolute right-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-brand-gold/40 text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-navy md:flex"
              >
                {isLtr ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
              </button>
              <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3" aria-label={t('اختيار الخدمة', 'בחירת שירות', 'Choose service')}>
                {services.map((service, index) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`${t('عرض خدمة', 'הצג שירות', 'Show service')} ${service.title}`}
                    aria-current={index === activeIndex ? 'true' : undefined}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      index === activeIndex ? 'w-8 bg-brand-gold' : 'w-2 bg-white/35 hover:bg-white/60',
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

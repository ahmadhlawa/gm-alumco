import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Factory, Handshake } from 'lucide-react';
import type { ProductionProject } from '@/types';
import { cn, handleImageError, normalizeImageUrl } from '@/lib/utils';
import { useLanguage } from '@/i18n';

interface ProductionProjectCardProps {
  project: ProductionProject;
  index: number;
}

export function ProductionProjectCard({ project, index }: ProductionProjectCardProps) {
  const { t } = useLanguage();
  const [imageIndex, setImageIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const images = project.images.length > 0 ? project.images : [''];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!hasMultipleImages) return;
    const timeoutId = window.setTimeout(() => {
      setImageIndex((current) => (current + 1) % images.length);
    }, 4500);
    return () => window.clearTimeout(timeoutId);
  }, [hasMultipleImages, images.length, imageIndex, timerKey]);

  const selectImage = (dotIndex: number) => {
    setImageIndex(dotIndex);
    setTimerKey((current) => current + 1);
  };

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-brand-gold/25 bg-brand-navy/90 shadow-2xl shadow-black/35 backdrop-blur-sm',
        'bg-linear-to-br from-[#050914]/95 via-brand-navy/90 to-[#0b101c]/95',
        index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row',
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-surface lg:aspect-auto lg:min-h-[420px] lg:w-[58%]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={`${project.id}-${imageIndex}`}
            src={normalizeImageUrl(images[imageIndex])}
            onError={handleImageError}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading={index > 1 ? 'lazy' : undefined}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.01 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: 'easeOut' }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-linear-to-t from-brand-navy/55 via-transparent to-black/10" />
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-brand-gold/20 bg-black/45 px-3 py-2 backdrop-blur">
            {images.map((image, dotIndex) => (
              <button
                key={`${image}-${dotIndex}`}
                type="button"
                aria-label={t(`הצגת תמונה ${dotIndex + 1}`, `Show image ${dotIndex + 1}`)}
                aria-current={dotIndex === imageIndex ? 'true' : undefined}
                onClick={() => selectImage(dotIndex)}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition focus:outline-none focus:ring-2 focus:ring-brand-gold/70 focus:ring-offset-2 focus:ring-offset-black',
                  dotIndex === imageIndex ? 'bg-brand-gold shadow-[0_0_12px_rgba(212,175,55,0.55)]' : 'bg-white/35 hover:bg-white/70',
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex min-h-[360px] flex-1 flex-col justify-center gap-5 bg-linear-to-br from-white/[0.045] via-transparent to-black/20 p-6 md:p-8 lg:w-[42%]">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">
            {t('פרויקט ייצור', 'Production project')}
          </p>
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">{project.title}</h2>
            <div className="mt-4 h-px w-16 bg-brand-gold/80" />
          </div>
        </div>
        <p className="line-clamp-2 text-base leading-7 text-brand-silver md:text-lg">
          {project.shortDescription}
        </p>
        <dl className="grid gap-3 pt-2 text-sm md:grid-cols-2">
          <div className="rounded-lg border border-brand-gold/20 bg-black/20 p-4 shadow-inner shadow-white/[0.02]">
            <dt className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
              <Factory className="h-4 w-4" />
              {t('יצרן', 'Manufacturer')}
            </dt>
            <dd className="font-bold leading-6 text-white">{project.manufacturer || '-'}</dd>
          </div>
          <div className="rounded-lg border border-brand-gold/20 bg-black/20 p-4 shadow-inner shadow-white/[0.02]">
            <dt className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
              <Handshake className="h-4 w-4" />
              {t('שותף ביצוע', 'Execution partner')}
            </dt>
            <dd className="font-bold leading-6 text-white">{project.executionPartner || '-'}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

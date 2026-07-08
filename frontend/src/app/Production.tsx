import { useEffect, useState } from 'react';
import { PageHero } from '@/components/common/PageHero';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductionProjectCard } from '@/components/cards/ProductionProjectCard';
import { getProductionProjects } from '@/lib/api';
import type { ProductionProject as ProductionProjectView } from '@/types';
import { useLanguage } from '@/i18n';

export function Production() {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<ProductionProjectView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getProductionProjects(language)
      .then(setProjects)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [language]);

  return (
    <div data-page="production-projects" className="bg-brand-surface">
      <PageHero
        title={t('פרויקטי ייצור', 'Production projects')}
        subtitle={t(
          'פרויקטים תעשייתיים נבחרים המשלבים ייצור מדויק, חומרים איכותיים וביצוע מוקפד.',
          'Selected industrial projects combining precision fabrication, premium materials and controlled execution.',
        )}
        breadcrumbs={[{ label: t('פרויקטי ייצור', 'Production projects'), path: '/production' }]}
        image="/images/backgrounds/tas-bg-projects.webp"
      />

      <section className="relative isolate overflow-hidden py-16 md:py-24">
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-projects.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.18]"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-brand-surface via-brand-surface/90 to-brand-surface" />
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <LoadingState variant="production-cards" count={3} />
          ) : error ? (
            <ErrorState message={t('טעינת פרויקטי הייצור נכשלה. נסה שוב.', 'Could not load production projects. Please try again.')} />
          ) : projects.length === 0 ? (
            <EmptyState message={t('פרויקטי ייצור יתווספו בקרוב.', 'Production projects will be added soon.')} />
          ) : (
            <div className="space-y-8 md:space-y-12">
              {projects.map((project, index) => (
                <ProductionProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

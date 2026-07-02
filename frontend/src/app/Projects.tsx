import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { getProjects } from '@/lib/api';
import { useLanguage } from '@/i18n';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { PROJECT_FILTER_KEYS, projectFilterLabel, type ProjectFilterKey } from '@/lib/projectCategories';
import { Search } from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { Project } from '@/types';

export function Projects() {
  const { t, language } = useLanguage();
  // Store a stable filter key (not a translated label) so switching language
  // never invalidates the active filter and empties the grid.
  const [filter, setFilter] = useState<ProjectFilterKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getProjects(language)
      .then(data => setProjects(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [language]);

  // Build the chip list from the categories actually present in the data,
  // keeping a stable, deterministic order, and always lead with "ALL".
  const presentCategories = PROJECT_FILTER_KEYS.filter((key) =>
    projects.some((project) => project.category === key),
  );
  const filterKeys: ProjectFilterKey[] = ['ALL', ...presentCategories];

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'ALL' || project.category === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-brand-surface">
      <PageHero 
        title={t("גלריית פרויקטים", "Project gallery")} 
        subtitle={t("דוגמאות מהעבודות שלנו שנעשו בסטנדרטים הגבוהים ביותר.", "Examples of our work, executed to the highest standards of precision and professionalism.")}
        breadcrumbs={[{ label: t('הפרויקטים שלנו', "Our projects"), path: '/projects' }]}
        image="/images/backgrounds/tas-bg-projects.webp"
      />

      <section className="relative isolate overflow-hidden py-24">
        {/* Subtle architectural backdrop — surface-washed for text readability */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-projects.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.24]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-brand-surface/85 via-brand-surface/55 to-brand-surface/82"
        />
        <div className="container relative z-10 mx-auto px-4">
          <SectionHeader
            title={t("עבודות שאנו גאים בהן", "Work we're proud of")}
            centered
          />
          
          {/* Filters & Search */}
          <div className="max-w-4xl mx-auto mb-16 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-2 justify-center">
              {filterKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-bold transition-all",
                    filter === key
                      ? "bg-brand-navy text-white"
                      : "bg-white/10 text-brand-silver hover:bg-white/20"
                  )}
                >
                  {projectFilterLabel(key, language)}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:w-64 shrink-0">
              <input 
                type="text" 
                placeholder={t("חפש בפרויקטים...", "Search projects...")} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-4 rtl:pr-11 ltr:pl-11 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
              />
              <Search className="absolute top-1/2 rtl:right-4 ltr:left-4 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Project Grid */}
          <div className="min-h-[400px]">
            {loading ? (
              <LoadingState message={t('טוען פרויקטים...', 'Loading projects...')} />
            ) : error ? (
              <ErrorState message={t('טעינת הפרויקטים נכשלה. נסה שוב.', 'Could not load projects. Please try again.')} />
            ) : (
              <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ProjectCard project={project} index={0} />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full flex flex-col items-center justify-center text-brand-silver py-20"
                    >
                      <Search className="w-16 h-16 text-gray-200 mb-4 opacity-50" />
                      <p className="text-xl">{t('אין פרויקטים שתואמים לחיפוש', "No projects match your search")}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}

import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { getProjects } from '@/lib/api';
import { useLanguage } from '@/i18n';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { Project } from '@/types';

export function Projects() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState(t('الكل', 'הכל'));
  const [searchQuery, setSearchQuery] = useState('');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects().then(data => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const categories = [t('الكل', 'הכל'), ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === t('الكل', 'הכל') || project.category === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-brand-surface">
      <PageHero 
        title={t("معرض المشاريع", "גלריית פרויקטים")} 
        subtitle={t("نماذج من أعمالنا التي تم تنفيذها بأعلى معايير الدقة والاحترافية.", "דוגמאות מהעבודות שלנו שנעשו בסטנדרטים הגבוהים ביותר.")}
        breadcrumbs={[{ label: t('مشاريعنا', 'הפרויקטים שלנו'), path: '/projects' }]}
        image="https://images.unsplash.com/photo-1545615714-fb9bd747190d?auto=format&fit=crop&q=80"
      />

      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title={t("أعمال نفتخر بها", "עבודות שאנו גאים בהן")} 
            centered
          />
          
          {/* Filters & Search */}
          <div className="max-w-4xl mx-auto mb-16 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-bold transition-all",
                    filter === cat 
                      ? "bg-brand-navy text-white" 
                      : "bg-white/10 text-brand-silver hover:bg-white/20"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:w-64 shrink-0">
              <input 
                type="text" 
                placeholder={t("ابحث في المشاريع...", "חפש בפרויקטים...")} 
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
              <LoadingState />
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
                      <p className="text-xl">{t('لا توجد مشاريع مطابقة للبحث', 'אין פרויקטים שתואמים לחיפוש')}</p>
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

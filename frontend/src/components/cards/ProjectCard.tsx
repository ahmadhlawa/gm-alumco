import { Project } from '@/types';
import { motion } from 'motion/react';
import { useLanguage } from '@/i18n';
import { projectCategoryLabel } from '@/lib/projectCategories';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const { language } = useLanguage();

  // No public project details page exists, so the card is informational only:
  // it intentionally renders no "Details" link/CTA and does not navigate.
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden bg-brand-navy"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 bg-brand-navy/20 group-hover:bg-transparent transition-colors z-10" />
        <img
          src={normalizeImageUrl(project.mainImage)}
          onError={handleImageError}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 z-20 bg-brand-surface/90 backdrop-blur text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
          {projectCategoryLabel(project.category, language)}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-gold transition-colors line-clamp-1">
          {project.title}
        </h3>
        <p className="text-brand-silver text-sm">
          {project.location} • {project.year}
        </p>
      </div>
    </motion.div>
  );
}

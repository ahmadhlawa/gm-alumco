import { Link } from 'react-router-dom';
import { Project } from '@/types';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/i18n';

interface ProjectCardProps {
  project: Project;
  index?: number;
  disableLink?: boolean;
}

export function ProjectCard({ project, index = 0, disableLink }: ProjectCardProps) {
  const { t } = useLanguage();

  const content = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 bg-brand-navy/20 group-hover:bg-transparent transition-colors z-10" />
        <img 
          src={project.mainImage} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 z-20 bg-brand-surface/90 backdrop-blur text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
          {project.category}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-gold transition-colors line-clamp-1">
          {project.title}
        </h3>
        <p className="text-brand-silver text-sm mb-4">
          {project.location} • {project.year}
        </p>
        <div className="flex items-center text-white font-bold text-sm tracking-wide gap-2 group-hover:gap-3 transition-all">
          <span>{t('التفاصيل', 'פרטים')}</span>
          <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
        </div>
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden bg-brand-navy"
    >
      {disableLink ? content : (
        <Link to={`/projects/${project.slug}`} className="block h-full">
          {content}
        </Link>
      )}
    </motion.div>
  );
}

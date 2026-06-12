import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/i18n';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  breadcrumbs?: { label: string; path: string }[];
}

export function PageHero({ 
  title, 
  subtitle, 
  image = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80",
  breadcrumbs
}: PageHeroProps) {
  const { t } = useLanguage();

  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-brand-navy z-0">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 text-center mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
              {subtitle}
            </p>
          )}

          {breadcrumbs && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Link to="/" className="hover:text-white transition-colors">{t('الرئيسية', 'דף הבית')}</Link>
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4 rtl:-scale-x-100" />
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-brand-gold">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="hover:text-white transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

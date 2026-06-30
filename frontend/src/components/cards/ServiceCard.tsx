import { Service } from '@/types';
import { motion } from 'motion/react';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  index?: number;
}

export function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  // No public service details page exists, so the card is informational only:
  // it intentionally renders no "Read more" link/CTA and does not navigate.
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group bg-brand-surface border border-white/5 hover:border-brand-gold hover:shadow-2xl shadow-brand-border/50 transition-all duration-300 h-full flex flex-col justify-between"
    >
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-brand-navy/40 group-hover:bg-brand-navy/10 transition-colors z-10" />
        <img
          src={normalizeImageUrl(service.image)}
          onError={handleImageError}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-8">
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-gold transition-colors">
          {service.title}
        </h3>
        <p className="text-brand-silver line-clamp-2">
          {service.shortDescription}
        </p>
      </div>
    </motion.div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface ProductCardProps {
  product: Product;
  index?: number;
  disableLink?: boolean;
}

export function ProductCard({ product, index = 0, disableLink }: ProductCardProps) {
  const { t } = useLanguage();

  const content = (
    <>
      <div className="relative aspect-square overflow-hidden bg-white/5 mb-4">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="text-center">
        <span className="text-xs text-brand-gold font-bold uppercase tracking-wider mb-2 block">{product.category}</span>
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.title}</h3>
        <div className="flex items-center justify-center text-white font-bold text-sm tracking-wide gap-2 group-hover:gap-3 transition-all mt-4">
           <span>{t('المواصفات', 'מפרט')}</span>
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
      className="group bg-brand-surface p-4 border border-white/5 hover:shadow-xl shadow-brand-border/50 transition-all h-full flex flex-col justify-between"
    >
      {disableLink ? content : (
        <Link to={`/products/${product.slug}`} className="block h-full">
          {content}
        </Link>
      )}
    </motion.div>
  );
}

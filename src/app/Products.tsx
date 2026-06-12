import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { ProductCard } from '@/components/cards/ProductCard';
import { getProducts } from '@/lib/api';
import { useLanguage } from '@/i18n';
import { useState, useEffect } from 'react';
import { LoadingState } from '@/components/common/LoadingState';
import { Product } from '@/types';

export function Products() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-brand-navy">
      <PageHero 
        title={t("كتالوج المنتجات", "קטלוג מוצרים")}
        subtitle={t("تصفح أحدث قطاعات الألمنيوم والأنظمة المتوفرة بمواصفات عالمية.", "עיין בפרופילים העדכניים של אלומיניום ומערכות.")}
        breadcrumbs={[{ label: t('المنتجات', 'המוצרים'), path: '/products' }]}
        image="https://images.unsplash.com/photo-1621508216172-8820c78a04cd?auto=format&fit=crop&q=80"
      />

      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title={t("منتجاتنا الرئيسية", "המוצרים שלנו")} 
            centered
          />
          <div className="min-h-[400px]">
             {loading ? (
                <LoadingState />
             ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} index={idx} />
                  ))}
                </div>
             )}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}

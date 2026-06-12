import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import type { CmsLocale, LocalizedFields, Product } from '@/types';
import { localize, translated } from '@/lib/cms';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { EditableBlock } from '@/components/admin/EditableBlock';
import { VisualCmsToolbar } from '@/components/admin/VisualCmsToolbar';
import { ProductCard } from '@/components/cards/ProductCard';

type CmsProduct = LocalizedFields<Product, 'title' | 'category' | 'description'>;

const fields = [
  { key: 'title', label: 'اسم المنتج', localized: true },
  { key: 'category', label: 'فئة المنتج', localized: true },
  { key: 'description', label: 'وصف المنتج', type: 'textarea' as const, localized: true },
  { key: 'image', label: 'رابط صورة المنتج', type: 'url' as const }
];

export function AdminProducts() {
  const [locale, setLocale] = useState<CmsLocale>('ar');
  const [products, setProducts] = useState<CmsProduct[]>([]);

  useEffect(() => {
    getProducts().then((items) => setProducts(items.map((item) => ({
      ...item,
      title: localize(item.title),
      category: localize(item.category),
      description: localize(item.description)
    }))));
  }, []);

  const update = (id: string, value: CmsProduct) => {
    setProducts((items) => items.map((item) => item.id === id ? value : item));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إدارة المنتجات بصرياً" description="معاينة مطابقة لبطاقات كتالوج المنتجات في الموقع." />
      <VisualCmsToolbar locale={locale} onLocaleChange={setLocale} />
      <AdminVisualGrid>
        {products.map((product, index) => {
          const preview: Product = {
            ...product,
            title: translated(product.title, locale),
            category: translated(product.category, locale),
            description: translated(product.description, locale)
          };
          return (
            <EditableBlock key={product.id} title="تعديل المنتج" type="fields" value={product} fields={fields} onSave={(value) => update(product.id, value)}>
              <ProductCard product={preview} index={index} disableLink />
            </EditableBlock>
          );
        })}
      </AdminVisualGrid>
    </div>
  );
}

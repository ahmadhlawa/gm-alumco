import { useEffect, useState } from 'react';
import { getGalleryImages } from '@/lib/api';
import type { CmsLocale, GalleryImage, LocalizedFields } from '@/types';
import { localize, translated } from '@/lib/cms';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { EditableBlock } from '@/components/admin/EditableBlock';
import { VisualCmsToolbar } from '@/components/admin/VisualCmsToolbar';

type CmsGalleryImage = LocalizedFields<GalleryImage, 'alt' | 'category'>;

const fields = [
  { key: 'alt', label: 'عنوان الصورة والنص البديل', localized: true },
  { key: 'category', label: 'فئة الصورة', localized: true },
  { key: 'url', label: 'رابط الصورة', type: 'url' as const }
];

export function AdminGallery() {
  const [locale, setLocale] = useState<CmsLocale>('ar');
  const [images, setImages] = useState<CmsGalleryImage[]>([]);

  useEffect(() => {
    getGalleryImages().then((items) => setImages(items.map((item) => ({
      ...item,
      alt: localize(item.alt),
      category: localize(item.category)
    }))));
  }, []);

  const update = (id: string, value: CmsGalleryImage) => {
    setImages((items) => items.map((item) => item.id === id ? value : item));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إدارة المعرض بصرياً" description="صور المعرض تظهر بنفس القص والطبقات المستخدمة في الواجهة." />
      <VisualCmsToolbar locale={locale} onLocaleChange={setLocale} />
      <AdminVisualGrid>
        {images.map((image) => (
          <EditableBlock key={image.id} title="تعديل صورة المعرض" type="fields" value={image} fields={fields} onSave={(value) => update(image.id, value)}>
            <div className="group relative aspect-square overflow-hidden bg-brand-surface">
              <img src={image.url} alt={translated(image.alt, locale)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-bold text-white">{translated(image.alt, locale)}</h3>
                <p className="mt-1 text-xs text-brand-silver">{translated(image.category, locale)}</p>
              </div>
            </div>
          </EditableBlock>
        ))}
      </AdminVisualGrid>
    </div>
  );
}

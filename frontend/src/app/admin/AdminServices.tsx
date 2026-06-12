import { useEffect, useState } from 'react';
import { getServices } from '@/lib/api';
import type { CmsLocale, LocalizedFields, Service } from '@/types';
import { localize, translated } from '@/lib/cms';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { EditableBlock } from '@/components/admin/EditableBlock';
import { VisualCmsToolbar } from '@/components/admin/VisualCmsToolbar';
import { ServiceCard } from '@/components/cards/ServiceCard';

type CmsService = LocalizedFields<Service, 'title' | 'shortDescription' | 'description'>;

const fields = [
  { key: 'title', label: 'عنوان الخدمة', localized: true },
  { key: 'shortDescription', label: 'الوصف المختصر', type: 'textarea' as const, localized: true },
  { key: 'description', label: 'الوصف الكامل', type: 'textarea' as const, localized: true },
  { key: 'image', label: 'رابط صورة الخدمة', type: 'url' as const }
];

export function AdminServices() {
  const [locale, setLocale] = useState<CmsLocale>('ar');
  const [services, setServices] = useState<CmsService[]>([]);

  useEffect(() => {
    getServices().then((items) => setServices(items.map((item) => ({
      ...item,
      title: localize(item.title),
      shortDescription: localize(item.shortDescription),
      description: localize(item.description)
    }))));
  }, []);

  const update = (id: string, value: CmsService) => {
    setServices((items) => items.map((item) => item.id === id ? value : item));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إدارة الخدمات بصرياً" description="البطاقات أدناه تستخدم نفس مكون الخدمة في الموقع العام." />
      <VisualCmsToolbar locale={locale} onLocaleChange={setLocale} />
      <AdminVisualGrid>
        {services.map((service, index) => {
          const preview: Service = {
            ...service,
            title: translated(service.title, locale),
            shortDescription: translated(service.shortDescription, locale),
            description: translated(service.description, locale)
          };
          return (
            <EditableBlock key={service.id} title="تعديل الخدمة" type="fields" value={service} fields={fields} onSave={(value) => update(service.id, value)}>
              <ServiceCard service={preview} index={index} disableLink />
            </EditableBlock>
          );
        })}
      </AdminVisualGrid>
    </div>
  );
}

import { useState } from 'react';
import { partners as initialPartners } from '@/data/partners';
import type { CmsLocale, LocalizedFields, Partner } from '@/types';
import { localize, translated } from '@/lib/cms';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { EditableBlock } from '@/components/admin/EditableBlock';
import { VisualCmsToolbar } from '@/components/admin/VisualCmsToolbar';

type CmsPartner = LocalizedFields<Partner, 'name'>;

const fields = [
  { key: 'name', label: 'اسم الشريك', localized: true },
  { key: 'logo', label: 'رابط الشعار', type: 'url' as const }
];

export function AdminPartners() {
  const [locale, setLocale] = useState<CmsLocale>('ar');
  const [partners, setPartners] = useState<CmsPartner[]>(() => initialPartners.map((item) => ({ ...item, name: localize(item.name) })));

  const update = (id: string, value: CmsPartner) => {
    setPartners((items) => items.map((item) => item.id === id ? value : item));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إدارة شركاء النجاح بصرياً" description="معاينة الشعارات والأسماء ضمن شبكة شركاء الموقع." />
      <VisualCmsToolbar locale={locale} onLocaleChange={setLocale} />
      <AdminVisualGrid>
        {partners.map((partner) => (
          <EditableBlock key={partner.id} title="تعديل الشريك" type="fields" value={partner} fields={fields} onSave={(value) => update(partner.id, value)}>
            <div className="flex min-h-64 flex-col items-center justify-center border border-white/5 bg-brand-surface p-8 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-brand-navy shadow-inner">
                {partner.logo ? <img src={partner.logo} alt={translated(partner.name, locale)} className="max-h-full max-w-full object-contain p-2" /> : <span className="text-2xl font-bold text-brand-silver">{translated(partner.name, locale).slice(0, 2)}</span>}
              </div>
              <h3 className="font-bold text-white">{translated(partner.name, locale)}</h3>
            </div>
          </EditableBlock>
        ))}
      </AdminVisualGrid>
    </div>
  );
}

import { useState } from 'react';
import type { CmsLocale } from '@/types';
import { initialSiteContent } from '@/data/siteContent';
import { Footer, type FooterCmsContent } from '@/components/layout/Footer';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { EditableBlock } from '@/components/admin/EditableBlock';
import { VisualCmsToolbar } from '@/components/admin/VisualCmsToolbar';

const fields = [
  { key: 'logoText', label: 'اسم الشركة', localized: true },
  { key: 'description', label: 'وصف الشركة', type: 'textarea' as const, localized: true },
  { key: 'address', label: 'العنوان', type: 'textarea' as const, localized: true },
  { key: 'phone', label: 'رقم الهاتف' },
  { key: 'email', label: 'البريد الإلكتروني', type: 'text' as const },
  { key: 'copyright', label: 'نص حقوق النشر', localized: true }
];

const initialFooter: FooterCmsContent = {
  logoText: initialSiteContent.hero.logoText,
  description: initialSiteContent.footer.description,
  address: initialSiteContent.contact.address,
  phone: initialSiteContent.contact.phone,
  email: initialSiteContent.contact.email,
  copyright: initialSiteContent.footer.copyright
};

export function AdminFooter() {
  const [locale, setLocale] = useState<CmsLocale>('he');
  const [content, setContent] = useState<FooterCmsContent>(initialFooter);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="تحرير تذييل الموقع" description="المعاينة تستخدم مكون Footer العام نفسه دون حفظ دائم." />
      <VisualCmsToolbar locale={locale} onLocaleChange={setLocale} />
      <EditableBlock title="تعديل بيانات التذييل" type="fields" value={content} fields={fields} onSave={setContent}>
        <div className="overflow-hidden rounded-xl border border-white/5">
          <Footer cmsContent={content} previewLocale={locale} />
        </div>
      </EditableBlock>
    </div>
  );
}

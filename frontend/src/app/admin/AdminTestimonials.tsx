import { useState } from 'react';
import { testimonials as initialTestimonials } from '@/data/testimonials';
import type { CmsLocale, LocalizedFields, Testimonial } from '@/types';
import { localize, translated } from '@/lib/cms';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { EditableBlock } from '@/components/admin/EditableBlock';
import { VisualCmsToolbar } from '@/components/admin/VisualCmsToolbar';
import { TestimonialCard } from '@/components/cards/TestimonialCard';

type CmsTestimonial = LocalizedFields<Testimonial, 'name' | 'role' | 'company' | 'content'>;

const fields = [
  { key: 'name', label: 'اسم العميل', localized: true },
  { key: 'role', label: 'الصفة الوظيفية', localized: true },
  { key: 'company', label: 'الشركة', localized: true },
  { key: 'content', label: 'نص التوصية', type: 'textarea' as const, localized: true },
  { key: 'rating', label: 'التقييم من 5', type: 'number' as const }
];

export function AdminTestimonials() {
  const [locale, setLocale] = useState<CmsLocale>('he');
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>(() => initialTestimonials.map((item) => ({
    ...item,
    name: localize(item.name),
    role: localize(item.role),
    company: localize(item.company ?? ''),
    content: localize(item.content)
  })));

  const update = (id: string, value: CmsTestimonial) => {
    setTestimonials((items) => items.map((item) => item.id === id ? value : item));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إدارة آراء العملاء بصرياً" description="تستخدم المعاينة بطاقة التوصية نفسها الموجودة في الصفحة الرئيسية." />
      <VisualCmsToolbar locale={locale} onLocaleChange={setLocale} />
      <AdminVisualGrid>
        {testimonials.map((testimonial, index) => {
          const preview: Testimonial = {
            ...testimonial,
            name: translated(testimonial.name, locale),
            role: translated(testimonial.role, locale),
            company: translated(testimonial.company, locale),
            content: translated(testimonial.content, locale)
          };
          return (
            <EditableBlock key={testimonial.id} title="تعديل رأي العميل" type="fields" value={testimonial} fields={fields} onSave={(value) => update(testimonial.id, value)}>
              <TestimonialCard testimonial={preview} index={index} />
            </EditableBlock>
          );
        })}
      </AdminVisualGrid>
    </div>
  );
}

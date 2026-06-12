import { useEffect, useState } from 'react';
import { getProjects } from '@/lib/api';
import type { CmsLocale, LocalizedFields, Project } from '@/types';
import { localize, translated } from '@/lib/cms';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { EditableBlock } from '@/components/admin/EditableBlock';
import { VisualCmsToolbar } from '@/components/admin/VisualCmsToolbar';
import { ProjectCard } from '@/components/cards/ProjectCard';

type CmsProject = LocalizedFields<Project, 'title' | 'category' | 'location' | 'shortDescription'>;

const fields = [
  { key: 'title', label: 'اسم المشروع', localized: true },
  { key: 'category', label: 'تصنيف المشروع', localized: true },
  { key: 'location', label: 'موقع المشروع', localized: true },
  { key: 'year', label: 'سنة التنفيذ' },
  { key: 'shortDescription', label: 'الوصف المختصر', type: 'textarea' as const, localized: true },
  { key: 'mainImage', label: 'رابط الصورة الرئيسية', type: 'url' as const }
];

export function AdminProjects() {
  const [locale, setLocale] = useState<CmsLocale>('ar');
  const [projects, setProjects] = useState<CmsProject[]>([]);

  useEffect(() => {
    getProjects().then((items) => setProjects(items.map((item) => ({
      ...item,
      title: localize(item.title),
      category: localize(item.category),
      location: localize(item.location),
      shortDescription: localize(item.shortDescription ?? '')
    }))));
  }, []);

  const update = (id: string, value: CmsProject) => {
    setProjects((items) => items.map((item) => item.id === id ? value : item));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إدارة المشاريع بصرياً" description="تم استبدال الجدول بمعاينة بطاقات المشاريع الفعلية." />
      <VisualCmsToolbar locale={locale} onLocaleChange={setLocale} />
      <AdminVisualGrid>
        {projects.map((project, index) => {
          const preview: Project = {
            ...project,
            title: translated(project.title, locale),
            category: translated(project.category, locale),
            location: translated(project.location, locale),
            shortDescription: translated(project.shortDescription, locale)
          };
          return (
            <EditableBlock key={project.id} title="تعديل المشروع" type="fields" value={project} fields={fields} onSave={(value) => update(project.id, value)}>
              <ProjectCard project={preview} index={index} disableLink />
            </EditableBlock>
          );
        })}
      </AdminVisualGrid>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { deleteProject, listAdminProjects } from '@/api/projects';
import { ApiError } from '@/api/client';
import type { ProjectDto } from '@/api/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { PROJECT_CATEGORY_LABELS, localizeLabel, pickAdminText } from './adminMappers';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';
import { useLanguage } from '@/i18n';

// Admin projects copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    title: 'ניהול פרויקטים',
    description: 'הוספה, עריכה ומחיקה של פרויקטים של T.A.S בעברית ובאנגלית.',
    add: 'פרויקט חדש',
    loading: 'טוען פרויקטים…',
    empty: 'אין עדיין פרויקטים. התחילו בהוספת פרויקט חדש.',
    confirmDelete: (name: string) => `מחיקת הפרויקט "${name}" היא קבועה ואי אפשר לבטל אותה. להמשיך?`,
    deleteFailed: 'מחיקת הפרויקט נכשלה.',
    published: 'מוצג',
    hidden: 'מוסתר',
    order: 'סדר',
    untitled: 'ללא שם',
  },
  en: {
    title: 'Manage projects',
    description: 'Add, edit and delete T.A.S projects in Hebrew and English.',
    add: 'New project',
    loading: 'Loading projects…',
    empty: 'No projects yet. Start by adding a new project.',
    confirmDelete: (name: string) => `Permanently delete the project "${name}"? This cannot be undone.`,
    deleteFailed: 'Could not delete the project.',
    published: 'Published',
    hidden: 'Hidden',
    order: 'Order',
    untitled: 'Untitled',
  },
};

export function AdminProjects() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    listAdminProjects()
      .then(setProjects)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (project: ProjectDto) => {
    const name = pickAdminText(language, project.title_he, project.title_en) || copy.untitled;
    if (!window.confirm(copy.confirmDelete(name))) return;
    setActionError(null);
    try {
      await deleteProject(project.id);
      setProjects((current) => current.filter((currentProject) => currentProject.id !== project.id));
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : copy.deleteFailed);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={copy.title}
        description={copy.description}
        action={
          <Link
            to="/admin/projects/new"
            className="flex items-center gap-2 rounded bg-brand-gold px-5 py-2.5 font-bold text-white hover:bg-[#b8962e]"
          >
            <Plus className="h-5 w-5" />
            {copy.add}
          </Link>
        }
      />

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded text-sm">{actionError}</div>
      )}

      {loading ? (
        <LoadingState variant="admin-grid" />
      ) : error ? (
        <ErrorState />
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-brand-navy py-20 text-center text-brand-silver">
          {copy.empty}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const title = pickAdminText(language, project.title_he, project.title_en) || copy.untitled;
            const description = pickAdminText(language, project.description_he, project.description_en);
            return (
              <div key={project.id} className="overflow-hidden rounded-xl border border-white/5 bg-brand-navy">
                <div className="relative h-40 bg-brand-surface">
                  <img src={normalizeImageUrl(project.main_image_url)} onError={handleImageError} alt={title} className="h-full w-full object-cover" />
                  <span className="absolute top-3 right-3 rounded bg-brand-navy/90 px-2 py-1 text-xs font-bold text-brand-gold">
                    {localizeLabel(PROJECT_CATEGORY_LABELS[project.category], language)}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white line-clamp-1">{title}</h3>
                    <AdminStatusBadge status={project.is_active} activeLabel={copy.published} inactiveLabel={copy.hidden} />
                  </div>
                  <p className="text-sm text-brand-silver line-clamp-2 min-h-[2.5rem]">
                    {description || '—'}
                  </p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-xs text-brand-silver">{copy.order}: {project.sort_order}</span>
                    <AdminActionButtons
                      onEdit={() => navigate(`/admin/projects/${project.id}/edit`)}
                      onDelete={() => handleDelete(project)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

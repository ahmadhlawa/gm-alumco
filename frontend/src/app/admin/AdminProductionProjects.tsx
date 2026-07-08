import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ApiError } from '@/api/client';
import { deleteProductionProject, listAdminProductionProjects } from '@/api/productionProjects';
import type { ProductionProjectDto } from '@/api/types';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';
import { useLanguage } from '@/i18n';
import { pickAdminText } from './adminMappers';

const COPY = {
  he: {
    title: 'פרויקטי ייצור',
    description: 'ניהול פרויקטי ייצור עצמאיים לעמוד הייצור.',
    add: 'פרויקט ייצור חדש',
    loading: 'טוען פרויקטי ייצור...',
    empty: 'אין עדיין פרויקטי ייצור.',
    confirmDelete: (name: string) => `למחוק את פרויקט הייצור "${name}"?`,
    deleteFailed: 'מחיקת פרויקט הייצור נכשלה.',
    active: 'פעיל',
    hidden: 'מוסתר',
    images: 'תמונות',
    order: 'סדר',
    untitled: 'ללא שם',
  },
  en: {
    title: 'Production Projects',
    description: 'Manage standalone production projects for the production page.',
    add: 'New production project',
    loading: 'Loading production projects...',
    empty: 'No production projects yet.',
    confirmDelete: (name: string) => `Delete the production project "${name}"?`,
    deleteFailed: 'Could not delete the production project.',
    active: 'Active',
    hidden: 'Hidden',
    images: 'Images',
    order: 'Order',
    untitled: 'Untitled',
  },
};

export function AdminProductionProjects() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [projects, setProjects] = useState<ProductionProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    listAdminProductionProjects()
      .then(setProjects)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (project: ProductionProjectDto) => {
    const name = pickAdminText(language, project.title_he, project.title_en) || copy.untitled;
    if (!window.confirm(copy.confirmDelete(name))) return;
    setActionError(null);
    try {
      await deleteProductionProject(project.id);
      load();
    } catch (deleteError) {
      setActionError(deleteError instanceof ApiError ? deleteError.message : copy.deleteFailed);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={copy.title}
        description={copy.description}
        action={
          <Link
            to="/admin/production-projects/new"
            className="flex items-center gap-2 rounded bg-brand-gold px-5 py-2.5 font-bold text-white hover:bg-[#b8962e]"
          >
            <Plus className="h-5 w-5" />
            {copy.add}
          </Link>
        }
      />

      {actionError && (
        <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{actionError}</div>
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
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const title = pickAdminText(language, project.title_he, project.title_en) || copy.untitled;
            const description = pickAdminText(language, project.description_he, project.description_en);
            const firstImage = project.images[0]?.image_url;
            return (
              <div key={project.id} className="overflow-hidden rounded-xl border border-white/5 bg-brand-navy">
                <div className="relative h-44 bg-brand-surface">
                  <img
                    src={normalizeImageUrl(firstImage)}
                    onError={handleImageError}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 right-3 rounded bg-brand-navy/90 px-2 py-1 text-xs font-bold text-brand-gold">
                    {copy.images}: {project.images.length}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-bold text-white">{title}</h3>
                    <AdminStatusBadge status={project.is_active} activeLabel={copy.active} inactiveLabel={copy.hidden} />
                  </div>
                  <p className="min-h-[2.5rem] text-sm text-brand-silver line-clamp-2">{description || '-'}</p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-xs text-brand-silver">{copy.order}: {project.sort_order}</span>
                    <AdminActionButtons
                      onEdit={() => navigate(`/admin/production-projects/${project.id}/edit`)}
                      onDelete={() => void remove(project)}
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

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
import { PROJECT_CATEGORY_LABELS } from './adminMappers';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';

export function AdminProjects() {
  const navigate = useNavigate();
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
    if (!window.confirm(`هل تريد حذف المشروع "${project.title_ar}"؟`)) return;
    setActionError(null);
    try {
      await deleteProject(project.id);
      load();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'تعذر حذف المشروع.');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="إدارة المشاريع"
        description="إضافة وتعديل وحذف مشاريع GM Alomco بثلاث لغات."
        action={
          <Link
            to="/admin/projects/new"
            className="flex items-center gap-2 rounded bg-brand-gold px-5 py-2.5 font-bold text-white hover:bg-[#b8962e]"
          >
            <Plus className="h-5 w-5" />
            مشروع جديد
          </Link>
        }
      />

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded text-sm">{actionError}</div>
      )}

      {loading ? (
        <LoadingState message="جاري تحميل المشاريع..." />
      ) : error ? (
        <ErrorState />
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-brand-navy py-20 text-center text-brand-silver">
          لا توجد مشاريع بعد. ابدأ بإضافة مشروع جديد.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="overflow-hidden rounded-xl border border-white/5 bg-brand-navy">
              <div className="relative h-40 bg-brand-surface">
                <img src={normalizeImageUrl(project.main_image_url)} onError={handleImageError} alt={project.title_ar} className="h-full w-full object-cover" />
                <span className="absolute top-3 right-3 rounded bg-brand-navy/90 px-2 py-1 text-xs font-bold text-brand-gold">
                  {PROJECT_CATEGORY_LABELS[project.category]}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white line-clamp-1">{project.title_ar}</h3>
                  <AdminStatusBadge status={project.is_active} activeLabel="منشور" inactiveLabel="مخفي" />
                </div>
                <p className="text-sm text-brand-silver line-clamp-2 min-h-[2.5rem]">
                  {project.description_ar ?? '—'}
                </p>
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-xs text-brand-silver">ترتيب: {project.sort_order}</span>
                  <AdminActionButtons
                    onEdit={() => navigate(`/admin/projects/${project.id}/edit`)}
                    onDelete={() => handleDelete(project)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

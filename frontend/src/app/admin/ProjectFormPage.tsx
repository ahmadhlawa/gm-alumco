import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { ApiError } from '@/api/client';
import {
  addProjectImage,
  createProject,
  deleteProjectImage,
  getAdminProject,
  updateProject,
} from '@/api/projects';
import type { ProjectDetailDto, ProjectDto, ProjectImageDto } from '@/api/types';
import { EMPTY_PROJECT, ProjectForm, type ProjectFormValues } from '@/components/forms/ProjectForm';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

function toValues(dto: ProjectDetailDto): ProjectFormValues {
  return {
    title_ar: dto.title_ar,
    title_en: dto.title_en,
    title_he: dto.title_he,
    description_ar: dto.description_ar ?? '',
    description_en: dto.description_en ?? '',
    description_he: dto.description_he ?? '',
    category: dto.category,
    main_image_url: dto.main_image_url ?? '',
    is_active: dto.is_active,
    sort_order: dto.sort_order,
  };
}

function toPayload(values: ProjectFormValues): Partial<ProjectDto> {
  return {
    title_ar: values.title_ar.trim(),
    title_en: values.title_en.trim(),
    title_he: values.title_he.trim(),
    description_ar: values.description_ar.trim() || null,
    description_en: values.description_en.trim() || null,
    description_he: values.description_he.trim() || null,
    category: values.category,
    main_image_url: values.main_image_url.trim() || null,
    is_active: values.is_active,
    sort_order: values.sort_order,
  };
}

function ProjectImagesManager({ projectId, initialImages }: { projectId: number; initialImages: ProjectImageDto[] }) {
  const [images, setImages] = useState<ProjectImageDto[]>(initialImages);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const image = await addProjectImage(projectId, { image_url: url.trim() });
      setImages((prev) => [...prev, image]);
      setUrl('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر إضافة الصورة.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (imageId: number) => {
    setError(null);
    try {
      await deleteProjectImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر حذف الصورة.');
    }
  };

  return (
    <div className="mt-10 max-w-4xl border-t border-white/10 pt-8">
      <h3 className="text-lg font-bold text-white mb-4">معرض صور المشروع</h3>
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded text-sm">{error}</div>
      )}
      <div className="flex gap-3 mb-6">
        <input
          type="url"
          dir="ltr"
          placeholder="https://drive.google.com/image.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 h-12 px-4 bg-brand-navy border border-white/10 rounded text-white text-left focus:outline-none focus:border-brand-gold"
        />
        <button
          type="button"
          onClick={add}
          disabled={busy}
          className="px-6 bg-brand-gold text-white font-bold rounded hover:bg-[#b8962e] disabled:opacity-60"
        >
          إضافة
        </button>
      </div>
      {images.length === 0 ? (
        <p className="text-brand-silver text-sm">لا توجد صور بعد.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded overflow-hidden border border-white/10">
              <img src={img.image_url} alt={img.alt_text_ar ?? ''} className="h-32 w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(img.id)}
                className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [detail, setDetail] = useState<ProjectDetailDto | undefined>();
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    setLoading(true);
    setLoadError(false);
    getAdminProject(id)
      .then(setDetail)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (values: ProjectFormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = toPayload(values);
      if (isEdit && id) {
        await updateProject(id, payload);
        navigate('/admin/projects');
      } else {
        const created = await createProject(payload);
        // Go to edit so the admin can immediately add gallery images.
        navigate(`/admin/projects/${created.id}/edit`, { replace: true });
      }
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'تعذر حفظ المشروع.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (loadError) return <ErrorState />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">{isEdit ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</h2>
      <ProjectForm
        initialValues={detail ? toValues(detail) : EMPTY_PROJECT}
        submitting={submitting}
        error={submitError}
        onSubmit={handleSubmit}
      />
      {isEdit && detail && <ProjectImagesManager projectId={detail.id} initialImages={detail.images} />}
    </div>
  );
}

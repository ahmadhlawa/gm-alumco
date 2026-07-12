import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { ApiError } from '@/api/client';
import {
  addProductionProjectImage,
  createProductionProject,
  deleteProductionProjectImage,
  getAdminProductionProject,
  updateProductionProject,
} from '@/api/productionProjects';
import type { ProductionProjectImageInput } from '@/api/productionProjects';
import type { ProductionProjectDto, ProductionProjectImageDto } from '@/api/types';
import {
  EMPTY_PRODUCTION_PROJECT,
  ProductionProjectForm,
  type ProductionProjectFormValues,
} from '@/components/forms/ProductionProjectForm';
import { ImageUploadField } from '@/components/forms/ImageUploadField';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';
import { useLanguage } from '@/i18n';

const COPY = {
  he: {
    editTitle: 'עריכת פרויקט ייצור',
    addTitle: 'הוספת פרויקט ייצור',
    gallery: 'תמונות הפרויקט',
    upload: 'העלאת תמונה לפרויקט',
    manual: 'אפשרות מתקדמת: הוספת קישור תמונה ידני',
    add: 'הוספה',
    noImages: 'אין עדיין תמונות.',
    deleteTooltip: 'מחיקה',
    addImageFailed: 'הוספת התמונה נכשלה.',
    deleteImageFailed: 'מחיקת התמונה נכשלה.',
    saveFailed: 'שמירת פרויקט הייצור נכשלה.',
  },
  en: {
    editTitle: 'Edit production project',
    addTitle: 'Add production project',
    gallery: 'Project images',
    upload: 'Upload project image',
    manual: 'Advanced option: add a manual image link',
    add: 'Add',
    noImages: 'No images yet.',
    deleteTooltip: 'Delete',
    addImageFailed: 'Could not add the image.',
    deleteImageFailed: 'Could not delete the image.',
    saveFailed: 'Could not save the production project.',
  },
};

function toValues(dto: ProductionProjectDto): ProductionProjectFormValues {
  return {
    title_en: dto.title_en,
    title_he: dto.title_he,
    description_en: dto.description_en ?? '',
    description_he: dto.description_he ?? '',
    manufacturer_en: dto.manufacturer_en ?? '',
    manufacturer_he: dto.manufacturer_he ?? '',
    execution_partner_en: dto.execution_partner_en ?? '',
    execution_partner_he: dto.execution_partner_he ?? '',
    is_active: dto.is_active,
    sort_order: dto.sort_order,
  };
}

export function productionProjectPayload(
  values: ProductionProjectFormValues,
  images?: ProductionProjectImageInput[],
) {
  return {
    title_en: values.title_en.trim(),
    title_he: values.title_he.trim(),
    description_en: values.description_en.trim() || null,
    description_he: values.description_he.trim() || null,
    manufacturer_en: values.manufacturer_en.trim() || null,
    manufacturer_he: values.manufacturer_he.trim() || null,
    execution_partner_en: values.execution_partner_en.trim() || null,
    execution_partner_he: values.execution_partner_he.trim() || null,
    is_active: values.is_active,
    sort_order: values.sort_order,
    ...(images ? { images } : {}),
  };
}

function ImagesManager({ projectId, initialImages }: { projectId: number; initialImages: ProductionProjectImageDto[] }) {
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [images, setImages] = useState<ProductionProjectImageDto[]>(initialImages);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeImage = async (imageUrl: string) => {
    const image = await addProductionProjectImage(projectId, {
      image_url: imageUrl,
      sort_order: images.length,
    });
    setImages((current) => [...current, image].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id));
    setUrl('');
  };

  const add = async () => {
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await storeImage(url.trim());
    } catch (addError) {
      setError(addError instanceof ApiError ? addError.message : copy.addImageFailed);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (imageId: number) => {
    setError(null);
    try {
      await deleteProductionProjectImage(imageId);
      setImages((current) => current.filter((image) => image.id !== imageId));
    } catch (deleteError) {
      setError(deleteError instanceof ApiError ? deleteError.message : copy.deleteImageFailed);
    }
  };

  return (
    <div className="mt-10 max-w-4xl border-t border-white/10 pt-8">
      <h3 className="mb-4 text-lg font-bold text-white">{copy.gallery}</h3>
      {error && <div className="mb-4 rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      <div className="mb-6 space-y-3">
        <ImageUploadField label={copy.upload} folder="production-projects" onUploaded={storeImage} />
        <details className="rounded border border-white/10 p-3">
          <summary className="cursor-pointer text-sm text-brand-silver">{copy.manual}</summary>
          <div className="mt-3 flex gap-3">
            <input
              type="text"
              inputMode="url"
              dir="ltr"
              placeholder="https://drive.google.com/image.jpg"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="h-12 flex-1 rounded border border-white/10 bg-brand-navy px-4 text-left text-white focus:border-brand-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={add}
              disabled={busy}
              className="rounded bg-brand-gold px-6 font-bold text-white hover:bg-[#b8962e] disabled:opacity-60"
            >
              {copy.add}
            </button>
          </div>
        </details>
      </div>
      {images.length === 0 ? (
        <p className="text-sm text-brand-silver">{copy.noImages}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded border border-white/10">
              <img
                src={normalizeImageUrl(image.image_url)}
                onError={handleImageError}
                alt=""
                className="h-32 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => void remove(image.id)}
                className="absolute top-2 right-2 rounded bg-red-500/80 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                title={copy.deleteTooltip}
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

export function StagedImagesManager({
  images,
  onChange,
  onUploadingChange,
  disabled,
}: {
  images: ProductionProjectImageInput[];
  onChange: (images: ProductionProjectImageInput[]) => void;
  onUploadingChange: (uploading: boolean) => void;
  disabled: boolean;
}) {
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [url, setUrl] = useState('');

  const add = (imageUrl: string) => {
    const trimmedUrl = imageUrl.trim();
    if (!trimmedUrl) return;
    onChange([
      ...images,
      { image_url: trimmedUrl, alt_text_en: null, alt_text_he: null, sort_order: images.length },
    ]);
    setUrl('');
  };

  const remove = (index: number) => {
    onChange(
      images
        .filter((_, imageIndex) => imageIndex !== index)
        .map((image, sort_order) => ({ ...image, sort_order })),
    );
  };

  return (
    <section className="border-t border-white/10 pt-8">
      <h3 className="mb-4 text-lg font-bold text-white">{copy.gallery}</h3>
      <div className="mb-6 space-y-3">
        <ImageUploadField
          label={copy.upload}
          folder="production-projects"
          onUploaded={add}
          onUploadingChange={onUploadingChange}
          disabled={disabled}
        />
        <details className="rounded border border-white/10 p-3">
          <summary className="cursor-pointer text-sm text-brand-silver">{copy.manual}</summary>
          <div className="mt-3 flex gap-3">
            <input
              type="text"
              inputMode="url"
              dir="ltr"
              placeholder="https://drive.google.com/image.jpg"
              value={url}
              disabled={disabled}
              onChange={(event) => setUrl(event.target.value)}
              className="h-12 flex-1 rounded border border-white/10 bg-brand-navy px-4 text-left text-white focus:border-brand-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => add(url)}
              disabled={disabled}
              className="rounded bg-brand-gold px-6 font-bold text-white hover:bg-[#b8962e]"
            >
              {copy.add}
            </button>
          </div>
        </details>
      </div>
      {images.length === 0 ? (
        <p className="text-sm text-brand-silver">{copy.noImages}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((image, index) => (
            <div key={`${image.image_url}-${index}`} className="group relative overflow-hidden rounded border border-white/10">
              <img
                src={normalizeImageUrl(image.image_url)}
                onError={handleImageError}
                alt=""
                className="h-32 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-2 right-2 rounded bg-red-500/80 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                title={copy.deleteTooltip}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function ProductionProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const isEdit = Boolean(id);
  const [detail, setDetail] = useState<ProductionProjectDto | undefined>();
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stagedImages, setStagedImages] = useState<ProductionProjectImageInput[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    setLoading(true);
    setLoadError(false);
    getAdminProductionProject(id)
      .then(setDetail)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const submit = async (values: ProductionProjectFormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = productionProjectPayload(values, isEdit ? undefined : stagedImages);
      if (isEdit && id) {
        await updateProductionProject(id, payload);
        navigate('/admin/production-projects');
      } else {
        const created = await createProductionProject(payload);
        navigate(`/admin/production-projects/${created.id}/edit`, { replace: true });
      }
    } catch (submitErrorValue) {
      setSubmitError(submitErrorValue instanceof ApiError ? submitErrorValue.message : copy.saveFailed);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState variant="form" />;
  if (loadError) return <ErrorState />;

  return (
    <div>
      <h2 className="mb-8 text-2xl font-bold text-white">{isEdit ? copy.editTitle : copy.addTitle}</h2>
      <ProductionProjectForm
        initialValues={detail ? toValues(detail) : EMPTY_PRODUCTION_PROJECT}
        submitting={submitting}
        disabled={uploadingImages}
        error={submitError}
        onSubmit={submit}
      >
        {!isEdit && (
          <StagedImagesManager
            images={stagedImages}
            onChange={setStagedImages}
            onUploadingChange={setUploadingImages}
            disabled={submitting}
          />
        )}
      </ProductionProjectForm>
      {isEdit && detail && <ImagesManager projectId={detail.id} initialImages={detail.images} />}
    </div>
  );
}

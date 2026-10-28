import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Eye, EyeOff, ImagePlus, X } from 'lucide-react';
import { ApiError } from '@/api/client';
import {
  createGalleryImage,
  listAdminGalleryImages,
  updateGalleryImage,
  type GalleryImageDto,
  type GalleryLocation,
} from '@/api/gallery';
import { uploadAdminImage } from '@/api/uploads';
import { useLanguage } from '@/i18n';
import { projectCategoryLabel } from '@/lib/projectCategories';
import { normalizeImageUrl } from '@/lib/utils';

type PendingUpload = {
  id: string;
  name: string;
  category: GalleryLocation;
  url: string;
};
type QueueItem = {
  id: string;
  name: string;
  category: GalleryLocation;
  file?: File;
  preview: string;
  url?: string;
  status: 'queued' | 'uploading' | 'saving' | 'failed' | 'done' | 'invalid';
  progress: number | null;
  error?: string;
};
const PENDING_KEY = 'tas_gallery_pending_uploads';
const pendingUploads = (): PendingUpload[] => {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(PENDING_KEY) ?? '[]',
    );
    return Array.isArray(value)
      ? value.filter(
          (item): item is PendingUpload =>
            item &&
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.url === 'string' &&
            /^\/uploads\/gallery\/[0-9a-f-]{36}\.(jpe?g|png|webp)$/.test(
              item.url,
            ) &&
            (item.category === 'LOCAL' || item.category === 'INTERNATIONAL'),
        )
      : [];
  } catch {
    return [];
  }
};
function rememberUpload(item: PendingUpload, remove = false) {
  try {
    const items = pendingUploads().filter((entry) => entry.id !== item.id);
    if (!remove) items.push(item);
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(items));
  } catch {
    /* Upload retries still work in memory when storage is unavailable. */
  }
}
const CONTROL =
  'rounded border border-white/25 px-4 py-2.5 text-sm transition hover:border-brand-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:cursor-not-allowed disabled:opacity-50';

export function AdminGallery() {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<GalleryImageDto[]>([]);
  const [category, setCategory] = useState<GalleryLocation>('LOCAL');
  const [queue, setQueue] = useState<QueueItem[]>(() =>
    pendingUploads().map((item) => ({
      ...item,
      preview: normalizeImageUrl(item.url),
      status: 'failed',
      progress: null,
    })),
  );
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [savingIds, setSavingIds] = useState<number[]>([]);
  const running = useRef(false);
  const mounted = useRef(true);
  const previews = useRef(new Set<string>());
  const changing = useRef(new Set<number>());
  const uploadError = t(
    'לא ניתן לשמור. נסו שוב כדי להשלים את הפרסום.',
    'Could not save. Retry to finish publishing.',
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const url of previews.current) URL.revokeObjectURL(url);
      previews.current.clear();
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    void listAdminGalleryImages()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  const onFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    const selected: QueueItem[] = [];
    for (const file of files) {
      const id = `${file.name}:${file.size}:${file.lastModified}`;
      if (
        queue.some((item) => item.id === id) ||
        selected.some((item) => item.id === id)
      )
        continue;
      const valid =
        file.size > 0 &&
        file.size <= 5 * 1024 * 1024 &&
        /\.(jpe?g|png|webp)$/i.test(file.name) &&
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const preview = valid ? URL.createObjectURL(file) : '';
      if (preview) previews.current.add(preview);
      selected.push({
        id,
        name: file.name,
        category,
        file,
        preview,
        status: valid ? 'queued' : 'invalid',
        progress: null,
        error: valid
          ? undefined
          : t(
              'נדרשת תמונת JPG, PNG או WEBP עד 5MB.',
              'Choose a JPG, PNG or WEBP image up to 5MB.',
            ),
      });
    }
    setQueue((current) => [...current, ...selected]);
  };

  const patchQueue = (id: string, patch: Partial<QueueItem>) => {
    if (mounted.current)
      setQueue((current) =>
        current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
  };

  const upload = async () => {
    if (running.current || loading || loadError) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      for (const item of queue.filter(
        (entry) => entry.status === 'queued' || entry.status === 'failed',
      )) {
        if (!mounted.current) break;
        let url = item.url;
        try {
          patchQueue(item.id, {
            status: url ? 'saving' : 'uploading',
            error: undefined,
            progress: null,
          });
          if (!url) {
            if (!item.file) throw new Error(uploadError);
            const uploaded = await uploadAdminImage(
              item.file,
              'gallery',
              (progress) => patchQueue(item.id, { progress }),
            );
            url = uploaded.url;
            // Persist before record creation, so a lost response/reload can retry
            // the same URL instead of uploading another file or creating duplicates.
            rememberUpload({
              id: item.id,
              name: item.name,
              category: item.category,
              url,
            });
            patchQueue(item.id, { url, status: 'saving', progress: 100 });
          }
          if (!mounted.current) break;
          const created = await createGalleryImage({
            image_url: url,
            category: item.category,
          });
          rememberUpload(
            { id: item.id, name: item.name, category: item.category, url },
            true,
          );
          if (!mounted.current) break;
          setItems((current) =>
            [
              ...current.filter((image) => image.id !== created.id),
              created,
            ].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
          );
          patchQueue(item.id, { status: 'done', url });
        } catch (cause) {
          patchQueue(item.id, {
            status: 'failed',
            url,
            error: cause instanceof Error ? cause.message : uploadError,
          });
          if (cause instanceof ApiError && cause.status === 401) break;
        }
      }
    } finally {
      running.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const changeItem = async (
    item: GalleryImageDto,
    patch: { category?: GalleryLocation; is_active?: boolean },
  ) => {
    if (changing.current.has(item.id)) return;
    changing.current.add(item.id);
    setSavingIds((current) => [...current, item.id]);
    setError(null);
    try {
      const updated = await updateGalleryImage(item.id, patch);
      if (mounted.current)
        setItems((current) =>
          current.map((image) => (image.id === updated.id ? updated : image)),
        );
    } catch (cause) {
      if (mounted.current)
        setError(cause instanceof Error ? cause.message : uploadError);
    } finally {
      changing.current.delete(item.id);
      if (mounted.current)
        setSavingIds((current) => current.filter((id) => id !== item.id));
    }
  };

  const removeQueued = (item: QueueItem) => {
    if (item.preview.startsWith('blob:')) {
      URL.revokeObjectURL(item.preview);
      previews.current.delete(item.preview);
    }
    setQueue((current) => current.filter((entry) => entry.id !== item.id));
  };
  const statusLabel = (item: QueueItem) =>
    ({
      queued: t('מוכן להעלאה', 'Ready to upload'),
      uploading: t('מעלה תמונה…', 'Uploading…'),
      saving: t('מפרסם…', 'Publishing…'),
      failed: t('הפרסום לא הושלם', 'Publishing incomplete'),
      done: t('פורסם', 'Published'),
      invalid: t('קובץ לא נתמך', 'Unsupported file'),
    })[item.status];
  const ready = queue.some((item) => item.status === 'queued');
  const failed = queue.some((item) => item.status === 'failed');

  return (
    <div className="space-y-8 text-white">
      <div>
        <h2 className="text-2xl font-bold">
          {t('גלריית תמונות', 'Project photo gallery')}
        </h2>
        <p className="mt-2 text-brand-silver">
          {t(
            'בחרו מיקום, הוסיפו תמונות ופרסמו ללא כותרת או תיאור.',
            'Choose a location, preview your photos, then publish without titles or descriptions.',
          )}
        </p>
      </div>
      <section
        className="space-y-5 rounded-xl border border-white/10 bg-brand-navy p-5 md:p-7"
        aria-label={t('הוספת תמונות', 'Add photos')}
      >
        <div>
          <label
            htmlFor="gallery-location"
            className="mb-2 block text-sm font-bold"
          >
            {t('מיקום הפרויקט', 'Project location')}
          </label>
          <select
            id="gallery-location"
            value={category}
            disabled={busy}
            onChange={(event) =>
              setCategory(event.target.value as GalleryLocation)
            }
            className="w-full rounded border border-white/25 bg-brand-surface p-3 text-white md:max-w-sm"
          >
            {(['LOCAL', 'INTERNATIONAL'] as const).map((key) => (
              <option key={key} value={key}>
                {projectCategoryLabel(key, language)}
              </option>
            ))}
          </select>
        </div>
        <label
          className={`inline-flex min-h-12 max-w-full items-center justify-center gap-3 rounded border border-brand-gold px-5 py-3 font-bold text-brand-gold focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-brand-gold ${busy ? 'opacity-50' : 'cursor-pointer'}`}
        >
          <ImagePlus className="h-5 w-5 shrink-0" />
          {t('בחירת תמונות', 'Select photos')}
          <input
            className="sr-only"
            type="file"
            multiple
            disabled={busy}
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={onFiles}
          />
        </label>
        <p className="text-sm text-brand-silver">
          {t(
            'ניתן לבחור מספר תמונות. JPG, PNG, WEBP — עד 5MB לתמונה.',
            'Select multiple images. JPG, PNG, WEBP — up to 5MB each.',
          )}
        </p>
        {queue.length > 0 && (
          <ul className="space-y-3">
            {queue.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded border border-white/10 p-3"
              >
                {item.preview && (
                  <img
                    src={item.preview}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="break-all text-sm">{item.name}</p>
                  <p className="text-xs text-brand-silver">
                    {projectCategoryLabel(item.category, language)}
                  </p>
                  <p role="status" className="mt-1 text-sm">
                    {statusLabel(item)}
                    {item.status === 'uploading' && item.progress !== null
                      ? ` ${item.progress}%`
                      : ''}
                  </p>
                  {item.status === 'uploading' && (
                    <progress
                      max={100}
                      value={item.progress ?? undefined}
                      aria-label={item.name}
                      className="mt-1 h-2 w-full accent-brand-gold"
                    />
                  )}
                  {item.error && (
                    <p
                      role="alert"
                      className="mt-1 break-words text-sm text-red-200"
                    >
                      {item.error}
                    </p>
                  )}
                </div>
                {!busy && (!item.url || item.status === 'done') && (
                  <button
                    type="button"
                    onClick={() => removeQueued(item)}
                    aria-label={`${t('הסרה מהרשימה', 'Remove from queue')} ${item.name}`}
                    className="shrink-0 rounded p-3 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {(ready || failed || busy) && (
          <button
            type="button"
            disabled={busy || loading || loadError}
            onClick={() => void upload()}
            className={`${CONTROL} bg-brand-gold font-bold text-brand-navy`}
          >
            {busy
              ? t('מעלה ומפרסם…', 'Uploading and publishing…')
              : ready
                ? t('העלאה ופרסום', 'Upload and publish')
                : t('ניסיון חוזר לקבצים שנכשלו', 'Retry failed')}
          </button>
        )}
        {failed && !busy && (
          <p className="text-sm text-brand-silver">
            {t(
              'נסו שוב להשלמת הפרסום. תמונות שכבר הועלו לא יועלו מחדש.',
              'Retry to finish publishing. Already uploaded files will be reused.',
            )}
          </p>
        )}
      </section>
      {error && (
        <p
          role="alert"
          className="rounded border border-red-500/30 bg-red-500/10 p-4 text-red-200"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">{t('טוען תמונות…', 'Loading photos…')}</p>
      ) : loadError ? (
        <div role="alert">
          <p>{t('טעינת התמונות נכשלה.', 'Could not load gallery photos.')}</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className={`mt-3 ${CONTROL}`}
          >
            {t('נסו שוב', 'Try again')}
          </button>
        </div>
      ) : items.length === 0 ? (
        <p role="status" className="py-12 text-center text-brand-silver">
          {t('אין תמונות בגלריה.', 'No gallery photos yet.')}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-brand-navy"
            >
              <img
                alt=""
                src={normalizeImageUrl(item.image_url)}
                className={`aspect-[4/3] w-full object-cover ${item.is_active ? '' : 'opacity-50'}`}
                loading="lazy"
              />
              <div className="space-y-3 p-4">
                <select
                  value={item.category ?? 'LOCAL'}
                  disabled={savingIds.includes(item.id)}
                  aria-label={`${t('קטגוריית תמונה', 'Photo category')} ${index + 1}`}
                  onChange={(event) =>
                    void changeItem(item, {
                      category: event.target.value as GalleryLocation,
                    })
                  }
                  className="w-full rounded border border-white/25 bg-brand-surface p-3 text-sm text-white"
                >
                  {(['LOCAL', 'INTERNATIONAL'] as const).map((key) => (
                    <option key={key} value={key}>
                      {projectCategoryLabel(key, language)}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`text-sm ${item.is_active ? 'text-brand-silver' : 'text-brand-gold'}`}
                  >
                    {item.is_active
                      ? t('מוצג באתר', 'Published')
                      : t('מוסתר מהאתר', 'Hidden')}
                  </span>
                  <button
                    type="button"
                    disabled={savingIds.includes(item.id)}
                    onClick={() =>
                      void changeItem(item, { is_active: !item.is_active })
                    }
                    className={`inline-flex items-center gap-2 ${CONTROL}`}
                  >
                    {item.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {item.is_active
                      ? t('הסתרה', 'Hide')
                      : t('פרסום', 'Publish')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, type ChangeEvent } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { ApiError } from '@/api/client';
import { createGalleryImage, listAdminGalleryImages, updateGalleryImage, type GalleryImageDto, type GalleryLocation } from '@/api/gallery';
import { uploadAdminImage } from '@/api/uploads';
import { useLanguage } from '@/i18n';
import { normalizeImageUrl } from '@/lib/utils';

const COPY = {
  he: { title: 'גלריית תמונות', description: 'הוסיפו תמונות ללא כותרת או תיאור.', category: 'מיקום הפרויקט', local: 'בארץ', abroad: 'בחו״ל', upload: 'העלאת תמונות', uploading: 'מעלה תמונות…', empty: 'אין תמונות בגלריה.', published: 'מוצג באתר', hide: 'הסתרה', show: 'הצגה', error: 'שמירת התמונות נכשלה.', retry: 'נסה שוב', categoryError: 'עדכון הקטגוריה נכשל.', partial: 'חלק מהתמונות לא נשמרו. ניתן לנסות שוב.', order: 'סדר תצוגה' },
  en: { title: 'Project photo gallery', description: 'Add project photos without titles or descriptions.', category: 'Project location', local: 'Local', abroad: 'Abroad', upload: 'Upload photos', uploading: 'Uploading photos…', empty: 'No gallery photos yet.', published: 'Visible on website', hide: 'Hide', show: 'Show', error: 'Could not save photos.', retry: 'Try again', categoryError: 'Could not update the category.', partial: 'Some photos were not saved. Please retry.', order: 'Display order' },
};

export function AdminGallery() {
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [items, setItems] = useState<GalleryImageDto[]>([]);
  const [category, setCategory] = useState<GalleryLocation>('LOCAL');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setItems(await listAdminGalleryImages());
      setError(null);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : copy.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const onFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (!files.length) return;
    setBusy(true);
    setError(null);
    let failures = 0;
    let nextOrder = items.reduce((max, item) => Math.max(max, item.sort_order), 0) + 1;
    for (const file of files) {
      try {
        const uploaded = await uploadAdminImage(file, 'gallery');
        const created = await createGalleryImage({
          image_url: uploaded.url,
          category,
          is_active: true,
          sort_order: nextOrder++,
        });
        setItems((current) => [...current, created]);
      } catch {
        failures += 1;
      }
    }
    if (failures) setError(copy.partial + ' (' + failures + ')');
    setBusy(false);
  };

  const changeItem = async (item: GalleryImageDto, patch: Partial<Pick<GalleryImageDto, 'category' | 'is_active' | 'sort_order'>>) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await updateGalleryImage(item.id, patch);
      setItems((current) => current.map((image) => image.id === updated.id ? updated : image));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : copy.categoryError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8 text-white">
      <div>
        <h2 className="text-2xl font-bold">{copy.title}</h2>
        <p className="mt-2 text-brand-silver">{copy.description}</p>
      </div>

      <section className="rounded-xl border border-white/10 bg-brand-navy p-5 md:p-7">
        <label className="mb-2 block text-sm font-bold">{copy.category}</label>
        <select
          value={category}
          disabled={busy}
          onChange={(event) => setCategory(event.target.value as GalleryLocation)}
          className="mb-5 w-full rounded border border-white/20 bg-brand-surface p-3 text-white md:max-w-sm"
        >
          <option value="LOCAL">{copy.local}</option>
          <option value="INTERNATIONAL">{copy.abroad}</option>
        </select>
        <label className="flex max-w-md cursor-pointer items-center justify-center gap-3 rounded bg-brand-gold px-5 py-4 font-bold text-brand-navy">
          <ImagePlus className="h-5 w-5" />
          {busy ? copy.uploading : copy.upload}
          <input className="sr-only" type="file" multiple disabled={busy} accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => void onFiles(event)} />
        </label>
      </section>

      {error && (
        <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
          <button type="button" onClick={() => void refresh()} className="ms-4 underline">{copy.retry}</button>
        </div>
      )}

      {loading ? <p>{copy.uploading}</p> : items.length === 0 ? (
        <p className="py-12 text-center text-brand-silver">{copy.empty}</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-white/10 bg-brand-navy">
              <img alt="" src={normalizeImageUrl(item.image_url)} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <div className="space-y-3 p-4">
                <select
                  value={item.category === 'INTERNATIONAL' ? 'INTERNATIONAL' : 'LOCAL'}
                  disabled={busy}
                  aria-label={copy.category}
                  onChange={(event) => void changeItem(item, { category: event.target.value })}
                  className="w-full rounded border border-white/20 bg-brand-surface p-2 text-sm text-white"
                >
                  <option value="LOCAL">{copy.local}</option>
                  <option value="INTERNATIONAL">{copy.abroad}</option>
                </select>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-brand-silver">{copy.order}: {item.sort_order}</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void changeItem(item, { is_active: !item.is_active })}
                    className="inline-flex items-center gap-2 rounded border border-white/20 px-3 py-2 text-sm hover:border-brand-gold disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {item.is_active ? copy.hide : copy.show}
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

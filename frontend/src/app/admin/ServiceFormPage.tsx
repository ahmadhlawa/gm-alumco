import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { createService, getAdminService, updateService } from '@/api/services';
import type { ServiceDto } from '@/api/types';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { ImageUploadField } from '@/components/forms/ImageUploadField';
import { useLanguage } from '@/i18n';

type Values = Pick<ServiceDto, 'title_en' | 'title_he' | 'description_en' | 'description_he' | 'image_url' | 'starting_price' | 'is_active' | 'sort_order'>;
const empty: Values = { title_en: '', title_he: '', description_en: '', description_he: '', image_url: '', starting_price: null, is_active: true, sort_order: 0 };
const input = 'w-full rounded border border-white/10 bg-brand-navy px-4 py-3 text-white outline-none focus:border-brand-gold';

// Admin service form copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    editTitle: 'עריכת שירות',
    addTitle: 'הוספת שירות',
    description: 'הזינו את תוכן השירות בעברית ובאנגלית.',
    titlePlaceholder: 'כותרת',
    descPlaceholder: 'תיאור',
    image: 'תמונת השירות',
    advancedImage: 'אפשרות מתקדמת: שימוש בקישור תמונה ידני',
    pricePlaceholder: 'מחיר התחלתי (אופציונלי)',
    orderPlaceholder: 'סדר',
    active: 'פעיל ומוצג באתר',
    save: 'שמירת השירות',
    saving: 'שומר…',
    saveFailed: 'Could not save the service.',
  },
  en: {
    editTitle: 'Edit service',
    addTitle: 'Add service',
    description: 'Enter the service content in Hebrew and English.',
    titlePlaceholder: 'Title',
    descPlaceholder: 'Description',
    image: 'Service image',
    advancedImage: 'Advanced option: use a manual image link',
    pricePlaceholder: 'Starting price (optional)',
    orderPlaceholder: 'Order',
    active: 'Active and visible on the site',
    save: 'Save service',
    saveFailed: 'Could not save the service.',
    saving: 'Saving…',
  },
};

export function ServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [values, setValues] = useState<Values>(empty);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));

  useEffect(() => { if (id) getAdminService(id).then((item) => setValues(item)).catch(() => setError(true)).finally(() => setLoading(false)); }, [id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setSubmitError(null);
    const payload = { ...values, description_en: values.description_en || null, description_he: values.description_he || null, image_url: values.image_url || null, starting_price: values.starting_price || null };
    try {
      if (id) await updateService(id, payload); else await createService(payload);
      navigate('/admin/services');
    } catch (submitError) {
      setSubmitError(submitError instanceof ApiError ? submitError.message : copy.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  return <form onSubmit={submit} className="max-w-5xl space-y-6">
    <div><h2 className="text-2xl font-bold text-white">{id ? copy.editTitle : copy.addTitle}</h2><p className="mt-1 text-brand-silver">{copy.description}</p></div>
    {submitError && <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 whitespace-pre-wrap">{submitError}</div>}
    <div className="grid gap-5 lg:grid-cols-2">{(['he', 'en'] as const).map((lang) => <section key={lang} className="space-y-3">
      <h3 className="font-bold text-brand-gold">{lang === 'en' ? 'English' : 'עברית'}</h3>
      <input required value={values[`title_${lang}`]} onChange={(e) => set(`title_${lang}`, e.target.value)} className={input} placeholder={copy.titlePlaceholder} dir={lang === 'en' ? 'ltr' : 'rtl'} />
      <textarea value={values[`description_${lang}`] ?? ''} onChange={(e) => set(`description_${lang}`, e.target.value)} className={input} rows={6} placeholder={copy.descPlaceholder} dir={lang === 'en' ? 'ltr' : 'rtl'} />
    </section>)}</div>
    <ImageUploadField label={copy.image} folder="services" value={values.image_url} onUploaded={(url) => set('image_url', url)} />
    <details className="rounded border border-white/10 p-3"><summary className="cursor-pointer text-sm text-brand-silver">{copy.advancedImage}</summary><input type="text" inputMode="url" dir="ltr" value={values.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)} className={`${input} mt-3`} placeholder="Image URL" /></details>
    <div className="grid gap-5 md:grid-cols-2"><input type="number" min="0" step="0.01" dir="ltr" value={values.starting_price ?? ''} onChange={(e) => set('starting_price', e.target.value || null)} className={input} placeholder={copy.pricePlaceholder} /><input type="number" value={values.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} className={input} placeholder={copy.orderPlaceholder} /></div>
    <label className="flex items-center gap-3 text-white"><input type="checkbox" checked={values.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-5 w-5 accent-brand-gold" />{copy.active}</label>
    <button disabled={saving} className="rounded bg-brand-gold px-8 py-3 font-bold text-white disabled:opacity-60">{saving ? copy.saving : copy.save}</button>
  </form>;
}

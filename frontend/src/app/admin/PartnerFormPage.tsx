import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { createPartner, getAdminPartner, updatePartner } from '@/api/partners';
import { partnerPayload, type PartnerFormValues } from './adminMappers';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { ImageUploadField } from '@/components/forms/ImageUploadField';
import { useLanguage } from '@/i18n';

const empty: PartnerFormValues = { name: '', logo_url: '', website_url: '', is_active: true, sort_order: 0 };
const input = 'w-full rounded border border-white/10 bg-brand-navy px-4 py-3 text-white outline-none focus:border-brand-gold';

// Admin partner form copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    editTitle: 'עריכת שותף',
    addTitle: 'הוספת שותף',
    description: 'פרטים בסיסיים של השותף כפי שיוצגו באתר.',
    logoRequired: 'יש להעלות לוגו של השותף או להזין קישור ידני.',
    name: 'שם השותף',
    logo: 'לוגו השותף',
    advancedLogo: 'אפשרות מתקדמת: שימוש בקישור לוגו ידני',
    website: 'קישור לאתר (אופציונלי)',
    sortOrder: 'סדר הצגה',
    active: 'פעיל ומוצג באתר',
    save: 'שמירת השותף',
    saving: 'שומר…',
  },
  en: {
    editTitle: 'Edit partner',
    addTitle: 'Add partner',
    description: 'Basic partner details as they will appear on the site.',
    logoRequired: 'Please upload a partner logo or enter a manual link.',
    name: 'Partner name',
    logo: 'Partner logo',
    advancedLogo: 'Advanced option: use a manual logo link',
    website: 'Website link (optional)',
    sortOrder: 'Display order',
    active: 'Active and visible on the site',
    save: 'Save partner',
    saveFailed: 'Could not save the partner.',
    saving: 'Saving…',
  },
};

export function PartnerFormPage() {
  const { id } = useParams(); const navigate = useNavigate();
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const saveFailed = language === 'en' ? COPY.en.saveFailed : 'Could not save the partner.';
  const [values, setValues] = useState(empty); const [loading, setLoading] = useState(Boolean(id)); const [error, setError] = useState(false); const [saving, setSaving] = useState(false); const [formError, setFormError] = useState<string | null>(null);
  useEffect(() => { if (id) getAdminPartner(id).then((item) => setValues({ name: item.name_he || item.name_en, logo_url: item.logo_url, website_url: item.website_url ?? '', is_active: item.is_active, sort_order: item.sort_order })).catch(() => setError(true)).finally(() => setLoading(false)); }, [id]);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!values.logo_url.trim()) { setFormError(copy.logoRequired); return; } setFormError(null); setSaving(true); try { const payload = partnerPayload(values); if (id) await updatePartner(id, payload); else await createPartner(payload); navigate('/admin/partners'); } catch (submitError) { setFormError(submitError instanceof ApiError ? submitError.message : saveFailed); } finally { setSaving(false); } };
  if (loading) return <LoadingState />; if (error) return <ErrorState />;
  return <form onSubmit={submit} className="max-w-2xl space-y-6"><div><h2 className="text-2xl font-bold text-white">{id ? copy.editTitle : copy.addTitle}</h2><p className="mt-1 text-brand-silver">{copy.description}</p></div>
    {formError && <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 whitespace-pre-wrap">{formError}</div>}
    <label className="block space-y-2 text-white"><span>{copy.name}</span><input required value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} className={input} /></label>
    <ImageUploadField label={copy.logo} folder="partners" value={values.logo_url} onUploaded={(url) => setValues((current) => ({ ...current, logo_url: url }))} />
    <details className="rounded border border-white/10 p-3"><summary className="cursor-pointer text-sm text-brand-silver">{copy.advancedLogo}</summary><input type="text" inputMode="url" dir="ltr" value={values.logo_url} onChange={(e) => setValues({ ...values, logo_url: e.target.value })} className={`${input} mt-3`} /></details>
    <label className="block space-y-2 text-white"><span>{copy.website}</span><input type="url" dir="ltr" value={values.website_url} onChange={(e) => setValues({ ...values, website_url: e.target.value })} className={input} /></label>
    <label className="block space-y-2 text-white"><span>{copy.sortOrder}</span><input type="number" value={values.sort_order} onChange={(e) => setValues({ ...values, sort_order: Number(e.target.value) })} className={input} /></label>
    <label className="flex items-center gap-3 text-white"><input type="checkbox" checked={values.is_active} onChange={(e) => setValues({ ...values, is_active: e.target.checked })} className="h-5 w-5 accent-brand-gold" />{copy.active}</label>
    <button disabled={saving} className="rounded bg-brand-gold px-8 py-3 font-bold text-white disabled:opacity-60">{saving ? copy.saving : copy.save}</button>
  </form>;
}

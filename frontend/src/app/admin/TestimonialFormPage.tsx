import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTestimonial, getAdminTestimonial, updateTestimonial } from '@/api/testimonials';
import type { TestimonialDto } from '@/api/types';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { useLanguage } from '@/i18n';

type Values = Pick<
  TestimonialDto,
  'client_name_en' | 'client_name_he' | 'client_position_en' | 'client_position_he' | 'message_en' | 'message_he' | 'rating' | 'is_active' | 'sort_order'
>;

const empty: Values = {
  client_name_en: '', client_name_he: '',
  client_position_en: '', client_position_he: '',
  message_en: '', message_he: '',
  rating: 5, is_active: true, sort_order: 0,
};

const input = 'w-full rounded border border-white/10 bg-brand-navy px-4 py-3 text-white outline-none focus:border-brand-gold';

// Admin testimonial form copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    editTitle: 'עריכת המלצה',
    addTitle: 'הוספת המלצה',
    description: 'הזינו את חוות הדעת בעברית ובאנגלית.',
    namePlaceholder: 'שם הלקוח',
    positionPlaceholder: 'תפקיד / תיאור (אופציונלי)',
    messagePlaceholder: 'חוות הדעת',
    rating: 'דירוג (1-5)',
    order: 'סדר הצגה',
    active: 'פעיל ומוצג באתר',
    save: 'שמירת ההמלצה',
    saving: 'שומר…',
    validation: 'יש להזין שם לקוח וחוות דעת בעברית ובאנגלית.',
  },
  en: {
    editTitle: 'Edit testimonial',
    addTitle: 'Add testimonial',
    description: 'Enter the review in Hebrew and English.',
    namePlaceholder: 'Client name',
    positionPlaceholder: 'Position / title (optional)',
    messagePlaceholder: 'The review',
    rating: 'Rating (1-5)',
    order: 'Display order',
    active: 'Active and visible on the site',
    save: 'Save testimonial',
    saving: 'Saving…',
    validation: 'Please enter a client name and review in Hebrew and English.',
  },
};

export function TestimonialFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [values, setValues] = useState<Values>(empty);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);
  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));

  useEffect(() => {
    if (id) getAdminTestimonial(id).then(setValues).catch(() => setError(true)).finally(() => setLoading(false));
  }, [id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!values.client_name_he.trim() || !values.client_name_en.trim() || !values.message_he.trim() || !values.message_en.trim()) {
      setValidation(copy.validation);
      return;
    }
    setValidation(null);
    setSaving(true);
    const payload = {
      ...values,
      client_position_en: values.client_position_en || null,
      client_position_he: values.client_position_he || null,
      rating: Math.max(1, Math.min(5, values.rating || 5)),
    };
    try {
      if (id) await updateTestimonial(id, payload);
      else await createTestimonial(payload);
      navigate('/admin/testimonials');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState variant="form" />;
  if (error) return <ErrorState />;

  return <form onSubmit={submit} className="max-w-5xl space-y-6">
    <div><h2 className="text-2xl font-bold text-white">{id ? copy.editTitle : copy.addTitle}</h2><p className="mt-1 text-brand-silver">{copy.description}</p></div>
    {validation && <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{validation}</div>}

    <div className="grid gap-5 lg:grid-cols-2">{(['he', 'en'] as const).map((lang) => <section key={lang} className="space-y-3">
      <h3 className="font-bold text-brand-gold">{lang === 'en' ? 'English' : 'עברית'}</h3>
      <input required value={values[`client_name_${lang}`]} onChange={(e) => set(`client_name_${lang}`, e.target.value)} className={input} placeholder={copy.namePlaceholder} dir={lang === 'en' ? 'ltr' : 'rtl'} />
      <input value={values[`client_position_${lang}`] ?? ''} onChange={(e) => set(`client_position_${lang}`, e.target.value)} className={input} placeholder={copy.positionPlaceholder} dir={lang === 'en' ? 'ltr' : 'rtl'} />
      <textarea required value={values[`message_${lang}`]} onChange={(e) => set(`message_${lang}`, e.target.value)} className={input} rows={5} placeholder={copy.messagePlaceholder} dir={lang === 'en' ? 'ltr' : 'rtl'} />
    </section>)}</div>

    <div className="grid gap-5 md:grid-cols-2">
      <label className="block space-y-2 text-white"><span className="text-sm text-brand-silver">{copy.rating}</span>
        <input type="number" min="1" max="5" step="1" dir="ltr" value={values.rating} onChange={(e) => set('rating', Number(e.target.value))} className={input} />
      </label>
      <label className="block space-y-2 text-white"><span className="text-sm text-brand-silver">{copy.order}</span>
        <input type="number" dir="ltr" value={values.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} className={input} />
      </label>
    </div>

    <label className="flex items-center gap-3 text-white"><input type="checkbox" checked={values.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-5 w-5 accent-brand-gold" />{copy.active}</label>
    <button disabled={saving} className="rounded bg-brand-gold px-8 py-3 font-bold text-white disabled:opacity-60">{saving ? copy.saving : copy.save}</button>
  </form>;
}

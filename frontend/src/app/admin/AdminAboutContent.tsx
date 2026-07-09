import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { ApiError } from '@/api/client';
import { getAdminAboutPageContent, updateAboutPageContent } from '@/api/aboutPageContent';
import type { AboutPageContentDto } from '@/api/types';
import { defaultAboutPageContent } from '@/data/aboutPageContent';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ImageUploadField } from '@/components/forms/ImageUploadField';
import { useLanguage } from '@/i18n';

type FieldKey = keyof AboutPageContentDto;
type Feedback = { kind: 'success' | 'error'; message: string } | null;

interface PairField { keyHe: FieldKey; keyEn: FieldKey; label: string; max: number; multiline?: boolean }
interface SingleField { key: FieldKey; label: string; max: number }

// Admin UI copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    title: 'תוכן אודות',
    save: 'שמירה', saving: 'שומר…', saved: 'הנתונים נשמרו בהצלחה.',
    error: 'שמירת הנתונים נכשלה. נסו שוב.', loadError: 'טעינת הנתונים נכשלה.',
    overLimit: 'החריגה ממכסת התווים תמנע שמירה.',
    heCol: 'עברית', enCol: 'אנגלית',
    sectionSuccess: 'סיפור ההצלחה', sectionVisionMission: 'חזון ומשימה',
    imageLabel: 'תמונת סיפור ההצלחה',
    fields: {
      title: 'כותרת', subtitle: 'כותרת משנה', paragraph1: 'פסקה 1', paragraph2: 'פסקה 2',
      bullet1: 'נקודה 1', bullet2: 'נקודה 2', bullet3: 'נקודה 3', bullet4: 'נקודה 4',
      experienceNumber: 'מספר ותק', experienceLabel: 'תווית ותק',
      visionTitle: 'כותרת החזון', visionText: 'טקסט החזון',
      missionTitle: 'כותרת המשימה', missionText: 'טקסט המשימה',
    },
  },
  en: {
    title: 'About Content',
    save: 'Save', saving: 'Saving…', saved: 'Saved successfully.',
    error: 'Could not save. Please try again.', loadError: 'Could not load. Please try again.',
    overLimit: 'Fields over the character limit will block saving.',
    heCol: 'Hebrew', enCol: 'English',
    sectionSuccess: 'Success Story', sectionVisionMission: 'Vision & Mission',
    imageLabel: 'Success Story image',
    fields: {
      title: 'Title', subtitle: 'Subtitle', paragraph1: 'Paragraph 1', paragraph2: 'Paragraph 2',
      bullet1: 'Bullet 1', bullet2: 'Bullet 2', bullet3: 'Bullet 3', bullet4: 'Bullet 4',
      experienceNumber: 'Experience number', experienceLabel: 'Experience label',
      visionTitle: 'Vision title', visionText: 'Vision text',
      missionTitle: 'Mission title', missionText: 'Mission text',
    },
  },
};

function TextField({
  label, value, max, dir, multiline, onChange,
}: {
  label: string; value: string; max: number; dir: 'rtl' | 'ltr'; multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const over = value.length > max;
  const baseClass = `w-full rounded bg-brand-navy px-3 py-2 text-white ${over ? 'border border-red-500' : ''}`;
  return (
    <label className="block space-y-1">
      <span className="flex items-center justify-between text-sm font-bold text-brand-silver">
        <span>{label}</span>
        <span className={over ? 'text-xs text-red-400' : 'text-xs text-brand-silver/60'}>
          {value.length}/{max}
        </span>
      </span>
      {multiline ? (
        <textarea
          value={value}
          maxLength={max}
          dir={dir}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      ) : (
        <input
          value={value}
          maxLength={max}
          dir={dir}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      )}
    </label>
  );
}

export function AdminAboutContent() {
  const { language, dir } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;

  const [form, setForm] = useState<AboutPageContentDto>(defaultAboutPageContent);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminAboutPageContent()
      .then(setForm)
      .catch(() => setFeedback({ kind: 'error', message: copy.loadError }));
    // Run once on mount; copy is stable per language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const get = (key: FieldKey): string => (form[key] as string | null) ?? '';
  const set = (key: FieldKey, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const successPairs: PairField[] = [
    { keyHe: 'title_he', keyEn: 'title_en', label: copy.fields.title, max: 60 },
    { keyHe: 'subtitle_he', keyEn: 'subtitle_en', label: copy.fields.subtitle, max: 120 },
    { keyHe: 'paragraph_1_he', keyEn: 'paragraph_1_en', label: copy.fields.paragraph1, max: 350, multiline: true },
    { keyHe: 'paragraph_2_he', keyEn: 'paragraph_2_en', label: copy.fields.paragraph2, max: 350, multiline: true },
    { keyHe: 'bullet_1_he', keyEn: 'bullet_1_en', label: copy.fields.bullet1, max: 90 },
    { keyHe: 'bullet_2_he', keyEn: 'bullet_2_en', label: copy.fields.bullet2, max: 90 },
    { keyHe: 'bullet_3_he', keyEn: 'bullet_3_en', label: copy.fields.bullet3, max: 90 },
    { keyHe: 'bullet_4_he', keyEn: 'bullet_4_en', label: copy.fields.bullet4, max: 90 },
    { keyHe: 'experience_label_he', keyEn: 'experience_label_en', label: copy.fields.experienceLabel, max: 40 },
  ];
  const successSingles: SingleField[] = [
    { key: 'experience_number', label: copy.fields.experienceNumber, max: 12 },
  ];

  const visionMissionPairs: PairField[] = [
    { keyHe: 'vision_title_he', keyEn: 'vision_title_en', label: copy.fields.visionTitle, max: 60 },
    { keyHe: 'vision_text_he', keyEn: 'vision_text_en', label: copy.fields.visionText, max: 250, multiline: true },
    { keyHe: 'mission_title_he', keyEn: 'mission_title_en', label: copy.fields.missionTitle, max: 60 },
    { keyHe: 'mission_text_he', keyEn: 'mission_text_en', label: copy.fields.missionText, max: 250, multiline: true },
  ];

  // Difference/Stats/CTA are fixed website structure, not admin-editable
  // content — no field-group config exists for them here. See About.tsx
  // (public_stats-driven stats grid, bare <CTASection />) and CTASection.tsx
  // for the fixed-in-code implementation.

  const allPairs = [...successPairs, ...visionMissionPairs];
  const allSingles = successSingles;
  const hasOverLimit =
    allPairs.some((f) => get(f.keyHe).length > f.max || get(f.keyEn).length > f.max) ||
    allSingles.some((f) => get(f.key).length > f.max);

  // The save payload is derived from the same field-group config the form
  // renders, so it can never drift from what's actually shown — and it can
  // never include the Difference/Stats/CTA fields, since no config for them
  // exists on this page.
  const editableKeys: FieldKey[] = [
    'image_url',
    ...allPairs.flatMap((f) => [f.keyHe, f.keyEn]),
    ...allSingles.map((f) => f.key),
  ];

  const renderPair = (field: PairField) => (
    <div key={field.keyHe} className="grid gap-4 md:grid-cols-2">
      <TextField
        label={`${field.label} — ${copy.heCol}`}
        value={get(field.keyHe)}
        max={field.max}
        dir="rtl"
        multiline={field.multiline}
        onChange={(v) => set(field.keyHe, v)}
      />
      <TextField
        label={`${field.label} — ${copy.enCol}`}
        value={get(field.keyEn)}
        max={field.max}
        dir="ltr"
        multiline={field.multiline}
        onChange={(v) => set(field.keyEn, v)}
      />
    </div>
  );

  const renderSingle = (field: SingleField) => (
    <TextField
      key={field.key}
      label={field.label}
      value={get(field.key)}
      max={field.max}
      dir="ltr"
      onChange={(v) => set(field.key, v)}
    />
  );

  const save = async () => {
    if (hasOverLimit) {
      setFeedback({ kind: 'error', message: copy.overLimit });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const payload = Object.fromEntries(
        editableKeys.map((key) => [key, form[key]]),
      ) as Partial<AboutPageContentDto>;
      const saved = await updateAboutPageContent(payload);
      setForm(saved);
      setFeedback({ kind: 'success', message: copy.saved });
    } catch (err) {
      setFeedback({ kind: 'error', message: err instanceof ApiError ? err.message : copy.error });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      <AdminPageHeader
        title={copy.title}
        action={
          <button
            onClick={() => void save()}
            disabled={saving || hasOverLimit}
            className="inline-flex items-center gap-2 rounded bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy hover:bg-[#e3c454] disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? copy.saving : copy.save}
          </button>
        }
      />

      {feedback && (
        <div
          role="alert"
          aria-live="polite"
          className={`rounded-lg border px-4 py-3 text-sm font-bold ${
            feedback.kind === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-white/5 bg-brand-surface-alt p-5">
        <h2 className="text-lg font-bold text-brand-gold">{copy.sectionSuccess}</h2>
        <ImageUploadField
          label={copy.imageLabel}
          folder="about"
          value={form.image_url}
          onUploaded={(url) => set('image_url', url)}
        />
        {successSingles.map(renderSingle)}
        {successPairs.map(renderPair)}
      </section>

      <section className="space-y-4 rounded-xl border border-white/5 bg-brand-surface-alt p-5">
        <h2 className="text-lg font-bold text-brand-gold">{copy.sectionVisionMission}</h2>
        {visionMissionPairs.map(renderPair)}
      </section>
    </div>
  );
}

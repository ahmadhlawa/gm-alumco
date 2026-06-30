import { useState, type FormEvent } from 'react';
import { ImageUploadField } from './ImageUploadField';
import { useLanguage } from '@/i18n';

export interface ProjectFormValues {
  title_ar: string;
  title_en: string;
  title_he: string;
  description_ar: string;
  description_en: string;
  description_he: string;
  category: 'LOCAL' | 'INTERNATIONAL' | 'FEATURED';
  main_image_url: string;
  is_active: boolean;
  sort_order: number;
}

export const EMPTY_PROJECT: ProjectFormValues = {
  title_ar: '',
  title_en: '',
  title_he: '',
  description_ar: '',
  description_en: '',
  description_he: '',
  category: 'LOCAL',
  main_image_url: '',
  is_active: true,
  sort_order: 0,
};

// Admin manages Hebrew + English only. Existing *_ar values are preserved on
// save (passed through untouched in `values`); Arabic is simply not edited here.
const LANGS = [
  { key: 'he', label: 'עברית', dir: 'rtl' as const },
  { key: 'en', label: 'English', dir: 'ltr' as const },
] as const;

// Admin form copy — Hebrew + English only (Hebrew is the default). No Arabic.
const COPY = {
  he: {
    titleLabel: 'כותרת הפרויקט',
    descLabel: 'תיאור',
    category: 'קטגוריה',
    sortOrder: 'סדר הצגה',
    mainImage: 'התמונה הראשית של הפרויקט',
    advancedImage: 'אפשרות מתקדמת: שימוש בקישור תמונה ידני',
    publishedLabel: 'מפורסם (מוצג באתר)',
    save: 'שמירת הפרויקט',
    saving: 'שומר…',
    validation: 'יש להזין כותרת לפרויקט בעברית ובאנגלית.',
    categories: { LOCAL: 'בארץ', INTERNATIONAL: 'בחו״ל', FEATURED: 'נבחר' },
  },
  en: {
    titleLabel: 'Project title',
    descLabel: 'Description',
    category: 'Category',
    sortOrder: 'Display order',
    mainImage: 'Project main image',
    advancedImage: 'Advanced option: use a manual image link',
    publishedLabel: 'Published (visible on the site)',
    save: 'Save project',
    saving: 'Saving…',
    validation: 'Please enter the project title in Hebrew and English.',
    categories: { LOCAL: 'Local', INTERNATIONAL: 'International', FEATURED: 'Featured' },
  },
};

type Lang = (typeof LANGS)[number]['key'];

const inputClass =
  'w-full h-12 px-4 bg-brand-navy border border-white/10 rounded focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-white';

interface Props {
  initialValues?: ProjectFormValues;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: ProjectFormValues) => void | Promise<void>;
}

export function ProjectForm({ initialValues, submitting, error, onSubmit }: Props) {
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [values, setValues] = useState<ProjectFormValues>(initialValues ?? EMPTY_PROJECT);
  const [lang, setLang] = useState<Lang>('he');
  const [validation, setValidation] = useState<string | null>(null);

  const set = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!values.title_he.trim() || !values.title_en.trim()) {
      setValidation(copy.validation);
      return;
    }
    setValidation(null);
    void onSubmit(values);
  };

  const activeLang = LANGS.find((l) => l.key === lang)!;
  const titleKey = `title_${lang}` as const;
  const descKey = `description_${lang}` as const;

  const CATEGORIES = [
    { value: 'LOCAL', label: copy.categories.LOCAL },
    { value: 'INTERNATIONAL', label: copy.categories.INTERNATIONAL },
    { value: 'FEATURED', label: copy.categories.FEATURED },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {(validation || error) && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-md">
          {validation ?? error}
        </div>
      )}

      {/* Language switcher for the localized fields */}
      <div className="flex gap-2">
        {LANGS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setLang(l.key)}
            className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
              lang === l.key
                ? 'bg-brand-gold text-white'
                : 'bg-brand-navy text-brand-silver hover:text-white border border-white/10'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200">{copy.titleLabel} ({activeLang.label})</label>
        <input
          type="text"
          dir={activeLang.dir}
          value={values[titleKey]}
          onChange={(e) => set(titleKey, e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200">{copy.descLabel} ({activeLang.label})</label>
        <textarea
          dir={activeLang.dir}
          value={values[descKey]}
          onChange={(e) => set(descKey, e.target.value)}
          className="w-full p-4 bg-brand-navy border border-white/10 rounded focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-white resize-none"
          rows={5}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">{copy.category}</label>
          <select
            value={values.category}
            onChange={(e) => set('category', e.target.value as ProjectFormValues['category'])}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">{copy.sortOrder}</label>
          <input
            type="number"
            value={values.sort_order}
            onChange={(e) => set('sort_order', Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <ImageUploadField
          label={copy.mainImage}
          folder="projects"
          value={values.main_image_url}
          onUploaded={(url) => set('main_image_url', url)}
        />
        <details className="rounded border border-white/10 p-3">
          <summary className="cursor-pointer text-sm text-brand-silver">{copy.advancedImage}</summary>
          <input
            type="text"
            inputMode="url"
            dir="ltr"
            placeholder="https://drive.google.com/..."
            value={values.main_image_url}
            onChange={(e) => set('main_image_url', e.target.value)}
            className={`${inputClass} mt-3 text-left`}
          />
        </details>
      </div>

      <div className="flex items-center gap-3 py-2">
        <input
          type="checkbox"
          id="is_active"
          checked={values.is_active}
          onChange={(e) => set('is_active', e.target.checked)}
          className="w-5 h-5 accent-brand-gold"
        />
        <label htmlFor="is_active" className="text-white font-bold cursor-pointer">
          {copy.publishedLabel}
        </label>
      </div>

      <div className="pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 bg-brand-gold text-white font-bold rounded-md hover:bg-[#b8962e] transition-colors disabled:opacity-60"
        >
          {submitting ? copy.saving : copy.save}
        </button>
      </div>
    </form>
  );
}

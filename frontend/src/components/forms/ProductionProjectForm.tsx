import { useState, type FormEvent } from 'react';
import { useLanguage } from '@/i18n';

export interface ProductionProjectFormValues {
  title_en: string;
  title_he: string;
  description_en: string;
  description_he: string;
  manufacturer_en: string;
  manufacturer_he: string;
  execution_partner_en: string;
  execution_partner_he: string;
  is_active: boolean;
  sort_order: number;
}

export const EMPTY_PRODUCTION_PROJECT: ProductionProjectFormValues = {
  title_en: '',
  title_he: '',
  description_en: '',
  description_he: '',
  manufacturer_en: '',
  manufacturer_he: '',
  execution_partner_en: '',
  execution_partner_he: '',
  is_active: true,
  sort_order: 0,
};

const LANGS = [
  { key: 'he', label: 'עברית', dir: 'rtl' as const },
  { key: 'en', label: 'English', dir: 'ltr' as const },
] as const;

const COPY = {
  he: {
    title: 'כותרת הפרויקט',
    description: 'תיאור קצר',
    manufacturer: 'יצרן',
    executionPartner: 'שותף ביצוע',
    sortOrder: 'סדר הצגה',
    published: 'פעיל ומוצג באתר',
    save: 'שמירת פרויקט ייצור',
    saving: 'שומר...',
    validation: 'יש להזין כותרת בעברית ובאנגלית.',
  },
  en: {
    title: 'Project title',
    description: 'Short description',
    manufacturer: 'Manufacturer',
    executionPartner: 'Execution partner',
    sortOrder: 'Display order',
    published: 'Active and visible on the site',
    save: 'Save production project',
    saving: 'Saving...',
    validation: 'Please enter the title in Hebrew and English.',
  },
};

type Lang = (typeof LANGS)[number]['key'];

const inputClass =
  'w-full h-12 px-4 bg-brand-navy border border-white/10 rounded focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-white';

interface Props {
  initialValues?: ProductionProjectFormValues;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: ProductionProjectFormValues) => void | Promise<void>;
}

export function ProductionProjectForm({ initialValues, submitting, error, onSubmit }: Props) {
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [values, setValues] = useState<ProductionProjectFormValues>(initialValues ?? EMPTY_PRODUCTION_PROJECT);
  const [lang, setLang] = useState<Lang>('he');
  const [validation, setValidation] = useState<string | null>(null);

  const set = <K extends keyof ProductionProjectFormValues>(key: K, value: ProductionProjectFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!values.title_he.trim() || !values.title_en.trim()) {
      setValidation(copy.validation);
      return;
    }
    setValidation(null);
    void onSubmit(values);
  };

  const activeLang = LANGS.find((item) => item.key === lang)!;
  const titleKey = `title_${lang}` as const;
  const descriptionKey = `description_${lang}` as const;
  const manufacturerKey = `manufacturer_${lang}` as const;
  const executionPartnerKey = `execution_partner_${lang}` as const;

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      {(validation || error) && (
        <div className="rounded border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {validation ?? error}
        </div>
      )}

      <div className="flex gap-2">
        {LANGS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setLang(item.key)}
            className={`rounded px-4 py-2 text-sm font-bold transition-colors ${
              lang === item.key
                ? 'bg-brand-gold text-white'
                : 'border border-white/10 bg-brand-navy text-brand-silver hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200">{copy.title} ({activeLang.label})</label>
        <input
          type="text"
          dir={activeLang.dir}
          value={values[titleKey]}
          onChange={(event) => set(titleKey, event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200">{copy.description} ({activeLang.label})</label>
        <textarea
          dir={activeLang.dir}
          value={values[descriptionKey]}
          onChange={(event) => set(descriptionKey, event.target.value)}
          className="w-full resize-none rounded border border-white/10 bg-brand-navy p-4 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          rows={4}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">{copy.manufacturer} ({activeLang.label})</label>
          <input
            type="text"
            dir={activeLang.dir}
            value={values[manufacturerKey]}
            onChange={(event) => set(manufacturerKey, event.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">{copy.executionPartner} ({activeLang.label})</label>
          <input
            type="text"
            dir={activeLang.dir}
            value={values[executionPartnerKey]}
            onChange={(event) => set(executionPartnerKey, event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">{copy.sortOrder}</label>
          <input
            type="number"
            value={values.sort_order}
            onChange={(event) => set('sort_order', Number(event.target.value))}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-3 pt-7">
          <input
            type="checkbox"
            id="production_is_active"
            checked={values.is_active}
            onChange={(event) => set('is_active', event.target.checked)}
            className="h-5 w-5 accent-brand-gold"
          />
          <label htmlFor="production_is_active" className="cursor-pointer font-bold text-white">
            {copy.published}
          </label>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-brand-gold px-8 py-3 font-bold text-white transition-colors hover:bg-[#b8962e] disabled:opacity-60"
        >
          {submitting ? copy.saving : copy.save}
        </button>
      </div>
    </form>
  );
}

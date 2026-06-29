import { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { createSiteContent, listAdminSiteContent, updateSiteContent } from '@/api/content';
import type { JsonValue, SiteContentDto } from '@/api/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { useLanguage } from '@/i18n';
import {
  applyCompanyNumbers,
  defaultCompanyNumbers,
  extractCompanyNumbers,
  type CompanyNumber,
  type CompanyNumbers,
} from '@/data/publicStats';

// Admin UI copy — Hebrew + English only. No Arabic appears anywhere in this page.
interface AdminCopy {
  title: string;
  description: string;
  valueLabel: string;
  labelHe: string;
  labelEn: string;
  save: string;
  reset: string;
  saving: string;
  saved: string;
  error: string;
  loadError: string;
}

const COPY: { he: AdminCopy; en: AdminCopy } = {
  he: {
    title: 'נתוני החברה',
    description: 'ערכו פעם אחת את מספרי החברה. הם מוצגים אוטומטית בכל האתר.',
    valueLabel: 'ערך',
    labelHe: 'תווית בעברית',
    labelEn: 'תווית באנגלית',
    save: 'שמירה',
    reset: 'שחזור ברירת מחדל',
    saving: 'שומר…',
    saved: 'הנתונים נשמרו.',
    error: 'שמירת הנתונים נכשלה. נסו שוב.',
    loadError: 'טעינת הנתונים נכשלה. מוצגות ברירות המחדל.',
  },
  en: {
    title: 'Company Numbers',
    description: 'Edit your company numbers once. They are shown automatically across the whole website.',
    valueLabel: 'Value',
    labelHe: 'Hebrew label',
    labelEn: 'English label',
    save: 'Save',
    reset: 'Restore defaults',
    saving: 'Saving…',
    saved: 'Numbers saved.',
    error: 'Could not save. Please try again.',
    loadError: 'Could not load numbers. Defaults are shown.',
  },
};

// Fixed cards + per-language example values. The admin never sees hero/about
// sections, suffixes, sort order or active toggles — only these three numbers.
const CARDS: Array<{ key: keyof CompanyNumbers; he: string; en: string; example: string }> = [
  { key: 'completedProjects', he: 'פרויקטים שהושלמו', en: 'Completed projects', example: '250+' },
  { key: 'yearsExperience', he: 'שנות ניסיון', en: 'Years of experience', example: '10+' },
  { key: 'warrantyYears', he: 'שנות אחריות', en: 'Years warranty', example: '5' },
];

function CompanyNumberCard({
  title,
  example,
  copy,
  number,
  onChange,
}: {
  title: string;
  example: string;
  copy: AdminCopy;
  number: CompanyNumber;
  onChange: (next: CompanyNumber) => void;
}) {
  return (
    <section
      data-testid="company-number-card"
      className="space-y-4 rounded-xl border border-white/5 bg-brand-surface-alt p-5"
    >
      <h3 className="text-lg font-bold text-brand-gold">{title}</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block space-y-2">
          <span className="text-sm font-bold text-brand-silver">{copy.valueLabel}</span>
          <input
            value={number.value}
            onChange={(e) => onChange({ ...number, value: e.target.value })}
            className="w-full rounded bg-brand-navy px-3 py-2 text-white"
            placeholder={example}
            dir="ltr"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold text-brand-silver">{copy.labelHe}</span>
          <input
            value={number.labelHe}
            onChange={(e) => onChange({ ...number, labelHe: e.target.value })}
            className="w-full rounded bg-brand-navy px-3 py-2 text-white"
            dir="rtl"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold text-brand-silver">{copy.labelEn}</span>
          <input
            value={number.labelEn}
            onChange={(e) => onChange({ ...number, labelEn: e.target.value })}
            className="w-full rounded bg-brand-navy px-3 py-2 text-white"
            dir="ltr"
          />
        </label>
      </div>
    </section>
  );
}

export function AdminPublicStats() {
  const { language, dir } = useLanguage();
  // Admin UI is Hebrew/English only; Hebrew is the default direction.
  const copy = language === 'en' ? COPY.en : COPY.he;

  const [numbers, setNumbers] = useState<CompanyNumbers>(defaultCompanyNumbers);
  const [row, setRow] = useState<SiteContentDto | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    listAdminSiteContent()
      .then((rows) => {
        const existing = rows.find((item) => item.section === 'public_stats' && item.key === 'content');
        setRow(existing ?? null);
        setNumbers(extractCompanyNumbers(existing?.value));
      })
      .catch(() => setStatus(copy.loadError));
    // copy.loadError is stable per language; intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateNumber = (key: keyof CompanyNumbers, next: CompanyNumber) => {
    setNumbers((current) => ({ ...current, [key]: next }));
  };

  const save = async () => {
    setStatus(copy.saving);
    // Project the three canonical numbers onto the full stats JSON, preserving
    // value chips / hero-since / about-highlight from the existing row.
    const content = applyCompanyNumbers(row?.value, numbers);
    const value = content as unknown as JsonValue;
    try {
      const saved = row
        ? await updateSiteContent(row.id, { value, is_active: true })
        : await createSiteContent({ section: 'public_stats', key: 'content', value, content_type: 'json', is_active: true });
      setRow(saved);
      setStatus(copy.saved);
    } catch {
      setStatus(copy.error);
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      <AdminPageHeader
        title={copy.title}
        description={copy.description}
        action={
          <div className="flex gap-3">
            <button
              onClick={() => setNumbers(defaultCompanyNumbers)}
              className="inline-flex items-center gap-2 rounded bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" /> {copy.reset}
            </button>
            <button
              onClick={() => void save()}
              className="inline-flex items-center gap-2 rounded bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy hover:bg-[#e3c454]"
            >
              <Save className="h-4 w-4" /> {copy.save}
            </button>
          </div>
        }
      />

      {CARDS.map((card) => (
        <CompanyNumberCard
          key={card.key}
          title={language === 'en' ? card.en : card.he}
          example={card.example}
          copy={copy}
          number={numbers[card.key]}
          onChange={(next) => updateNumber(card.key, next)}
        />
      ))}

      {status && <p className="text-sm text-brand-silver">{status}</p>}
    </div>
  );
}

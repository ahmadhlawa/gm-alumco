import type { LocalizedText } from '@/types';

export interface PublicStat {
  id: string;
  value: string;
  label: LocalizedText;
  suffix?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface PublicStatsContent {
  heroStats: PublicStat[];
  aboutPreviewStats: PublicStat[];
  aboutPageStats: PublicStat[];
  valueChips: PublicStat[];
  aboutHighlight: PublicStat;
  heroSince: PublicStat;
}

const text = (ar: string, en: string, he: string): LocalizedText => ({ ar, en, he });

export const defaultPublicStats: PublicStatsContent = {
  heroStats: [
    { id: 'completed-projects', value: '250+', label: text('مشروع منجز', 'Completed projects', 'פרויקטים שהושלמו'), sort_order: 1, is_active: true },
    { id: 'years-experience', value: '10+', label: text('سنوات خبرة', 'Years of experience', 'שנות ניסיון'), sort_order: 2, is_active: true },
    { id: 'warranty-years', value: '5', label: text('سنوات ضمان', 'Years warranty', 'שנות אחריות'), sort_order: 3, is_active: true },
  ],
  aboutPreviewStats: [
    { id: 'about-completed', value: '250+', label: text('مشاريع مكتملة', 'Completed Projects', 'פרויקטים שהושלמו'), sort_order: 1, is_active: true },
    { id: 'about-experience', value: '10+', label: text('سنوات خبرة', 'Years of Experience', 'שנות ניסיון'), sort_order: 2, is_active: true },
    { id: 'about-team', value: '40+', label: text('فريق مختص', 'Expert Team', 'צוות מומחים'), sort_order: 3, is_active: true },
    { id: 'about-warranty', value: '100%', label: text('ضمان جودة', 'Quality Warranty', 'אחריות איכות'), sort_order: 4, is_active: true },
  ],
  aboutPageStats: [
    { id: 'about-years', value: '+15', label: text('سنوات من الخبرة', 'Years of experience', 'שנות נסיון'), sort_order: 1, is_active: true },
    { id: 'about-projects', value: '+350', label: text('مشروع منجز', 'Completed projects', 'פרויקטים שהושלמו'), sort_order: 2, is_active: true },
    { id: 'about-customers', value: '+200', label: text('عميل سعيد', 'Happy customers', 'לקוחות מרוצים'), sort_order: 3, is_active: true },
    { id: 'about-engineers', value: '+40', label: text('فريق هندسي متخصص', 'Specialized engineering team', 'צוות מהנדסים מומחים'), sort_order: 4, is_active: true },
  ],
  valueChips: [
    { id: 'premium-quality', value: '', label: text('جودة فائقة', 'Premium quality', 'איכות פרימיום'), sort_order: 1, is_active: true },
    { id: 'precise-engineering', value: '', label: text('هندسة دقيقة', 'Precise engineering', 'הנדסה מדויקת'), sort_order: 2, is_active: true },
    { id: 'durable-performance', value: '', label: text('أداء متين', 'Durable performance', 'ביצועים עמידים'), sort_order: 3, is_active: true },
    { id: 'modern-aesthetic', value: '', label: text('تصميم عصري', 'Modern aesthetic', 'אסתטיקה מודרנית'), sort_order: 4, is_active: true },
  ],
  aboutHighlight: { id: 'about-highlight-years', value: '15+', label: text('عاماً من الريادة في المملكة', 'Years of leadership', 'שנים של מצוינות בבנייה'), sort_order: 1, is_active: true },
  heroSince: { id: 'hero-since-year', value: '2014', label: text('تميّز هندسي منذ', 'Engineering excellence since', 'מצוינות הנדסית מאז'), sort_order: 1, is_active: true },
};

function isLocalizedText(value: unknown): value is LocalizedText {
  return typeof value === 'object' && value !== null
    && typeof (value as LocalizedText).ar === 'string'
    && typeof (value as LocalizedText).en === 'string'
    && typeof (value as LocalizedText).he === 'string';
}

function isStat(value: unknown): value is PublicStat {
  const stat = value as PublicStat;
  return typeof stat?.id === 'string' && typeof stat.value === 'string' && isLocalizedText(stat.label);
}

function normalizeStats(value: unknown, fallback: PublicStat[]): PublicStat[] {
  if (!Array.isArray(value)) return fallback;
  const stats = value.filter(isStat).filter((stat) => stat.is_active !== false);
  if (stats.length === 0) return fallback;
  return [...stats].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function normalizePublicStatsContent(value: unknown): PublicStatsContent {
  if (typeof value !== 'object' || value === null) return defaultPublicStats;
  const content = value as Partial<PublicStatsContent>;
  if ('heroStats' in content && !Array.isArray(content.heroStats)) return defaultPublicStats;

  return {
    heroStats: normalizeStats(content.heroStats, defaultPublicStats.heroStats),
    aboutPreviewStats: normalizeStats(content.aboutPreviewStats, defaultPublicStats.aboutPreviewStats),
    aboutPageStats: normalizeStats(content.aboutPageStats, defaultPublicStats.aboutPageStats),
    valueChips: normalizeStats(content.valueChips, defaultPublicStats.valueChips),
    aboutHighlight: isStat(content.aboutHighlight) && content.aboutHighlight.is_active !== false
      ? content.aboutHighlight
      : defaultPublicStats.aboutHighlight,
    heroSince: isStat(content.heroSince) && content.heroSince.is_active !== false
      ? content.heroSince
      : defaultPublicStats.heroSince,
  };
}

// ---------------------------------------------------------------------------
// Company Numbers — the simplified, customer-facing model.
//
// The admin only edits three canonical company numbers. Internally they are
// projected onto every public stat section (hero + about) so there is no
// duplicate editing, while the stored JSON keeps full backward compatibility:
// value chips, the hero "since" badge and the about image highlight are
// preserved untouched, and the legacy Arabic label is carried through as a
// fallback (never edited, never cleared).
// ---------------------------------------------------------------------------

export type CompanyNumberId = 'completed-projects' | 'years-experience' | 'warranty-years';

export interface CompanyNumber {
  id: CompanyNumberId;
  value: string;
  labelHe: string;
  labelEn: string;
  /** Legacy Arabic label, preserved internally as a fallback. Not edited in the admin UI. */
  labelAr: string;
}

export interface CompanyNumbers {
  completedProjects: CompanyNumber;
  yearsExperience: CompanyNumber;
  warrantyYears: CompanyNumber;
}

export const defaultCompanyNumbers: CompanyNumbers = {
  completedProjects: { id: 'completed-projects', value: '250+', labelHe: 'פרויקטים שהושלמו', labelEn: 'Completed projects', labelAr: 'مشروع منجز' },
  yearsExperience: { id: 'years-experience', value: '10+', labelHe: 'שנות ניסיון', labelEn: 'Years of experience', labelAr: 'سنوات خبرة' },
  warrantyYears: { id: 'warranty-years', value: '5', labelHe: 'שנות אחריות', labelEn: 'Years warranty', labelAr: 'سنوات ضمان' },
};

// Ordered so the canonical numbers always render in the same sequence everywhere.
export const COMPANY_NUMBER_ORDER: Array<keyof CompanyNumbers> = [
  'completedProjects',
  'yearsExperience',
  'warrantyYears',
];

function findStatById(content: PublicStatsContent, id: CompanyNumberId): PublicStat | undefined {
  return [...content.heroStats, ...content.aboutPreviewStats, ...content.aboutPageStats].find(
    (stat) => stat.id === id,
  );
}

// Reads the three canonical numbers out of any stored public_stats JSON,
// falling back to the defaults field-by-field so the admin form is always
// fully populated.
export function extractCompanyNumbers(value: unknown): CompanyNumbers {
  const content = normalizePublicStatsContent(value);
  const build = (id: CompanyNumberId, fallback: CompanyNumber): CompanyNumber => {
    const stat = findStatById(content, id);
    if (!stat) return { ...fallback };
    return {
      id,
      value: stat.value || fallback.value,
      labelHe: stat.label.he || fallback.labelHe,
      labelEn: stat.label.en || fallback.labelEn,
      labelAr: stat.label.ar || fallback.labelAr,
    };
  };
  return {
    completedProjects: build('completed-projects', defaultCompanyNumbers.completedProjects),
    yearsExperience: build('years-experience', defaultCompanyNumbers.yearsExperience),
    warrantyYears: build('warranty-years', defaultCompanyNumbers.warrantyYears),
  };
}

function toStat(number: CompanyNumber, order: number): PublicStat {
  return {
    id: number.id,
    value: number.value,
    suffix: '',
    sort_order: order,
    is_active: true,
    label: { ar: number.labelAr, he: number.labelHe, en: number.labelEn },
  };
}

// Projects the three canonical numbers onto a full PublicStatsContent. Every
// numeric section (hero + about preview + about page) is rebuilt from the same
// three values; non-numeric/decorative content (value chips, hero since badge,
// about image highlight) is preserved from the previous stored JSON.
export function applyCompanyNumbers(previous: unknown, numbers: CompanyNumbers): PublicStatsContent {
  const base = normalizePublicStatsContent(previous);
  const canonical = COMPANY_NUMBER_ORDER.map((key, index) => toStat(numbers[key], index + 1));
  return {
    ...base,
    heroStats: canonical.map((stat) => ({ ...stat, label: { ...stat.label } })),
    aboutPreviewStats: canonical.map((stat) => ({ ...stat, label: { ...stat.label } })),
    aboutPageStats: canonical.map((stat) => ({ ...stat, label: { ...stat.label } })),
  };
}

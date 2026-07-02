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

const text = (en: string, he: string): LocalizedText => ({ en, he });

// Company Numbers: the simplified, customer-facing model edited in the CMS.
export type CompanyNumberId = 'completed-projects' | 'years-experience' | 'warranty-years';

export interface CompanyNumber {
  id: CompanyNumberId;
  value: string;
  labelHe: string;
  labelEn: string;
}

export interface CompanyNumbers {
  completedProjects: CompanyNumber;
  yearsExperience: CompanyNumber;
  warrantyYears: CompanyNumber;
}

export const defaultCompanyNumbers: CompanyNumbers = {
  completedProjects: { id: 'completed-projects', value: '250+', labelHe: 'פרויקטים שהושלמו', labelEn: 'Completed projects' },
  yearsExperience: { id: 'years-experience', value: '10+', labelHe: 'שנות ניסיון', labelEn: 'Years of experience' },
  warrantyYears: { id: 'warranty-years', value: '5', labelHe: 'שנות אחריות', labelEn: 'Years warranty' },
};

// Ordered so the canonical numbers always render in the same sequence everywhere.
export const COMPANY_NUMBER_ORDER: Array<keyof CompanyNumbers> = [
  'completedProjects',
  'yearsExperience',
  'warrantyYears',
];

function toStat(number: CompanyNumber, order: number): PublicStat {
  return {
    id: number.id,
    value: number.value,
    suffix: '',
    sort_order: order,
    is_active: true,
    label: { he: number.labelHe, en: number.labelEn },
  };
}

function cloneStat(stat: PublicStat): PublicStat {
  return { ...stat, label: { ...stat.label } };
}

function companyStats(): PublicStat[] {
  return COMPANY_NUMBER_ORDER.map((key, index) => toStat(defaultCompanyNumbers[key], index + 1));
}

export const defaultPublicStats: PublicStatsContent = {
  heroStats: companyStats(),
  aboutPreviewStats: companyStats(),
  aboutPageStats: companyStats(),
  valueChips: [
    { id: 'premium-quality', value: '', label: text('Premium quality', 'איכות פרימיום'), sort_order: 1, is_active: true },
    { id: 'precise-engineering', value: '', label: text('Precise engineering', 'הנדסה מדויקת'), sort_order: 2, is_active: true },
    { id: 'durable-performance', value: '', label: text('Durable performance', 'ביצועים עמידים'), sort_order: 3, is_active: true },
    { id: 'modern-aesthetic', value: '', label: text('Modern aesthetic', 'אסתטיקה מודרנית'), sort_order: 4, is_active: true },
  ],
  aboutHighlight: toStat(defaultCompanyNumbers.yearsExperience, 1),
  heroSince: { id: 'hero-since-year', value: '2014', label: text('Engineering excellence since', 'מצוינות הנדסית מאז'), sort_order: 1, is_active: true },
};

function isLocalizedText(value: unknown): value is LocalizedText {
  return typeof value === 'object' && value !== null
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

function findStatById(content: PublicStatsContent, id: CompanyNumberId): PublicStat | undefined {
  return [...content.heroStats, ...content.aboutPreviewStats, ...content.aboutPageStats].find(
    (stat) => stat.id === id,
  );
}

function numbersFromContent(content: PublicStatsContent): CompanyNumbers {
  const build = (id: CompanyNumberId, fallback: CompanyNumber): CompanyNumber => {
    const stat = findStatById(content, id);
    if (!stat) return { ...fallback };
    return {
      id,
      value: stat.value || fallback.value,
      labelHe: stat.label.he || fallback.labelHe,
      labelEn: stat.label.en || fallback.labelEn,
    };
  };
  return {
    completedProjects: build('completed-projects', defaultCompanyNumbers.completedProjects),
    yearsExperience: build('years-experience', defaultCompanyNumbers.yearsExperience),
    warrantyYears: build('warranty-years', defaultCompanyNumbers.warrantyYears),
  };
}

function projectCompanyNumbers(content: PublicStatsContent): PublicStatsContent {
  const numbers = numbersFromContent(content);
  const canonical = COMPANY_NUMBER_ORDER.map((key, index) => toStat(numbers[key], index + 1));
  const years = toStat(numbers.yearsExperience, 1);
  return {
    ...content,
    heroStats: canonical.map(cloneStat),
    aboutPreviewStats: canonical.map(cloneStat),
    aboutPageStats: canonical.map(cloneStat),
    aboutHighlight: cloneStat(years),
  };
}

export function normalizePublicStatsContent(value: unknown): PublicStatsContent {
  if (typeof value !== 'object' || value === null) return projectCompanyNumbers(defaultPublicStats);
  const content = value as Partial<PublicStatsContent>;
  if ('heroStats' in content && !Array.isArray(content.heroStats)) return projectCompanyNumbers(defaultPublicStats);

  return projectCompanyNumbers({
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
  });
}

// Reads the three canonical numbers out of any stored public_stats JSON,
// falling back to the defaults field-by-field so the admin form is always
// fully populated.
export function extractCompanyNumbers(value: unknown): CompanyNumbers {
  return numbersFromContent(normalizePublicStatsContent(value));
}

// Projects the three canonical numbers onto a full PublicStatsContent. Every
// numeric section (hero + about preview + about page) is rebuilt from the same
// three values; non-numeric/decorative content (value chips and hero since
// badge) is preserved from the previous stored JSON.
export function applyCompanyNumbers(previous: unknown, numbers: CompanyNumbers): PublicStatsContent {
  const base = normalizePublicStatsContent(previous);
  const canonical = COMPANY_NUMBER_ORDER.map((key, index) => toStat(numbers[key], index + 1));
  const years = toStat(numbers.yearsExperience, 1);
  return {
    ...base,
    heroStats: canonical.map(cloneStat),
    aboutPreviewStats: canonical.map(cloneStat),
    aboutPageStats: canonical.map(cloneStat),
    aboutHighlight: cloneStat(years),
  };
}

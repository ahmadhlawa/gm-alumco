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

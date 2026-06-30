import type { Language } from '@/i18n';

// Backend category enum values (stored/admin values are unchanged).
export type ProjectCategoryKey = 'LOCAL' | 'INTERNATIONAL' | 'FEATURED';
// Filter keys add a stable "ALL" sentinel used by the public Projects filter.
export type ProjectFilterKey = 'ALL' | ProjectCategoryKey;

// Public, production-language labels only (Hebrew + English). Arabic is not a
// production UI language, so it is intentionally not represented here.
const CATEGORY_LABELS: Record<ProjectCategoryKey, Record<Language, string>> = {
  LOCAL: { he: 'מקומי', en: 'Local' },
  INTERNATIONAL: { he: 'בינלאומי', en: 'International' },
  FEATURED: { he: 'מובחר', en: 'Featured' },
};

const ALL_LABEL: Record<Language, string> = { he: 'הכל', en: 'All' };

export const PROJECT_FILTER_KEYS: ProjectCategoryKey[] = ['LOCAL', 'INTERNATIONAL', 'FEATURED'];

/**
 * Localized label for a project category. Unknown values (should not happen)
 * fall back to the raw value so nothing renders blank.
 */
export function projectCategoryLabel(category: string, language: Language): string {
  const entry = CATEGORY_LABELS[category as ProjectCategoryKey];
  return entry ? entry[language] : category;
}

/** Localized label for a filter chip, including the "ALL" sentinel. */
export function projectFilterLabel(key: ProjectFilterKey, language: Language): string {
  return key === 'ALL' ? ALL_LABEL[language] : projectCategoryLabel(key, language);
}

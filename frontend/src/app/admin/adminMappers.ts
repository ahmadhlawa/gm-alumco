import type { ContactStatus, PartnerDto, ProjectDto, QuoteStatus } from '@/api/types';
import type { Language } from '@/i18n';

// Admin UI labels — Hebrew + English only. Arabic is never shown in the admin UI.
export interface BilingualLabel {
  he: string;
  en: string;
}

export const PROJECT_CATEGORY_LABELS: Record<ProjectDto['category'], BilingualLabel> = {
  LOCAL: { he: 'פרויקטים בארץ', en: 'Local projects' },
  INTERNATIONAL: { he: 'פרויקטים בחו״ל', en: 'International projects' },
  FEATURED: { he: 'פרויקטים נבחרים', en: 'Featured projects' },
};

export const CONTACT_STATUS_LABELS: Record<ContactStatus, BilingualLabel> = {
  NEW: { he: 'חדש', en: 'New' },
  READ: { he: 'נקרא', en: 'Read' },
  ARCHIVED: { he: 'בארכיון', en: 'Archived' },
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, BilingualLabel> = {
  NEW: { he: 'חדש', en: 'New' },
  IN_PROGRESS: { he: 'בטיפול', en: 'In progress' },
  DONE: { he: 'הושלם', en: 'Done' },
  ARCHIVED: { he: 'בארכיון', en: 'Archived' },
};

/** Pick a bilingual admin label for the active language (Hebrew is the default). */
export function localizeLabel(label: BilingualLabel, language: Language): string {
  return language === 'en' ? label.en : label.he;
}

/**
 * Pick localized free-text content for admin display, Hebrew-first.
 * Arabic columns are intentionally ignored so they never surface in the admin UI.
 */
export function pickAdminText(
  language: Language,
  he: string | null | undefined,
  en: string | null | undefined,
): string {
  const primary = language === 'en' ? en : he;
  const secondary = language === 'en' ? he : en;
  return (primary || secondary || '').trim();
}

export interface PartnerFormValues { name: string; logo_url: string; website_url: string; is_active: boolean; sort_order: number }

export function partnerPayload(values: PartnerFormValues): Partial<PartnerDto> {
  const name = values.name.trim();
  return { name_en: name, name_he: name, logo_url: values.logo_url.trim(), website_url: values.website_url.trim() || null, is_active: values.is_active, sort_order: values.sort_order };
}

import type { CmsLocale, LocalizedText } from '@/types';

export function localize(value: string): LocalizedText {
  return { ar: value, en: value, he: value };
}

export function translated(value: LocalizedText, locale: CmsLocale): string {
  return value[locale] || value.en || value.he || value.ar;
}

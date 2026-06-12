import { ar } from './locales/ar';
import { en } from './locales/en';
import { he } from './locales/he';

export const locales = {
  ar,
  en,
  he
};

export type LocaleKey = keyof typeof locales;
export const defaultLocale: LocaleKey = 'ar';

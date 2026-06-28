import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Language = 'he' | 'en';
export const PUBLIC_LANGUAGE_STORAGE_KEY = 'tas_public_language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  t: (ar: string, he?: string, en?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function resolveInitialLanguage(value: string | null | undefined): Language {
  return value === 'en' || value === 'he' ? value : 'he';
}

export function getLanguageDirection(language: Language): 'rtl' | 'ltr' {
  return language === 'en' ? 'ltr' : 'rtl';
}

export function getNextPublicLanguage(language: Language): Language {
  return language === 'he' ? 'en' : 'he';
}

export function translatePublic(language: Language, ar: string, he?: string, en?: string): string {
  if (language === 'he') return he || en || ar;
  return en || he || ar;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'he';
    return resolveInitialLanguage(window.localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY));
  });

  const dir = getLanguageDirection(language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    window.localStorage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, language);
  }, [language, dir]);

  const t = (ar: string, he?: string, en?: string) => {
    return translatePublic(language, ar, he, en);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

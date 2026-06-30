import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Language = 'he' | 'en';
export const PUBLIC_LANGUAGE_STORAGE_KEY = 'tas_public_language';
// The admin/login UI keeps its own language, independent of the public site.
export const ADMIN_LANGUAGE_STORAGE_KEY = 'tas_admin_language';

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

interface LanguageProviderProps {
  children: ReactNode;
  /** localStorage key the language is persisted under. */
  storageKey?: string;
  /** Whether this provider drives `document.documentElement` lang/dir. Only the
   *  public (root) provider should — the admin provider keeps its own dir on its
   *  own containers so it never fights the public site over the document. */
  applyToDocument?: boolean;
}

export function LanguageProvider({
  children,
  storageKey = PUBLIC_LANGUAGE_STORAGE_KEY,
  applyToDocument = true,
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'he';
    return resolveInitialLanguage(window.localStorage.getItem(storageKey));
  });

  const dir = getLanguageDirection(language);

  useEffect(() => {
    if (applyToDocument) {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
    window.localStorage.setItem(storageKey, language);
  }, [language, dir, storageKey, applyToDocument]);

  const t = (ar: string, he?: string, en?: string) => {
    return translatePublic(language, ar, he, en);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Language provider for the admin/login area. It persists to its own storage
 * key so switching language in the admin never changes the public site (and
 * vice-versa), and it does not touch `document.documentElement` — admin screens
 * set `dir` on their own containers.
 */
export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider storageKey={ADMIN_LANGUAGE_STORAGE_KEY} applyToDocument={false}>
      {children}
    </LanguageProvider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

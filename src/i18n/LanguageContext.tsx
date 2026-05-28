import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translation, translations, rtlLanguages } from './translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('app-language') as Language | null;
    return stored && translations[stored] ? stored : 'de';
  });

  const isRTL = rtlLanguages.includes(language);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  // Merge over English so any missing key in the selected language falls back gracefully
  const t: Translation = { ...translations.en, ...translations[language] };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function initLanguageFromProfile(appLanguage: string) {
  const lang = appLanguage as Language;
  if (translations[lang]) {
    localStorage.setItem('app-language', lang);
  }
}

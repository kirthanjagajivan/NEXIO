import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language, languageFlags } from '../i18n/translations';

const LANGUAGES: Language[] = ['en', 'de', 'tr', 'ar', 'ru'];

export function LanguageSelector() {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label={t.selectLanguage}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={16} className="text-gray-500 shrink-0" />
        <span className="hidden sm:inline">{languageFlags[language]}</span>
        <span className="hidden sm:inline">{t.languageNames[language]}</span>
        <span className="sm:hidden">{languageFlags[language]}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 ${
            isRTL ? 'left-0' : 'right-0'
          }`}
          role="listbox"
          aria-label={t.selectLanguage}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              role="option"
              aria-selected={language === lang}
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                language === lang
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-base leading-none">{languageFlags[lang]}</span>
              <span className="flex-1 text-start">{t.languageNames[lang]}</span>
              {language === lang && <Check size={14} className="text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

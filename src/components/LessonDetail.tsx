import { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';

const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
];

const RTL_LANGUAGES: Language[] = ['ar'];

interface LessonDetailProps {
  topicTitle: string;
  chapterTitle: string;
  getContent: (lang: Language) => string;
  availableLanguages: Language[];
  onBack: () => void;
  onStartTest: () => void;
}

function parseContentIntoSections(raw: string): { heading: string; paragraphs: string[] }[] {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const sections: { heading: string; paragraphs: string[] }[] = [];
  let current: { heading: string; paragraphs: string[] } | null = null;
  let sentenceBuffer: string[] = [];

  const flushBuffer = () => {
    if (!sentenceBuffer.length) return;
    const text = sentenceBuffer.join(' ').trim();
    if (!text) return;
    const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
    const chunks: string[] = [];
    let chunk: string[] = [];
    for (const s of sentences) {
      chunk.push(s.trim());
      if (chunk.length >= 3) {
        chunks.push(chunk.join(' '));
        chunk = [];
      }
    }
    if (chunk.length) chunks.push(chunk.join(' '));
    if (current) {
      current.paragraphs.push(...chunks);
    } else {
      if (!sections.length) sections.push({ heading: '', paragraphs: [] });
      sections[sections.length - 1].paragraphs.push(...chunks);
    }
    sentenceBuffer = [];
  };

  for (const line of lines) {
    const isHeading =
      (line.startsWith('#') && line.length < 80) ||
      (line.length < 60 && /^[A-Z\u00C0-\u024F\u0400-\u04FF]/.test(line) && !line.endsWith('.') && !line.endsWith(','));

    if (isHeading && line.length > 3) {
      flushBuffer();
      if (current) sections.push(current);
      current = { heading: line.replace(/^#+\s*/, ''), paragraphs: [] };
    } else {
      sentenceBuffer.push(line);
    }
  }
  flushBuffer();
  if (current) sections.push(current);

  if (!sections.length && raw.trim()) {
    const sentences = raw.match(/[^.!?]+[.!?]+/g) ?? [raw];
    const chunks: string[] = [];
    let chunk: string[] = [];
    for (const s of sentences) {
      chunk.push(s.trim());
      if (chunk.length >= 3) { chunks.push(chunk.join(' ')); chunk = []; }
    }
    if (chunk.length) chunks.push(chunk.join(' '));
    sections.push({ heading: '', paragraphs: chunks });
  }

  return sections;
}

export function LessonDetail({
  topicTitle,
  chapterTitle,
  getContent,
  availableLanguages,
  onBack,
  onStartTest,
}: LessonDetailProps) {
  const { t, isRTL: appRTL } = useLanguage();
  const [contentLang, setContentLang] = useState<Language>('en');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const content = getContent(contentLang);
  const isContentRTL = RTL_LANGUAGES.includes(contentLang);
  const selectedLang = LANGUAGES.find((l) => l.code === contentLang)!;
  const sections = content ? parseContentIntoSections(content) : [];

  return (
    <div className={`space-y-4 sm:space-y-6 ${appRTL ? 'text-right' : ''}`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm ${
          appRTL ? 'flex-row-reverse' : ''
        }`}
      >
        <ArrowLeft size={16} />
        <span>{t.back}</span>
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 sm:px-8 py-7 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1.5">{chapterTitle}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">{topicTitle}</h1>
            </div>

            <div className="relative shrink-0 mt-1">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <span className="hidden sm:inline">{selectedLang.nativeLabel}</span>
                <span className="text-xs uppercase font-mono opacity-80">{contentLang}</span>
                <ChevronDown
                  size={13}
                  className={`opacity-70 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-48 py-1">
                    {LANGUAGES.map((lang) => {
                      const isActive = contentLang === lang.code;
                      const isAvailable = availableLanguages.includes(lang.code);
                      return (
                        <button
                          key={lang.code}
                          onClick={() => { setContentLang(lang.code); setDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-start text-sm transition-colors ${
                            isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{lang.nativeLabel}</span>
                          <div className="flex items-center gap-1.5">
                            {isAvailable && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                            <span className="text-xs text-gray-400 uppercase font-mono">{lang.code}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-8">
          {content ? (
            <div dir={isContentRTL ? 'rtl' : 'ltr'}>
              {sections.map((section, si) => (
                <div key={si} className={si > 0 ? 'mt-8' : ''}>
                  {section.heading ? (
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                      {section.heading}
                    </h2>
                  ) : null}
                  <div className="space-y-4">
                    {section.paragraphs.map((para, pi) => (
                      <p
                        key={pi}
                        className="text-gray-700 text-[15px] sm:text-base leading-[1.75] tracking-[0.01em]"
                        style={{ textAlign: isContentRTL ? 'right' : 'left' }}
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400 font-medium">
                {t.no_content_in_lang} {selectedLang.label}.
              </p>
              {availableLanguages.length > 0 && !availableLanguages.includes(contentLang) && (
                <p className="text-xs text-gray-400 mt-2">
                  {t.available_in}{' '}
                  {availableLanguages
                    .map((l) => LANGUAGES.find((x) => x.code === l)?.label)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={onStartTest}
              className="w-full px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-blue-700 active:scale-[0.99] transition-all shadow-sm"
            >
              {t.startTest}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

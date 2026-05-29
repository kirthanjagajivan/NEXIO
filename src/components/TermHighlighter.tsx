import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, BookOpen, Globe, Quote, HelpCircle } from 'lucide-react';
import type { Language } from '../i18n/translations';
import {
  lookupTerm,
  getDefinition,
  getTranslation,
  normalizeTerm,
} from '../data/termVocabulary';
import type { GermanProficiency, AppLanguage } from '../data/termVocabulary';

// ─── Stop-word sets ───────────────────────────────────────────────────────────

const STOP_EN = new Set([
  'the','and','that','this','with','from','they','have','been','also','into',
  'their','which','between','other','each','some','such','where','when','what',
  'both','more','than','for','are','not','can','its','will','has','was','were',
  'does','did','would','could','should','these','those','then','about','very',
  'just','only','over','under','after','before','while','since','until','above',
  'below','there','here','your','our','him','her','his','she','they',
  'but','yet','nor','either','neither','whether','because','although','unless',
  'however','therefore','thus','hence','still','again','already','often','always',
  'never','usually','sometimes','perhaps','maybe','quite','rather','almost',
]);

const STOP_DE = new Set([
  'der','die','das','und','oder','aber','mit','von','zu','für','bei','aus',
  'nach','über','unter','durch','an','auf','in','ist','sind','war','waren',
  'hat','haben','wird','werden','kann','können','muss','müssen','ein','eine',
  'einen','dem','den','des','sich','auch','noch','als','wenn','dann','dieser',
  'diese','dieses','welche','welcher','dass','nicht','mehr','sehr','beim',
  'damit','dazu','wie','alle','dabei','sowohl','bereits','hierbei','darf',
  'daher','jedoch','trotzdem','obwohl','weil','falls','während','gegen',
  'ohne','zwischen','neben','hinter','vor','seit','bis','einer','einem',
]);

const STOP_TR = new Set([
  'bir','bu','şu','ve','ile','de','da','ki','mi','mı','mu','mü','için','gibi',
  'kadar','sonra','önce','üzere','olan','olarak','ise','ama','fakat','ancak',
  'lakin','hem','veya','ya','ne','her','çok','daha','en','hiç',
]);

const STOP_RU = new Set([
  'это','как','но','или','что','так','уже','для','все','еще','его','они',
  'она','оно','мы','вы','он','был','были','есть','нет','при','без','под',
  'над','между','через','после','перед','во','из','по','на','от','до',
  'да','же','ли','бы','не','ни','а',
]);

function getStopWords(lang: Language): Set<string> {
  if (lang === 'de') return STOP_DE;
  if (lang === 'tr') return STOP_TR;
  if (lang === 'ru') return STOP_RU;
  return STOP_EN;
}

// ─── Term detection ───────────────────────────────────────────────────────────

function detectTechnicalTerms(text: string, lang: Language): Set<string> {
  const stopWords = getStopWords(lang);
  const found = new Set<string>();
  const tokens = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/);

  tokens.forEach((rawToken) => {
    const token = rawToken.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (token.length < 5) return;
    if (stopWords.has(token.toLowerCase())) return;

    const hasMixedCase = /[A-Z\u00C0-\u024F\u0400-\u04FF]/.test(token.slice(1));
    const hasDigit = /\d/.test(token);
    const hasHyphen = token.includes('-');
    const isLong = token.length >= 8;
    const isNoun = lang === 'de' && /^[A-ZÄÖÜ]/.test(token);
    const isFirstWordOfSentence = sentences.some((s) => s.trim().startsWith(rawToken));

    const score =
      (hasMixedCase && !isFirstWordOfSentence ? 2 : 0) +
      (hasDigit ? 2 : 0) +
      (hasHyphen ? 1 : 0) +
      (isLong ? 1 : 0) +
      (isNoun && !isFirstWordOfSentence ? 2 : 0);

    if (score >= 2) found.add(token.toLowerCase());
  });

  const acronymRe = /\b[A-Z]{2,}\b/g;
  let m: RegExpExecArray | null;
  while ((m = acronymRe.exec(text)) !== null) {
    if (m[0].length >= 2 && !stopWords.has(m[0].toLowerCase())) {
      found.add(m[0].toLowerCase());
    }
  }

  return found;
}

// ─── Paragraph segmenter ─────────────────────────────────────────────────────

function segmentParagraph(
  text: string,
  terms: Set<string>,
): Array<{ type: 'plain' | 'term'; text: string }> {
  if (terms.size === 0) return [{ type: 'plain', text }];

  const escapedTerms = [...terms]
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'giu');
  const segments: Array<{ type: 'plain' | 'term'; text: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'plain', text: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'term', text: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'plain', text: text.slice(lastIndex) });
  }

  return segments;
}

// ─── Explanation engine ───────────────────────────────────────────────────────

const CEFR_LABEL: Record<GermanProficiency, string> = {
  beginner:     'A1/A2',
  intermediate: 'B1/B2',
  advanced:     'C1',
  native:       'C2',
};

interface ExplanationResult {
  // Explanation in the lesson language
  lessonLangText: string;
  // Explanation in the student's native language (null = use lessonLangText)
  nativeLangText: string | null;
  // Example sentence (from vocabulary or extracted from lesson content)
  exampleSentence: string | null;
  cefrLabel: string;
  // True when the explanation comes from the curated vocabulary
  fromVocabulary: boolean;
}

// Find a sentence in the lesson content that contains the term — used as fallback example
function findExampleFromLesson(lessonContent: string, term: string): string | null {
  const lower = term.toLowerCase();
  const sentences = lessonContent
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.toLowerCase().includes(lower));

  if (sentences.length === 0) return null;
  // Prefer a sentence that isn't the same as the definition (pick the longer one if there are two)
  return sentences.sort((a, b) => b.length - a.length)[0] ?? null;
}

// Build the explanation for a clicked term
function buildExplanation(
  clickedTerm: string,
  lessonContent: string,
  lessonLang: Language,
  studentLang: Language,
  proficiency: GermanProficiency,
): ExplanationResult {
  const cefrLabel = CEFR_LABEL[proficiency];
  const entry = lookupTerm(clickedTerm);

  if (entry) {
    // ── Vocabulary hit ────────────────────────────────────────────────────
    const lessonLangText = getDefinition(entry, proficiency);

    // Native language: use vocabulary translation if available and langs differ
    let nativeLangText: string | null = null;
    if (lessonLang !== studentLang) {
      const t = getTranslation(entry, studentLang as AppLanguage, proficiency);
      nativeLangText = t?.definition ?? null;
    }

    // Example: prefer vocabulary example, fall back to lesson sentence
    const vocabExample = entry.example;
    const lessonExample = findExampleFromLesson(lessonContent, clickedTerm);
    const exampleSentence = lessonExample ?? vocabExample;

    return { lessonLangText, nativeLangText, exampleSentence, cefrLabel, fromVocabulary: true };
  }

  // ── Lesson-content fallback ───────────────────────────────────────────────
  // Extract contextual sentences from the lesson when the term isn't in the dictionary.
  const lower = clickedTerm.toLowerCase();
  const allSentences = lessonContent
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.toLowerCase().includes(lower));

  if (allSentences.length === 0) {
    return {
      lessonLangText: `"${clickedTerm}" is a key term in this lesson. Refer to the surrounding text for context.`,
      nativeLangText: null,
      exampleSentence: null,
      cefrLabel,
      fromVocabulary: false,
    };
  }

  const sorted = [...allSentences].sort((a, b) => a.length - b.length);
  const primary = sorted[0];
  const example = allSentences.find((s) => s !== primary) ?? null;

  let lessonLangText: string;
  const words = (s: string, n: number) => s.split(/\s+/).slice(0, n).join(' ') + (s.split(/\s+/).length > n ? '…' : '');

  switch (proficiency) {
    case 'beginner':
      lessonLangText = words(primary, 20);
      break;
    case 'intermediate':
      lessonLangText = allSentences.length >= 2
        ? words(primary, 35) + ' ' + words(sorted[1], 30)
        : words(primary, 40);
      break;
    default:
      lessonLangText = allSentences.slice(0, 3).join(' ');
  }

  return {
    lessonLangText,
    nativeLangText: null,
    exampleSentence: example,
    cefrLabel,
    fromVocabulary: false,
  };
}

// ─── Popup ────────────────────────────────────────────────────────────────────

interface TermPopupProps {
  term: string;
  anchor: { x: number; y: number; width: number };
  lessonContent: string;
  lessonLang: Language;
  studentLang: Language;
  germanProficiency: GermanProficiency;
  onClose: () => void;
}

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  tr: 'Türkçe',
  ar: 'العربية',
  ru: 'Русский',
};

const CEFR_BADGE_COLORS: Record<GermanProficiency, string> = {
  beginner:     'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-sky-100 text-sky-700 border-sky-200',
  advanced:     'bg-amber-100 text-amber-700 border-amber-200',
  native:       'bg-gray-100 text-gray-700 border-gray-200',
};

function highlightTerm(
  sentence: string,
  term: string,
): { before: string; match: string; after: string } | null {
  const idx = sentence.toLowerCase().indexOf(normalizeTerm(term).replace(/-/g, ' ').toLowerCase());
  const directIdx = sentence.toLowerCase().indexOf(term.toLowerCase());
  const useIdx = directIdx >= 0 ? directIdx : idx;
  const useLen = directIdx >= 0 ? term.length : normalizeTerm(term).replace(/-/g, ' ').length;
  if (useIdx < 0) return null;
  return {
    before: sentence.slice(0, useIdx),
    match: sentence.slice(useIdx, useIdx + useLen),
    after: sentence.slice(useIdx + useLen),
  };
}

function TermPopup({
  term, anchor, lessonContent, lessonLang, studentLang, germanProficiency, onClose,
}: TermPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  const explanation = buildExplanation(term, lessonContent, lessonLang, studentLang, germanProficiency);
  const highlighted = explanation.exampleSentence
    ? highlightTerm(explanation.exampleSentence, term)
    : null;

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  const popupWidth = 360;
  let left = anchor.x + anchor.width / 2 - popupWidth / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - popupWidth - 8));
  const top = anchor.y - 8;

  const caretLeft = Math.min(
    Math.max(anchor.x + anchor.width / 2 - left - 6, 12),
    popupWidth - 24,
  );

  return (
    <div
      ref={popupRef}
      style={{ position: 'fixed', left, top, width: popupWidth, zIndex: 9999, transform: 'translateY(-100%)' }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={14} className="text-blue-200 shrink-0" />
            <span className="text-white font-bold text-sm truncate max-w-[240px]">{term}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/20 p-0.5 shrink-0 ml-2"
          >
            <X size={15} />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${CEFR_BADGE_COLORS[germanProficiency]}`}>
            {explanation.cefrLabel}
          </span>
          {!explanation.fromVocabulary && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-200">
              <HelpCircle size={10} />
              from lesson
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Lesson-language definition */}
        <div className="bg-blue-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen size={12} className="text-blue-500 shrink-0" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              {LANG_LABELS[lessonLang]}
            </span>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{explanation.lessonLangText}</p>
        </div>

        {/* Native language definition — shown only when different and available */}
        {lessonLang !== studentLang && explanation.nativeLangText && (
          <div className="bg-emerald-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Globe size={12} className="text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                {LANG_LABELS[studentLang]}
              </span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{explanation.nativeLangText}</p>
          </div>
        )}

        {/* Example sentence */}
        {explanation.exampleSentence && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Quote size={12} className="text-gray-400 shrink-0" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Example
              </span>
            </div>
            {highlighted ? (
              <p className="text-sm text-gray-700 leading-relaxed">
                {highlighted.before}
                <mark className="bg-yellow-200 text-yellow-900 px-0.5 rounded font-semibold">
                  {highlighted.match}
                </mark>
                {highlighted.after}
              </p>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed italic">
                {explanation.exampleSentence}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Caret */}
      <div
        style={{
          position: 'absolute',
          bottom: -6,
          left: caretLeft,
          width: 12,
          height: 12,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          borderLeft: 'none',
          transform: 'rotate(45deg)',
          zIndex: 1,
        }}
      />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface TermHighlighterProps {
  text: string;
  lessonContent: string;
  lessonLang: Language;
  studentLang: Language;
  germanProficiency: GermanProficiency;
  rtl?: boolean;
  className?: string;
}

interface ActiveTerm {
  term: string;
  anchor: { x: number; y: number; width: number };
}

export function TermHighlighter({
  text,
  lessonContent,
  lessonLang,
  studentLang,
  germanProficiency,
  rtl = false,
  className = '',
}: TermHighlighterProps) {
  const [activeTerm, setActiveTerm] = useState<ActiveTerm | null>(null);
  const terms = detectTechnicalTerms(text, lessonLang);
  const segments = segmentParagraph(text, terms);

  const handleClick = useCallback((term: string, e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setActiveTerm({
      term,
      anchor: { x: rect.left, y: rect.top, width: rect.width },
    });
  }, []);

  const handleClose = useCallback(() => setActiveTerm(null), []);

  return (
    <>
      <p
        className={`text-gray-700 text-[15px] sm:text-base leading-[1.75] tracking-[0.01em] ${className}`}
        style={{ textAlign: rtl ? 'right' : 'left' }}
        dir={rtl ? 'rtl' : 'ltr'}
      >
        {segments.map((seg, i) =>
          seg.type === 'term' ? (
            <span
              key={i}
              onClick={(e) => handleClick(seg.text, e)}
              title="Click for explanation"
              className="relative cursor-pointer font-medium text-blue-700 underline decoration-dotted decoration-blue-400 underline-offset-2 hover:text-blue-800 hover:bg-blue-50 rounded px-0.5 transition-colors"
            >
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </p>

      {activeTerm && (
        <TermPopup
          term={activeTerm.term}
          anchor={activeTerm.anchor}
          lessonContent={lessonContent}
          lessonLang={lessonLang}
          studentLang={studentLang}
          germanProficiency={germanProficiency}
          onClose={handleClose}
        />
      )}
    </>
  );
}

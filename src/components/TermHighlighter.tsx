import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Loader2, BookOpen, Globe } from 'lucide-react';
import type { Language } from '../i18n/translations';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ─── Stop-word sets ───────────────────────────────────────────────────────────

const STOP_EN = new Set([
  'the','and','that','this','with','from','they','have','been','also','into',
  'their','which','between','other','each','some','such','where','when','what',
  'both','more','than','for','are','not','can','its','will','has','was','were',
  'does','did','would','could','should','these','those','then','about','very',
  'just','only','over','under','after','before','while','since','until','above',
  'below','there','here','your','our','its','him','her','his','she','they',
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
  'damit','daher','jedoch','trotzdem','obwohl','weil','wenn','falls','während',
  'durch','gegen','ohne','zwischen','neben','hinter','vor','nach','seit','bis',
]);

const STOP_TR = new Set([
  'bir','bu','şu','ve','ile','de','da','ki','mi','mı','mu','mü','için','gibi',
  'kadar','sonra','önce','üzere','olan','olan','olan','olarak','ise','ama',
  'fakat','ancak','lakin','hem','veya','ya','ne','her','çok','daha','en','hiç',
]);

const STOP_RU = new Set([
  'это','как','но','или','что','так','уже','для','все','еще','его','они',
  'она','оно','мы','вы','он','был','были','есть','нет','при','без','под',
  'над','между','через','после','перед','во','из','по','на','от','до',
  'да','нет','же','ли','бы','не','ни','ни','а',
]);

function getStopWords(lang: Language): Set<string> {
  if (lang === 'de') return STOP_DE;
  if (lang === 'tr') return STOP_TR;
  if (lang === 'ru') return STOP_RU;
  return STOP_EN; // en + ar fallback
}

// ─── Term detection ───────────────────────────────────────────────────────────

// Detect technical terms in a paragraph.
// Strategy: find words/phrases that are likely domain-specific:
//   • length > 4 characters
//   • not a stop word
//   • either capitalized mid-sentence, or contains a hyphen/digit, or is a compound noun (DE)
// Returns a Set of lowercased terms so duplicates are collapsed.
function detectTechnicalTerms(text: string, lang: Language): Set<string> {
  const stopWords = getStopWords(lang);
  const found = new Set<string>();

  // Split on whitespace, keep punctuation attached for context then strip it
  const tokens = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/);

  tokens.forEach((rawToken, idx) => {
    // Strip leading/trailing punctuation except hyphens inside words
    const token = rawToken.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (token.length < 5) return;
    if (stopWords.has(token.toLowerCase())) return;

    // Heuristics for "technical-ness":
    const hasMixedCase = /[A-Z\u00C0-\u024F\u0400-\u04FF]/.test(token.slice(1)); // camelCase / MidSentence caps
    const hasDigit = /\d/.test(token);
    const hasHyphen = token.includes('-');
    const isLong = token.length >= 8; // longer words are often domain terms
    const isNoun = lang === 'de' && /^[A-ZÄÖÜ]/.test(token); // German nouns capitalized

    // First word of sentence is always capitalized — exclude by checking position
    const isFirstWordOfSentence = sentences.some((s) => s.trim().startsWith(rawToken));

    const score =
      (hasMixedCase && !isFirstWordOfSentence ? 2 : 0) +
      (hasDigit ? 2 : 0) +
      (hasHyphen ? 1 : 0) +
      (isLong ? 1 : 0) +
      (isNoun && !isFirstWordOfSentence ? 2 : 0);

    if (score >= 2) {
      found.add(token.toLowerCase());
    }
  });

  // Also catch ALL-CAPS acronyms (e.g. HTTP, SQL, TCP)
  const acronymRe = /\b[A-Z]{2,}\b/g;
  let m: RegExpExecArray | null;
  while ((m = acronymRe.exec(text)) !== null) {
    if (m[0].length >= 2 && !stopWords.has(m[0].toLowerCase())) {
      found.add(m[0].toLowerCase());
    }
  }

  return found;
}

// ─── Paragraph renderer ───────────────────────────────────────────────────────

// Split a paragraph text into alternating plain/term segments.
function segmentParagraph(
  text: string,
  terms: Set<string>,
): Array<{ type: 'plain' | 'term'; text: string }> {
  if (terms.size === 0) return [{ type: 'plain', text }];

  // Build a regex that matches any of the detected terms (case-insensitive, unicode word boundaries via lookahead/behind)
  const escapedTerms = [...terms]
    .sort((a, b) => b.length - a.length) // longer first so "machine learning" beats "machine"
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

// ─── Popup component ──────────────────────────────────────────────────────────

type GermanProficiency = 'beginner' | 'intermediate' | 'advanced' | 'native';

interface ExplanationData {
  lesson_lang_explanation: string;
  student_lang_explanation: string;
  cefr_level?: string;
}

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

const CEFR_BADGE_COLORS: Record<string, string> = {
  beginner:     'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  advanced:     'bg-amber-100 text-amber-700 border-amber-200',
  native:       'bg-gray-100 text-gray-700 border-gray-200',
};

function TermPopup({ term, anchor, lessonContent, lessonLang, studentLang, germanProficiency, onClose }: TermPopupProps) {
  const [data, setData] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const isSameLang = lessonLang === studentLang;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    fetch(`${SUPABASE_URL}/functions/v1/explain-term`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ term, lessonContent, lessonLang, studentLang, germanProficiency }),
    })
      .then((r) => r.json())
      .then((d: ExplanationData) => {
        if (d.lesson_lang_explanation) setData(d);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [term]);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  // Position: centre above the anchor word, clamp to viewport
  const popupWidth = 320;
  let left = anchor.x + anchor.width / 2 - popupWidth / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - popupWidth - 8));
  const top = anchor.y - 8; // will be transformed upward via CSS

  return (
    <div
      ref={popupRef}
      style={{ position: 'fixed', left, top, width: popupWidth, zIndex: 9999, transform: 'translateY(-100%)' }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={14} className="text-blue-100 shrink-0" />
            <span className="text-white font-bold text-sm truncate max-w-[200px]">{term}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/20 p-0.5 shrink-0 ml-2"
          >
            <X size={15} />
          </button>
        </div>
        {/* CEFR level badge */}
        <div className="mt-2">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${CEFR_BADGE_COLORS[germanProficiency]} bg-opacity-90`}>
            {data?.cefr_level ?? (
              germanProficiency === 'beginner' ? 'A1/A2' :
              germanProficiency === 'intermediate' ? 'B1/B2' :
              germanProficiency === 'advanced' ? 'C1' : 'C2'
            )}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Generating explanation…</span>
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-gray-500 text-center py-3">
            Could not load explanation. Try again.
          </p>
        )}

        {data && !loading && (
          <>
            {/* Lesson language explanation */}
            <div className="bg-blue-50 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BookOpen size={12} className="text-blue-500" />
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {LANG_LABELS[lessonLang]}
                </span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">{data.lesson_lang_explanation}</p>
            </div>

            {/* Student language explanation — only shown when different */}
            {!isSameLang && data.student_lang_explanation && (
              <div className="bg-emerald-50 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Globe size={12} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                    {LANG_LABELS[studentLang]}
                  </span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{data.student_lang_explanation}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Caret */}
      <div
        style={{
          position: 'absolute',
          bottom: -6,
          left: Math.min(
            Math.max(anchor.x + anchor.width / 2 - left - 6, 12),
            popupWidth - 24,
          ),
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
              title="Click for AI explanation"
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

import { useState, useCallback } from 'react';

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

export interface FillBlankQuestion {
  id: string;
  before: string;
  after: string;
  answer: string;
}

export interface GeneratedQuestions {
  mcq: MCQQuestion[];
  fillBlank: FillBlankQuestion[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STOP_WORDS_EN = new Set([
  'the', 'and', 'that', 'this', 'with', 'from', 'they', 'have', 'been',
  'used', 'also', 'into', 'their', 'which', 'between', 'other', 'each',
  'some', 'such', 'where', 'when', 'what', 'both', 'more', 'than', 'for',
  'are', 'not', 'can', 'its', 'will', 'has', 'was', 'were', 'does', 'did',
  'would', 'could', 'should', 'these', 'those', 'then', 'than', 'about',
]);

const STOP_WORDS_DE = new Set([
  'der', 'die', 'das', 'und', 'oder', 'aber', 'mit', 'von', 'zu', 'für',
  'bei', 'aus', 'nach', 'über', 'unter', 'durch', 'an', 'auf', 'in', 'ist',
  'sind', 'war', 'waren', 'hat', 'haben', 'wird', 'werden', 'kann', 'können',
  'muss', 'müssen', 'ein', 'eine', 'einen', 'dem', 'den', 'des', 'sich',
  'auch', 'noch', 'als', 'wenn', 'dann', 'dieser', 'diese', 'dieses',
  'welche', 'welcher', 'dass', 'nicht', 'mehr', 'sehr', 'beim', 'damit',
  'dazu', 'wie', 'alle', 'dabei', 'sowohl', 'bereits', 'hierbei', 'darf',
]);

type Lang = 'de' | 'en' | 'other';

function detectLanguage(text: string): Lang {
  const lower = text.toLowerCase();
  const sample = lower.slice(0, 2000);

  const deMarkers = ['der ', 'die ', 'das ', 'und ', 'ist ', 'sind ', 'wird ', 'nicht ', 'auch ', 'eine ', 'einen ', 'haben ', 'können ', 'werden '];
  const enMarkers = ['the ', 'and ', 'that ', 'this ', 'with ', 'from ', 'they ', 'have ', 'been ', 'also ', 'which ', 'some ', 'would ', 'could '];

  const deScore = deMarkers.filter((m) => sample.includes(m)).length;
  const enScore = enMarkers.filter((m) => sample.includes(m)).length;
  const hasUmlauts = /[äöüßÄÖÜ]/.test(text);
  const adjustedDe = deScore + (hasUmlauts ? 5 : 0);

  if (adjustedDe > enScore) return 'de';
  if (enScore > adjustedDe) return 'en';
  return 'other';
}

// Unicode-aware: preserves ä/ö/ü/ß and other non-ASCII letters
function extractContentTerms(text: string, lang: Lang): string[] {
  const stopWords = lang === 'de' ? STOP_WORDS_DE : STOP_WORDS_EN;
  const cleaned = text.replace(/[^\p{L}\p{N}\s]/gu, ' ');
  return [...new Set(
    cleaned
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 3 && !stopWords.has(w.toLowerCase()))
  )];
}

function extractContentSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function buildClientFallback(lessonContent: string, _topicTitle: string): GeneratedQuestions {
  const lang = detectLanguage(lessonContent);
  const sentences = extractContentSentences(lessonContent);
  const terms = extractContentTerms(lessonContent, lang);

  const mcq: MCQQuestion[] = [];
  const fillBlank: FillBlankQuestion[] = [];

  sentences.slice(0, 10).forEach((sentence) => {
    if (mcq.length >= 5) return;
    const sentenceTerms = extractContentTerms(sentence, lang);
    if (sentenceTerms.length < 1) return;

    const correctTerm = sentenceTerms[0];
    const distractors = terms
      .filter((t) => t.toLowerCase() !== correctTerm.toLowerCase())
      .slice(0, 3);
    if (distractors.length < 3) return;

    // Use indexOf instead of \b regex — word boundaries don't work for umlauts
    const idx = sentence.toLowerCase().indexOf(correctTerm.toLowerCase());
    if (idx < 0) return;
    const blanked = sentence.slice(0, idx) + '___' + sentence.slice(idx + correctTerm.length);
    if (!blanked.includes('___')) return;

    const options = [correctTerm, ...distractors].sort(() => 0.5 - Math.random());
    const correct = options.findIndex((o) => o.toLowerCase() === correctTerm.toLowerCase());

    const prefix = lang === 'de' ? 'Füllen Sie die Lücke aus:' : 'Fill in the blank:';
    mcq.push({ id: `mcq-${mcq.length + 1}`, question: `${prefix} "${blanked}"`, options, correct });
  });

  sentences.slice(0, 10).forEach((sentence) => {
    if (fillBlank.length >= 5) return;
    const sentenceTerms = extractContentTerms(sentence, lang);
    const term = sentenceTerms.find((t) => t.length > 3);
    if (!term) return;

    const idx = sentence.toLowerCase().indexOf(term.toLowerCase());
    if (idx < 0) return;

    const before = sentence.slice(0, idx).trim();
    const after = sentence.slice(idx + term.length).trim();
    if (!before || !after) return;

    // Preserve original casing from the sentence
    fillBlank.push({ id: `fb-${fillBlank.length + 1}`, before, after, answer: sentence.slice(idx, idx + term.length) });
  });

  return { mcq, fillBlank };
}

function isValidQuestions(data: unknown): data is GeneratedQuestions {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.mcq) && d.mcq.length > 0 &&
    Array.isArray(d.fillBlank) && d.fillBlank.length > 0
  );
}

export function useGeneratedQuestions() {
  const [questions, setQuestions] = useState<GeneratedQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (lessonContent: string, topicTitle: string) => {
    if (!lessonContent || lessonContent.trim().length < 20) {
      setLoading(false);
      setError('no_content');
      setQuestions(null);
      return;
    }

    setLoading(true);
    setError(null);
    setQuestions(null);

    try {
      const seed = Math.floor(Math.random() * 100000);
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ lessonContent, topicTitle, seed }),
      });

      const data = await res.json();

      if (isValidQuestions(data)) {
        setQuestions(data);
      } else {
        setQuestions(buildClientFallback(lessonContent, topicTitle));
      }
    } catch {
      setQuestions(buildClientFallback(lessonContent, topicTitle));
    } finally {
      setLoading(false);
    }
  }, []);

  return { questions, loading, error, generate };
}

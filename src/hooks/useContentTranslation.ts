import { useState, useEffect, useRef } from 'react';
import { Language } from '../i18n/translations';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1200;

async function callTranslate(
  content: string,
  targetLanguage: Language,
  signal: AbortSignal
): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/translate-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ content, targetLanguage }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Translation request failed: ${res.status}`);
  }

  const data = await res.json();
  const translated = data?.translatedContent;

  if (translated && typeof translated === 'string' && translated.trim().length > 0) {
    return translated;
  }

  throw new Error('Empty or invalid translation response');
}

export function useContentTranslation(originalContent: string, language: Language) {
  const abortRef = useRef<AbortController | null>(null);

  const [displayedContent, setDisplayedContent] = useState<string>(
    language === 'en' ? originalContent : ''
  );
  const [translating, setTranslating] = useState(language !== 'en' && !!originalContent);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    const trimmed = originalContent.trim();

    if (!trimmed) {
      setDisplayedContent('');
      setTranslating(false);
      return;
    }

    if (language === 'en') {
      setDisplayedContent(originalContent);
      setTranslating(false);
      return;
    }

    setDisplayedContent('');
    setTranslating(true);
    setRetryCount(0);

    const controller = new AbortController();
    abortRef.current = controller;

    let attempt = 0;

    const run = async () => {
      while (attempt < MAX_RETRIES) {
        if (controller.signal.aborted) return;

        try {
          const result = await callTranslate(trimmed, language, controller.signal);
          if (!controller.signal.aborted) {
            setDisplayedContent(result);
            setTranslating(false);
          }
          return;
        } catch (err) {
          if ((err as DOMException)?.name === 'AbortError') return;
          attempt++;
          setRetryCount(attempt);
          if (attempt < MAX_RETRIES) {
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(resolve, RETRY_DELAY_MS * attempt);
              controller.signal.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }).catch(() => {});
            if (controller.signal.aborted) return;
          }
        }
      }

      if (!controller.signal.aborted) {
        console.error(`Translation failed after ${MAX_RETRIES} attempts. Falling back to original English content.`);
        setDisplayedContent(originalContent);
        setTranslating(false);
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [originalContent, language]);

  return { displayedContent, translating, retryCount };
}

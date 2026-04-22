import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Chapter, Topic, TopicContent } from '../lib/supabase';
import type { Language } from '../i18n/translations';

export interface ChapterWithTopics extends Chapter {
  topics: Topic[];
}

export function useTraineeData() {
  const [chapters, setChapters] = useState<ChapterWithTopics[]>([]);
  const [topicContents, setTopicContents] = useState<TopicContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [chapRes, topRes, conRes] = await Promise.all([
        supabase.from('chapters').select('*').order('order_index'),
        supabase.from('topics').select('*').order('order_index'),
        supabase.from('topic_content').select('*'),
      ]);
      if (chapRes.error) throw chapRes.error;
      if (topRes.error) throw topRes.error;
      if (conRes.error) throw conRes.error;

      const allTopics: Topic[] = topRes.data ?? [];
      const mapped: ChapterWithTopics[] = (chapRes.data ?? []).map((ch) => ({
        ...ch,
        topics: allTopics.filter((t) => t.chapter_id === ch.id),
      }));

      setChapters(mapped);
      setTopicContents(conRes.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  const getContentForTopic = useCallback(
    (topicId: string, language: Language = 'en'): string => {
      const record = topicContents.find((c) => c.topic_id === topicId && c.language === language);
      if (record?.content) return record.content;
      const fallback = topicContents.find((c) => c.topic_id === topicId && c.language === 'en');
      return fallback?.content ?? '';
    },
    [topicContents]
  );

  const getAvailableLanguages = useCallback(
    (topicId: string): Language[] => {
      const langs = topicContents
        .filter((c) => c.topic_id === topicId && c.content.trim().length > 0)
        .map((c) => c.language as Language);
      return Array.from(new Set(langs));
    },
    [topicContents]
  );

  return { chapters, topicContents, loading, error, fetchAll, getContentForTopic, getAvailableLanguages };
}

import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type { Chapter, Topic, TopicContent } from '../../lib/supabase';

export type { Chapter, Topic, TopicContent };

export function useAdminData() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
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
      setChapters(chapRes.data ?? []);
      setTopics(topRes.data ?? []);
      setTopicContents(conRes.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const addChapter = useCallback(async (title: string, description: string) => {
    const maxOrder = chapters.reduce((m, c) => Math.max(m, c.order_index), -1);
    const { data, error } = await supabase
      .from('chapters')
      .insert({ title: title.trim(), description: description.trim(), order_index: maxOrder + 1 })
      .select()
      .single();
    if (error) throw error;
    setChapters((prev) => [...prev, data]);
    return data as Chapter;
  }, [chapters]);

  const updateChapter = useCallback(async (id: string, title: string, description: string) => {
    const { data, error } = await supabase
      .from('chapters')
      .update({ title: title.trim(), description: description.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setChapters((prev) => prev.map((c) => (c.id === id ? (data as Chapter) : c)));
  }, []);

  const deleteChapter = useCallback(async (id: string) => {
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) throw error;
    setChapters((prev) => prev.filter((c) => c.id !== id));
    setTopics((prev) => prev.filter((t) => t.chapter_id !== id));
  }, []);

  const addTopic = useCallback(async (chapterId: string, title: string, description: string) => {
    const chapterTopics = topics.filter((t) => t.chapter_id === chapterId);
    const maxOrder = chapterTopics.reduce((m, t) => Math.max(m, t.order_index), -1);
    const { data, error } = await supabase
      .from('topics')
      .insert({ chapter_id: chapterId, title: title.trim(), description: description.trim(), order_index: maxOrder + 1 })
      .select()
      .single();
    if (error) throw error;
    setTopics((prev) => [...prev, data as Topic]);
    return data as Topic;
  }, [topics]);

  const updateTopic = useCallback(async (id: string, title: string, description: string) => {
    const { data, error } = await supabase
      .from('topics')
      .update({ title: title.trim(), description: description.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setTopics((prev) => prev.map((t) => (t.id === id ? (data as Topic) : t)));
  }, []);

  const deleteTopic = useCallback(async (id: string) => {
    const { error } = await supabase.from('topics').delete().eq('id', id);
    if (error) throw error;
    setTopics((prev) => prev.filter((t) => t.id !== id));
    setTopicContents((prev) => prev.filter((c) => c.topic_id !== id));
  }, []);

  const upsertContent = useCallback(async (topicId: string, content: string, language = 'en') => {
    const existing = topicContents.find((c) => c.topic_id === topicId && c.language === language);
    if (existing) {
      const { data, error } = await supabase
        .from('topic_content')
        .update({ content: content.trim(), updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      setTopicContents((prev) => prev.map((c) => (c.id === existing.id ? (data as TopicContent) : c)));
    } else {
      const { data, error } = await supabase
        .from('topic_content')
        .insert({ topic_id: topicId, content: content.trim(), content_type: 'text', language })
        .select()
        .single();
      if (error) throw error;
      setTopicContents((prev) => [...prev, data as TopicContent]);
    }
  }, [topicContents]);

  return {
    chapters, topics, topicContents,
    loading, error,
    fetchAll,
    addChapter, updateChapter, deleteChapter,
    addTopic, updateTopic, deleteTopic,
    upsertContent,
  };
}

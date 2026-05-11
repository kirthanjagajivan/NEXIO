import { supabase } from '../lib/supabase';
import type { PerformanceRecord } from '../lib/supabase';

export interface LessonRecord {
  lessonName: string;
  topicId: string;
  score: number;
  total: number;
  passed: boolean;
  attempts: number;
  lastAttemptAt: string;
  scoreHistory: number[];
}

const PASS_THRESHOLD = 30;

function toLessonRecord(p: PerformanceRecord): LessonRecord {
  return {
    lessonName: p.lesson_name,
    topicId: p.topic_id,
    score: p.score,
    total: p.total,
    passed: p.passed,
    attempts: p.attempts,
    lastAttemptAt: p.last_attempt_at,
    scoreHistory: Array.isArray(p.score_history) ? p.score_history as number[] : [],
  };
}

export async function savePerformance(topicId: string, lessonName: string, score: number, total: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const passed = score >= PASS_THRESHOLD;

  const { data: existing } = await supabase
    .from('performance')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic_id', topicId)
    .maybeSingle();

  if (existing) {
    const prevHistory = Array.isArray((existing as PerformanceRecord).score_history)
      ? (existing as PerformanceRecord).score_history as number[]
      : [(existing as PerformanceRecord).score];
    await supabase
      .from('performance')
      .update({
        score,
        total,
        passed,
        attempts: (existing as PerformanceRecord).attempts + 1,
        last_attempt_at: new Date().toISOString(),
        score_history: [...prevHistory, score],
      })
      .eq('id', (existing as PerformanceRecord).id);
  } else {
    await supabase.from('performance').insert({
      user_id: user.id,
      topic_id: topicId,
      lesson_name: lessonName,
      score,
      total,
      passed,
      attempts: 1,
      last_attempt_at: new Date().toISOString(),
      score_history: [score],
    });
  }
}

export async function getPerformanceRecords(): Promise<LessonRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('performance')
    .select('*')
    .eq('user_id', user.id)
    .order('last_attempt_at', { ascending: false });

  return (data ?? []).map(toLessonRecord);
}

export async function clearPerformance(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('performance').delete().eq('user_id', user.id);
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

export interface AcademicPerformanceRecord {
  id: string;
  user_id: string;
  topic_id: string;
  lesson_name: string;
  score: number;
  total: number;
  passed: boolean;
  attempts: number;
  last_attempt_at: string;
  score_history: number[];
  source: 'teacher';
  created_at: string;
}

export interface TraineeAcademicData {
  trainee: Profile;
  performance: AcademicPerformanceRecord[];
  stats: {
    totalLessons: number;
    passedLessons: number;
    avgScore: number;
    totalAttempts: number;
    progressPercentage: number;
    weakTopics: { topicId: string; lessonName: string; avgScore: number; attempts: number }[];
    recentActivity: { date: string; lessonName: string; score: number }[];
  };
}

export function useAcademicPerformance(traineeIds?: string[]) {
  const [traineeData, setTraineeData] = useState<TraineeAcademicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let traineeQuery = supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'trainee');

      if (traineeIds && traineeIds.length > 0) {
        traineeQuery = traineeQuery.in('id', traineeIds);
      }

      const { data: trainees, error: traineeError } = await traineeQuery;

      if (traineeError) throw traineeError;

      if (!trainees || trainees.length === 0) {
        setTraineeData([]);
        setLoading(false);
        return;
      }

      const traineeIdList = trainees.map((t: any) => t.id);

      // Get ONLY teacher/academic performance data
      const { data: performance, error: perfError } = await supabase
        .from('performance')
        .select('*')
        .in('user_id', traineeIdList)
        .eq('source', 'teacher')
        .order('last_attempt_at', { ascending: false });

      if (perfError) throw perfError;

      const processedData: TraineeAcademicData[] = trainees.map((trainee: any) => {
        const traineePerf = (performance || []).filter(
          (p: any) => p.user_id === trainee.id
        );

        const totalLessons = traineePerf.length;
        const passedLessons = traineePerf.filter((p: any) => p.passed).length;
        const totalScore = traineePerf.reduce((sum: number, p: any) => sum + p.score, 0);
        const totalPossible = traineePerf.reduce((sum: number, p: any) => sum + p.total, 0);
        const avgScore = totalLessons > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
        const totalAttempts = traineePerf.reduce((sum: number, p: any) => sum + p.attempts, 0);
        const progressPercentage = totalLessons > 0 ? Math.round((passedLessons / totalLessons) * 100) : 0;

        const weakTopics = traineePerf
          .filter((p: any) => !p.passed || (p.score / p.total) < 0.7)
          .map((p: any) => ({
            topicId: p.topic_id,
            lessonName: p.lesson_name,
            avgScore: Math.round((p.score / p.total) * 100),
            attempts: p.attempts,
          }))
          .sort((a: any, b: any) => a.avgScore - b.avgScore)
          .slice(0, 5);

        const recentActivity = traineePerf
          .slice(0, 10)
          .map((p: any) => ({
            date: p.last_attempt_at,
            lessonName: p.lesson_name,
            score: Math.round((p.score / p.total) * 100),
          }));

        return {
          trainee,
          performance: traineePerf,
          stats: {
            totalLessons,
            passedLessons,
            avgScore,
            totalAttempts,
            progressPercentage,
            weakTopics,
            recentActivity,
          },
        };
      });

      setTraineeData(processedData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load academic performance');
    } finally {
      setLoading(false);
    }
  }, [traineeIds]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { traineeData, loading, error, refetch: fetchData };
}

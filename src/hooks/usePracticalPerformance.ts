import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

export interface PracticalPerformanceRecord {
  id: string;
  user_id: string;
  task_id: string;
  task_title: string;
  score: number;
  total: number;
  passed: boolean;
  attempts: number;
  submission_text: string;
  feedback: string | null;
  last_attempt_at: string;
  score_history: number[];
  created_at: string;
}

export interface TraineePracticalData {
  trainee: Profile;
  performance: PracticalPerformanceRecord[];
  stats: {
    totalTasks: number;
    passedTasks: number;
    avgScore: number;
    totalAttempts: number;
    progressPercentage: number;
    weakTasks: { taskId: string; taskTitle: string; avgScore: number; attempts: number }[];
    recentActivity: { date: string; taskTitle: string; score: number }[];
  };
}

export function usePracticalPerformance(traineeIds?: string[]) {
  const [traineeData, setTraineeData] = useState<TraineePracticalData[]>([]);
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

      // Get ONLY practical/trainer performance data
      const { data: performance, error: perfError } = await supabase
        .from('practical_performance')
        .select('*')
        .in('user_id', traineeIdList)
        .order('last_attempt_at', { ascending: false });

      if (perfError) throw perfError;

      const processedData: TraineePracticalData[] = trainees.map((trainee: any) => {
        const traineePerf = (performance || []).filter(
          (p: any) => p.user_id === trainee.id
        );

        const totalTasks = traineePerf.length;
        const passedTasks = traineePerf.filter((p: any) => p.passed).length;
        const totalScore = traineePerf.reduce((sum: number, p: any) => sum + p.score, 0);
        const totalPossible = traineePerf.reduce((sum: number, p: any) => sum + p.total, 0);
        const avgScore = totalTasks > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
        const totalAttempts = traineePerf.reduce((sum: number, p: any) => sum + p.attempts, 0);
        const progressPercentage = totalTasks > 0 ? Math.round((passedTasks / totalTasks) * 100) : 0;

        const weakTasks = traineePerf
          .filter((p: any) => !p.passed || (p.score / p.total) < 0.7)
          .map((p: any) => ({
            taskId: p.task_id,
            taskTitle: p.task_title,
            avgScore: Math.round((p.score / p.total) * 100),
            attempts: p.attempts,
          }))
          .sort((a: any, b: any) => a.avgScore - b.avgScore)
          .slice(0, 5);

        const recentActivity = traineePerf
          .slice(0, 10)
          .map((p: any) => ({
            date: p.last_attempt_at,
            taskTitle: p.task_title,
            score: Math.round((p.score / p.total) * 100),
          }));

        return {
          trainee,
          performance: traineePerf,
          stats: {
            totalTasks,
            passedTasks,
            avgScore,
            totalAttempts,
            progressPercentage,
            weakTasks,
            recentActivity,
          },
        };
      });

      setTraineeData(processedData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load practical performance');
    } finally {
      setLoading(false);
    }
  }, [traineeIds]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { traineeData, loading, error, refetch: fetchData };
}

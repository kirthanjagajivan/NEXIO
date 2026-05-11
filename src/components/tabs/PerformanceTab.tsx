import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, XCircle, RotateCcw, BookOpen, Award, Target, BookMarked, TrendingDown, Minus, Star } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getPerformanceRecords, clearPerformance } from '../../hooks/usePerformance';
import type { LessonRecord } from '../../hooks/usePerformance';
import { supabase } from '../../lib/supabase';

const MAX_SCORE = 50;
const HIGH_SCORE_THRESHOLD = 0.75;
const LOW_SCORE_THRESHOLD = 0.5;

type FeedbackType = 'improving' | 'excellent' | 'low' | 'neutral';

function analyzeTrend(records: LessonRecord[]): FeedbackType {
  if (records.length === 0) return 'neutral';

  const scores = records.map((r) => r.score / r.total);
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;

  if (avg >= HIGH_SCORE_THRESHOLD && scores.every((s) => s >= HIGH_SCORE_THRESHOLD)) {
    return 'excellent';
  }

  if (scores.length >= 2) {
    const half = Math.ceil(scores.length / 2);
    const firstHalfAvg = scores.slice(0, half).reduce((s, v) => s + v, 0) / half;
    const secondHalfAvg = scores.slice(half).reduce((s, v) => s + v, 0) / Math.max(scores.length - half, 1);
    if (secondHalfAvg > firstHalfAvg + 0.08) return 'improving';
  }

  if (avg < LOW_SCORE_THRESHOLD) return 'low';

  return 'neutral';
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function ScoreBar({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const color =
    pct >= 80 ? 'bg-green-500' :
    pct >= 60 ? 'bg-blue-500' :
    pct >= 40 ? 'bg-amber-500' :
    'bg-red-500';

  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-700 w-16 text-right">{score} / {total}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function PerformanceTab() {
  const { t } = useLanguage();
  const [records, setRecords] = useState<LessonRecord[]>([]);
  const [totalTopics, setTotalTopics] = useState(0);

  useEffect(() => {
    getPerformanceRecords().then(setRecords);
    supabase.from('topics').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setTotalTopics(count ?? 0);
    });
  }, []);

  async function handleClear() {
    await clearPerformance();
    setRecords([]);
  }

  const FEEDBACK_CONFIG: Record<FeedbackType, {
    label: string;
    description: string;
    icon: React.ReactNode;
    bg: string;
    border: string;
    labelColor: string;
    descColor: string;
  }> = {
    improving: {
      label: t.you_are_improving,
      description: t.you_are_improving_desc,
      icon: <TrendingUp size={20} className="text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      labelColor: 'text-blue-800',
      descColor: 'text-blue-600',
    },
    excellent: {
      label: t.excellent_performance,
      description: t.excellent_performance_desc,
      icon: <Star size={20} className="text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      labelColor: 'text-amber-800',
      descColor: 'text-amber-600',
    },
    low: {
      label: t.needs_more_practice,
      description: t.needs_more_practice_desc,
      icon: <TrendingDown size={20} className="text-red-500" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      labelColor: 'text-red-800',
      descColor: 'text-red-600',
    },
    neutral: {
      label: t.steady_progress,
      description: t.steady_progress_desc,
      icon: <Minus size={20} className="text-gray-500" />,
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      labelColor: 'text-gray-800',
      descColor: 'text-gray-500',
    },
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
          <TrendingUp className="w-10 h-10 text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-semibold text-lg">{t.noPerformanceData}</p>
          <p className="text-gray-400 text-sm mt-1">{t.complete_lesson_prompt}</p>
        </div>
      </div>
    );
  }

  const totalAttempts = records.reduce((s, r) => s + r.attempts, 0);
  const passed = records.filter((r) => r.passed).length;
  const avgScore = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.score, 0) / records.length)
    : 0;
  const avgPct = Math.round((avgScore / MAX_SCORE) * 100);
  const completionPct = Math.round((records.length / totalTopics) * 100);
  const trend = analyzeTrend(records);
  const cfg = FEEDBACK_CONFIG[trend];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.performance_overview}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{records.length} {t.lessons_tracked}</p>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
        >
          <RotateCcw size={13} />
          {t.clear_history}
        </button>
      </div>

      <div className={`rounded-xl border ${cfg.border} ${cfg.bg} px-5 py-4 flex items-start gap-3`}>
        <div className="mt-0.5 shrink-0">{cfg.icon}</div>
        <div>
          <p className={`font-semibold text-sm ${cfg.labelColor}`}>{cfg.label}</p>
          <p className={`text-xs mt-0.5 ${cfg.descColor}`}>{cfg.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookMarked size={16} className="text-blue-500" />
            <span className="font-semibold text-gray-800 text-sm">{t.course_completion_label}</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{completionPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2.5">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{records.length}</span> of{' '}
            <span className="font-semibold text-gray-600">{totalTopics}</span> {t.lessons_completed_of}
          </p>
          {records.length === totalTopics && (
            <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              {t.all_lessons_done}
            </span>
          )}
          {records.length < totalTopics && (
            <span className="text-xs text-gray-400">
              {totalTopics - records.length} {t.remaining}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={t.lessons_tracked_label} value={records.length} color="text-gray-900" />
        <StatCard label={t.passed_stat} value={passed} sub={`${records.length - passed} ${t.failed_label}`} color="text-green-600" />
        <StatCard label={t.avg_score} value={`${avgScore}/50`} sub={`${avgPct}%`} color={avgPct >= 60 ? 'text-blue-600' : 'text-amber-600'} />
        <StatCard label={t.total_attempts} value={totalAttempts} sub={t.across_all_lessons} color="text-gray-900" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <BookOpen size={16} className="text-gray-500" />
          <h3 className="font-semibold text-gray-800 text-sm">{t.lesson_results}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {records.map((record) => {
            const pct = Math.round((record.score / record.total) * 100);
            const grade =
              pct >= 90 ? 'A+' :
              pct >= 80 ? 'A' :
              pct >= 70 ? 'B' :
              pct >= 60 ? 'C' :
              pct >= 50 ? 'D' : 'F';
            const gradeColor =
              pct >= 70 ? 'text-green-600 bg-green-50 border-green-200' :
              pct >= 50 ? 'text-amber-600 bg-amber-50 border-amber-200' :
              'text-red-500 bg-red-50 border-red-200';

            const history = record.scoreHistory ?? [record.score];

            return (
              <div key={record.topicId} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${record.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                      {record.passed
                        ? <CheckCircle size={16} className="text-green-600" />
                        : <XCircle size={16} className="text-red-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{record.lessonName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {record.attempts} {t.attempts_label} &middot; Last: {formatDate(record.lastAttemptAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${gradeColor}`}>
                      {grade}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${record.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {record.passed ? t.pass_badge : t.fail_badge}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <ScoreBar score={record.score} total={record.total} />
                  <span className="text-xs text-gray-400 shrink-0">{pct}%</span>
                </div>
                {history.length > 1 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-gray-400 shrink-0">{t.attempts_label}</span>
                    {history.map((s, i) => {
                      const sPct = Math.round((s / record.total) * 100);
                      const isLast = i === history.length - 1;
                      const prev = i > 0 ? history[i - 1] : null;
                      const improved = prev !== null && s > prev;
                      const declined = prev !== null && s < prev;
                      const scoreColor = sPct >= 80 ? 'text-green-700 bg-green-50 border-green-200'
                        : sPct >= 60 ? 'text-blue-700 bg-blue-50 border-blue-200'
                        : sPct >= 40 ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-red-600 bg-red-50 border-red-200';
                      return (
                        <div key={i} className="flex items-center gap-1">
                          {i > 0 && (
                            <span className={`text-xs font-bold ${improved ? 'text-green-500' : declined ? 'text-red-400' : 'text-gray-300'}`}>
                              {improved ? '↑' : declined ? '↓' : '→'}
                            </span>
                          )}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${scoreColor} ${isLast ? 'ring-1 ring-offset-1 ring-gray-300' : ''}`}>
                            {s}/{record.total}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Target size={16} className="text-gray-500" />
          <h3 className="font-semibold text-gray-800 text-sm">{t.pass_fail_summary}</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-medium text-green-600">{passed} {t.passed_stat.toLowerCase()}</span>
                <span className="font-medium text-red-500">{records.length - passed} {t.failed_label}</span>
              </div>
              <div className="w-full bg-red-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-green-500 transition-all duration-700"
                  style={{ width: records.length > 0 ? `${Math.round((passed / records.length) * 100)}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                {records.length > 0 ? Math.round((passed / records.length) * 100) : 0}{t.pass_rate}
              </p>
            </div>
            <div className="shrink-0 text-center">
              <Award size={32} className={passed >= records.length / 2 ? 'text-amber-400' : 'text-gray-300'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

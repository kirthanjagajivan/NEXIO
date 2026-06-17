import { useState, useEffect } from 'react';
import {
  GraduationCap, BookOpen, CheckCircle, XCircle, TrendingUp, TrendingDown,
  RotateCcw, Target, Award, AlertTriangle, Minus, Star, Loader2, RefreshCw,
  BookMarked, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getPerformanceRecords, clearPerformance } from '../../hooks/usePerformance';
import type { LessonRecord } from '../../hooks/usePerformance';
import { supabase } from '../../lib/supabase';

const MAX_SCORE = 50;
const HIGH_SCORE_THRESHOLD = 0.75;
const LOW_SCORE_THRESHOLD = 0.5;

type Trend = 'improving' | 'excellent' | 'low' | 'neutral';

function analyzeTrend(records: LessonRecord[]): Trend {
  if (records.length === 0) return 'neutral';
  const scores = records.map((r) => r.score / r.total);
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  if (avg >= HIGH_SCORE_THRESHOLD && scores.every((s) => s >= HIGH_SCORE_THRESHOLD)) return 'excellent';
  if (scores.length >= 2) {
    const half = Math.ceil(scores.length / 2);
    const first = scores.slice(0, half).reduce((s, v) => s + v, 0) / half;
    const second = scores.slice(half).reduce((s, v) => s + v, 0) / Math.max(scores.length - half, 1);
    if (second > first + 0.08) return 'improving';
  }
  if (avg < LOW_SCORE_THRESHOLD) return 'low';
  return 'neutral';
}

function scoreColor(pct: number) {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 60) return 'text-blue-600';
  if (pct >= 40) return 'text-amber-600';
  return 'text-red-500';
}

function barColor(pct: number) {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 60) return 'bg-blue-500';
  if (pct >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
}

function ScoreBar({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-700 ${barColor(pct)}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-slate-300 w-14 text-right shrink-0">{score}/{total}</span>
    </div>
  );
}

interface ChapterGroup {
  chapterTitle: string;
  topics: LessonRecord[];
}

export function TeacherLearningAnalytics() {
  const { t } = useLanguage();
  const [records, setRecords] = useState<LessonRecord[]>([]);
  const [totalTopics, setTotalTopics] = useState(0);
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
  const [topics, setTopics] = useState<{ id: string; chapter_id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [r, { count }, { data: ch }, { data: tp }] = await Promise.all([
      getPerformanceRecords(),
      supabase.from('topics').select('id', { count: 'exact', head: true }),
      supabase.from('chapters').select('id, title').order('order_index'),
      supabase.from('topics').select('id, chapter_id, title').order('order_index'),
    ]);
    setRecords(r);
    setTotalTopics(count ?? 0);
    setChapters(ch ?? []);
    setTopics(tp ?? []);
    setLoading(false);
  }

  async function handleClear() {
    await clearPerformance();
    setRecords([]);
  }

  function toggleChapter(id: string) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-600">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm font-medium">Loading analytics…</span>
      </div>
    );
  }

  const TREND_CONFIG: Record<Trend, { label: string; desc: string; icon: React.ReactNode; bg: string; border: string; lc: string; dc: string; rec: string }> = {
    excellent: {
      label: t.excellent_performance,
      desc: t.excellent_performance_desc,
      icon: <Star size={20} className="text-amber-500" />,
      bg: 'bg-amber-500/10', border: 'border-amber-500/30', lc: 'text-amber-300', dc: 'text-amber-400',
      rec: 'You\'re excelling! Consider attempting harder topics and sharing knowledge with peers.',
    },
    improving: {
      label: t.you_are_improving,
      desc: t.you_are_improving_desc,
      icon: <TrendingUp size={20} className="text-blue-400" />,
      bg: 'bg-blue-500/10', border: 'border-blue-500/30', lc: 'text-blue-300', dc: 'text-blue-400',
      rec: 'Keep up the momentum! Review your earlier lessons to reinforce weaker areas.',
    },
    low: {
      label: t.needs_more_practice,
      desc: t.needs_more_practice_desc,
      icon: <TrendingDown size={20} className="text-red-400" />,
      bg: 'bg-red-500/10', border: 'border-red-500/30', lc: 'text-red-300', dc: 'text-red-400',
      rec: 'Focus on re-reading the lesson content before attempting the quiz. Take notes while studying.',
    },
    neutral: {
      label: t.steady_progress,
      desc: t.steady_progress_desc,
      icon: <Minus size={20} className="text-slate-500" />,
      bg: 'bg-slate-500/10', border: 'border-slate-500/30', lc: 'text-slate-300', dc: 'text-slate-400',
      rec: 'Consistent progress! Try to push for higher scores by reviewing weak topics.',
    },
  };

  if (records.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <GraduationCap size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Teacher Learning Analytics</h2>
            <p className="text-sm text-slate-400">Quiz scores, lesson progress, and chapter breakdown</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-[#1E293B] rounded-xl border border-slate-700/60">
          <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center">
            <BookOpen size={28} className="text-slate-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-300">{t.noPerformanceData}</p>
            <p className="text-sm text-slate-500 mt-1">{t.complete_lesson_prompt}</p>
          </div>
        </div>
      </div>
    );
  }

  const passed = records.filter((r) => r.passed).length;
  const failed = records.length - passed;
  const avgScore = Math.round(records.reduce((s, r) => s + r.score, 0) / records.length);
  const avgPct = Math.round((avgScore / MAX_SCORE) * 100);
  const completionPct = totalTopics > 0 ? Math.round((records.length / totalTopics) * 100) : 0;
  const totalAttempts = records.reduce((s, r) => s + r.attempts, 0);
  const trend = analyzeTrend(records);
  const cfg = TREND_CONFIG[trend];
  const weakRecords = records.filter((r) => !r.passed || (r.score / r.total) < 0.7)
    .sort((a, b) => (a.score / a.total) - (b.score / b.total));

  // Build chapter-grouped view
  const recordsByTopic = new Map(records.map((r) => [r.topicId, r]));
  const chapterGroups: ChapterGroup[] = chapters.map((ch) => {
    const chTopics = topics.filter((tp) => tp.chapter_id === ch.id);
    const attempted = chTopics.map((tp) => recordsByTopic.get(tp.id)).filter(Boolean) as LessonRecord[];
    return { chapterTitle: ch.title, topics: attempted };
  }).filter((g) => g.topics.length > 0);

  // Records not matched to any chapter (fallback)
  const ungrouped = records.filter((r) => {
    const tp = topics.find((t) => t.id === r.topicId);
    return !tp;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <GraduationCap size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Teacher Learning Analytics</h2>
            <p className="text-sm text-slate-400">Quiz scores, lesson progress, and chapter breakdown</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/30 transition-colors"
          >
            <RotateCcw size={13} />
            {t.clear_history}
          </button>
        </div>
      </div>

      {/* AI Recommendation banner */}
      <div className={`rounded-xl border ${cfg.border} ${cfg.bg} px-5 py-4`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{cfg.icon}</div>
          <div className="flex-1">
            <p className={`font-semibold text-sm ${cfg.lc}`}>{cfg.label}</p>
            <p className={`text-xs mt-0.5 ${cfg.dc}`}>{cfg.desc}</p>
            <div className="mt-2 flex items-start gap-1.5">
              <Star size={12} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-400 italic">{cfg.rec}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Completion progress */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookMarked size={16} className="text-blue-400" />
            <span className="font-semibold text-white text-sm">{t.course_completion_label}</span>
          </div>
          <span className="text-2xl font-bold text-blue-400">{completionPct}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-emerald-500 transition-all duration-1000"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span><span className="font-semibold text-slate-300">{records.length}</span> of <span className="font-semibold text-slate-300">{totalTopics}</span> {t.lessons_completed_of}</span>
          {records.length === totalTopics
            ? <span className="text-green-400 font-semibold bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-full">{t.all_lessons_done}</span>
            : <span>{totalTopics - records.length} {t.remaining}</span>}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Topics Attempted', value: records.length, color: 'text-white' },
          { label: t.passed_stat, value: passed, sub: `${failed} ${t.failed_label}`, color: 'text-green-400' },
          { label: t.avg_score, value: `${avgScore}/50`, sub: `${avgPct}%`, color: avgPct >= 60 ? 'text-blue-400' : 'text-amber-400' },
          { label: t.total_attempts, value: totalAttempts, sub: t.across_all_lessons, color: 'text-white' },
        ].map((c) => (
          <div key={c.label} className="bg-[#1E293B] rounded-xl border border-slate-700/60 p-4 flex flex-col gap-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            {c.sub && <p className="text-xs text-slate-500">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Pass/fail bar */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-slate-500" />
          <h3 className="font-semibold text-white text-sm">{t.pass_fail_summary}</h3>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium text-green-400">{passed} passed</span>
          <span className="font-medium text-red-400">{failed} failed</span>
        </div>
        <div className="w-full bg-red-500/20 rounded-full h-3 overflow-hidden border border-red-500/30">
          <div
            className="h-3 rounded-full bg-green-500 transition-all duration-700"
            style={{ width: records.length > 0 ? `${Math.round((passed / records.length) * 100)}%` : '0%' }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5 text-center">
          {records.length > 0 ? Math.round((passed / records.length) * 100) : 0}{t.pass_rate}
        </p>
      </div>

      {/* Weak topics */}
      {weakRecords.length > 0 && (
        <div className="bg-[#1E293B] rounded-xl border border-amber-500/30 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-amber-500/10 border-b border-amber-500/30">
            <AlertTriangle size={15} className="text-amber-400" />
            <h3 className="font-semibold text-amber-300 text-sm">Weak Topics — Needs Review</h3>
          </div>
          <div className="divide-y divide-slate-700/50">
            {weakRecords.slice(0, 6).map((r) => {
              const pct = Math.round((r.score / r.total) * 100);
              return (
                <div key={r.topicId} className="px-5 py-3 flex items-center gap-4">
                  <XCircle size={15} className="text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.lessonName}</p>
                    <p className="text-xs text-slate-500">{r.attempts} attempt{r.attempts !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-bold ${scoreColor(pct)}`}>{pct}%</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                      {r.passed ? 'Borderline' : 'Failed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chapter-grouped topic results */}
      {chapterGroups.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <BookOpen size={15} className="text-slate-500" />
            <h3 className="font-semibold text-white text-sm">Results by Chapter</h3>
          </div>
          {chapterGroups.map((group) => {
            const isOpen = expandedChapters.has(group.chapterTitle);
            const gPassed = group.topics.filter((r) => r.passed).length;
            const gTotal = group.topics.length;
            const gAvg = gTotal > 0
              ? Math.round(group.topics.reduce((s, r) => s + (r.score / r.total), 0) / gTotal * 100)
              : 0;
            return (
              <div key={group.chapterTitle} className="bg-[#1E293B] rounded-xl border border-slate-700/60 overflow-hidden">
                <button
                  onClick={() => toggleChapter(group.chapterTitle)}
                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <BookOpen size={15} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-white text-sm">{group.chapterTitle}</p>
                    <p className="text-xs text-slate-500">{gTotal} topic{gTotal !== 1 ? 's' : ''} attempted</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-500">Avg</p>
                      <p className={`font-bold text-sm ${scoreColor(gAvg)}`}>{gAvg}%</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-500">Passed</p>
                      <p className="font-bold text-sm text-white">{gPassed}/{gTotal}</p>
                    </div>
                    <div className="w-20 hidden sm:block">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${gAvg >= 70 ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${gTotal > 0 ? (gPassed / gTotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-700/60 divide-y divide-slate-700/50">
                    {group.topics.map((record) => {
                      const pct = Math.round((record.score / record.total) * 100);
                      const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
                      const history = record.scoreHistory ?? [record.score];
                      return (
                        <div key={record.topicId} className="px-5 py-4">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${record.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                {record.passed
                                  ? <CheckCircle size={14} className="text-green-400" />
                                  : <XCircle size={14} className="text-red-400" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-white text-sm truncate">{record.lessonName}</p>
                                <p className="text-xs text-slate-500">
                                  {record.attempts} attempt{record.attempts !== 1 ? 's' : ''} · Last: {formatDate(record.lastAttemptAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                pct >= 70 ? 'text-green-300 bg-green-500/20 border-green-500/30' :
                                pct >= 50 ? 'text-amber-300 bg-amber-500/20 border-amber-500/30' :
                                'text-red-300 bg-red-500/20 border-red-500/30'
                              }`}>{grade}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${record.passed ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                {record.passed ? t.pass_badge : t.fail_badge}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2.5 flex items-center gap-2">
                            <ScoreBar score={record.score} total={record.total} />
                            <span className={`text-xs font-bold shrink-0 ${scoreColor(pct)}`}>{pct}%</span>
                          </div>
                          {history.length > 1 && (
                            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-slate-500 shrink-0">History:</span>
                              {history.map((s, i) => {
                                const sPct = Math.round((s / record.total) * 100);
                                const prev = i > 0 ? history[i - 1] : null;
                                const up = prev !== null && s > prev;
                                const down = prev !== null && s < prev;
                                return (
                                  <div key={i} className="flex items-center gap-0.5">
                                    {i > 0 && (
                                      <span className={`text-xs font-bold ${up ? 'text-green-400' : down ? 'text-red-400' : 'text-slate-600'}`}>
                                        {up ? '↑' : down ? '↓' : '→'}
                                      </span>
                                    )}
                                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${
                                      sPct >= 80 ? 'text-green-300 bg-green-500/20 border-green-500/30' :
                                      sPct >= 60 ? 'text-blue-300 bg-blue-500/20 border-blue-500/30' :
                                      sPct >= 40 ? 'text-amber-300 bg-amber-500/20 border-amber-500/30' :
                                      'text-red-300 bg-red-500/20 border-red-500/30'
                                    } ${i === history.length - 1 ? 'ring-1 ring-offset-1 ring-slate-700' : ''}`}>
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Ungrouped fallback */}
      {ungrouped.length > 0 && (
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/60 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700/60 bg-slate-900/50">
            <BookOpen size={15} className="text-slate-600" />
            <h3 className="font-semibold text-white text-sm">Other Lessons</h3>
          </div>
          <div className="divide-y divide-slate-700/50">
            {ungrouped.map((record) => {
              const pct = Math.round((record.score / record.total) * 100);
              return (
                <div key={record.topicId} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${record.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {record.passed ? <CheckCircle size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{record.lessonName}</p>
                    </div>
                    <ScoreBar score={record.score} total={record.total} />
                    <span className={`text-sm font-bold shrink-0 ${scoreColor(pct)}`}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Target summary */}
      <div className="bg-[#1E293B] rounded-xl border border-slate-700/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-slate-500" />
          <h3 className="font-semibold text-white text-sm">Quiz Performance Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">{passed}</p>
            <p className="text-xs text-slate-500 mt-0.5">Topics Passed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{failed}</p>
            <p className="text-xs text-slate-500 mt-0.5">Topics Failed</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${avgPct >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>{avgPct}%</p>
            <p className="text-xs text-slate-500 mt-0.5">Average Score</p>
          </div>
        </div>
      </div>
    </div>
  );
}

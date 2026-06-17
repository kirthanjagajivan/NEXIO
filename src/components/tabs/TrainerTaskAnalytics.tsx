import { useState, useEffect } from 'react';
import {
  Briefcase, CheckCircle, XCircle, Clock, RotateCcw, AlertTriangle,
  Loader2, RefreshCw, Star, MessageSquare, TrendingUp, ClipboardCheck,
  ChevronDown, ChevronUp, Target,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../i18n/LanguageContext';

interface TaskSubmission {
  id: string;
  task_id: string;
  task_title: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'needs_revision';
  score: number | null;
  feedback: string | null;
  reviewed_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PracticalRecord {
  id: string;
  task_id: string;
  task_title: string;
  score: number;
  total: number;
  passed: boolean;
  attempts: number;
  feedback: string | null;
  score_history: number[];
  last_attempt_at: string;
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
}

function ScorePill({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const color = pct >= 80 ? 'text-green-700 bg-green-50 border-green-200'
    : pct >= 60 ? 'text-blue-700 bg-blue-50 border-blue-200'
    : pct >= 40 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-600 bg-red-50 border-red-200';
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>
      {score}/{total} · {pct}%
    </span>
  );
}

export function TrainerTaskAnalytics() {
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [perfRecords, setPerfRecords] = useState<PracticalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [subsRes, perfRes] = await Promise.all([
      supabase
        .from('task_submissions')
        .select('id, task_id, status, score, feedback, reviewed_at, submitted_at, created_at, updated_at, practical_tasks(title)')
        .eq('trainee_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('practical_performance')
        .select('*')
        .eq('user_id', user.id)
        .order('last_attempt_at', { ascending: false }),
    ]);

    const subs: TaskSubmission[] = (subsRes.data ?? []).map((s: any) => ({
      id: s.id,
      task_id: s.task_id,
      task_title: s.practical_tasks?.title ?? 'Unknown Task',
      status: s.status,
      score: s.score,
      feedback: s.feedback,
      reviewed_at: s.reviewed_at,
      submitted_at: s.submitted_at,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));

    const perf: PracticalRecord[] = (perfRes.data ?? []).map((p: any) => ({
      id: p.id,
      task_id: p.task_id,
      task_title: p.task_title,
      score: p.score,
      total: p.total,
      passed: p.passed,
      attempts: p.attempts,
      feedback: p.feedback,
      score_history: Array.isArray(p.score_history) ? p.score_history : [],
      last_attempt_at: p.last_attempt_at,
    }));

    setSubmissions(subs);
    setPerfRecords(perf);
    setLoading(false);
  }

  const STATUS_CONFIG = {
    pending:        { label: t.pending,               icon: <Clock size={13} />,          cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    submitted:      { label: t.stat_under_review,     icon: <Clock size={13} />,          cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    approved:       { label: t.status_approved,       icon: <CheckCircle size={13} />,    cls: 'bg-green-50 text-green-700 border-green-200' },
    rejected:       { label: t.status_rejected,       icon: <XCircle size={13} />,        cls: 'bg-red-50 text-red-700 border-red-200' },
    needs_revision: { label: t.status_needs_revision, icon: <RotateCcw size={13} />,      cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm font-medium">{t.loading_lessons}</span>
      </div>
    );
  }

  if (submissions.length === 0 && perfRecords.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Briefcase size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.task_analytics_title}</h2>
            <p className="text-sm text-gray-500">{t.task_analytics_desc}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Briefcase size={28} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">{t.no_tasks_submitted}</p>
            <p className="text-sm text-gray-400 mt-1">{t.no_tasks_submitted_desc}</p>
          </div>
        </div>
      </div>
    );
  }

  const approved = submissions.filter((s) => s.status === 'approved').length;
  const rejected = submissions.filter((s) => s.status === 'rejected').length;
  const underReview = submissions.filter((s) => s.status === 'submitted').length;
  const needsRevision = submissions.filter((s) => s.status === 'needs_revision').length;

  const reviewedWithScore = submissions.filter((s) => s.score !== null && (s.status === 'approved' || s.status === 'rejected'));
  const avgScore = reviewedWithScore.length > 0
    ? Math.round(reviewedWithScore.reduce((s, r) => s + (r.score ?? 0), 0) / reviewedWithScore.length)
    : null;

  const passedPerf = perfRecords.filter((p) => p.passed).length;
  const completionPct = perfRecords.length > 0 ? Math.round((passedPerf / perfRecords.length) * 100) : 0;

  const perfByTask = new Map(perfRecords.map((p) => [p.task_id, p]));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Briefcase size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.task_analytics_title}</h2>
            <p className="text-sm text-gray-500">{t.task_analytics_desc}</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors shrink-0"
        >
          <RefreshCw size={13} />
          {t.refresh_data}
        </button>
      </div>

      {/* Completion progress */}
      {perfRecords.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={16} className="text-amber-500" />
              <span className="font-semibold text-gray-800 text-sm">{t.practical_task_completion}</span>
            </div>
            <span className="text-2xl font-bold text-amber-600">{completionPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            <span className="font-semibold text-gray-600">{passedPerf}</span> {t.of}{' '}
            <span className="font-semibold text-gray-600">{perfRecords.length}</span> {t.tasks_passed_of}
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t.stat_submitted, value: submissions.length, color: 'text-gray-900' },
          { label: t.stat_approved, value: approved, color: 'text-green-600' },
          { label: t.stat_under_review, value: underReview + needsRevision, color: 'text-amber-600' },
          { label: t.stat_avg_score, value: avgScore !== null ? `${avgScore}/100` : '—', color: avgScore !== null && avgScore >= 60 ? 'text-blue-600' : 'text-gray-900' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-gray-500" />
          <h3 className="font-semibold text-gray-800 text-sm">{t.status_breakdown}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t.status_approved,       count: approved,      cls: 'bg-green-50 border-green-200 text-green-700',  icon: <CheckCircle size={14} /> },
            { label: t.status_rejected,       count: rejected,      cls: 'bg-red-50 border-red-200 text-red-700',        icon: <XCircle size={14} /> },
            { label: t.status_under_review,   count: underReview,   cls: 'bg-amber-50 border-amber-200 text-amber-700',  icon: <Clock size={14} /> },
            { label: t.status_needs_revision, count: needsRevision, cls: 'bg-blue-50 border-blue-200 text-blue-700',     icon: <RotateCcw size={14} /> },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg border p-3 ${s.cls}`}>
              <div className="flex items-center gap-1.5 mb-1">{s.icon}<span className="text-xs font-semibold">{s.label}</span></div>
              <p className="text-2xl font-bold">{s.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed submissions list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <ClipboardCheck size={15} className="text-gray-500" />
          <h3 className="font-semibold text-gray-800 text-sm">{t.submission_history}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {submissions.map((sub) => {
            const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending;
            const perf = perfByTask.get(sub.task_id);
            const isOpen = expandedId === sub.id;
            const hasFeedback = !!sub.feedback;
            const hasScore = sub.score !== null;
            const hasHistory = perf && perf.score_history.length > 1;

            return (
              <div key={sub.id}>
                <button
                  onClick={() => setExpandedId(isOpen ? null : sub.id)}
                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <Briefcase size={15} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{sub.task_title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.submitted_on} {formatDate(sub.submitted_at ?? sub.created_at)}
                      {sub.reviewed_at && ` · ${t.reviewed_on} ${formatDate(sub.reviewed_at)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasScore && <ScorePill score={sub.score!} total={100} />}
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                      {cfg.icon}{cfg.label}
                    </span>
                    {(hasFeedback || hasHistory) && (isOpen ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />)}
                  </div>
                </button>

                {isOpen && (hasFeedback || hasScore || hasHistory) && (
                  <div className="px-5 pb-5 pt-1 bg-gray-50 border-t border-gray-100 space-y-3">
                    {hasFeedback && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={13} className="text-gray-500" />
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t.trainer_feedback_label}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{sub.feedback}</p>
                        {sub.reviewed_at && (
                          <p className="text-xs text-gray-400 mt-2">{t.reviewed_on} {formatDate(sub.reviewed_at)}</p>
                        )}
                      </div>
                    )}

                    {perf && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={13} className="text-gray-500" />
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t.score_history}</span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${perf.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {perf.passed ? t.pass_label : t.fail_label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-700 ${perf.passed ? 'bg-green-500' : 'bg-red-400'}`}
                              style={{ width: `${Math.min(100, perf.score)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-700 shrink-0">{perf.score}/100</span>
                        </div>
                        {perf.score_history.length > 1 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-gray-400 shrink-0">{t.attempts}:</span>
                            {perf.score_history.map((s, i) => {
                              const prev = i > 0 ? perf.score_history[i - 1] : null;
                              const up = prev !== null && s > prev;
                              const down = prev !== null && s < prev;
                              return (
                                <div key={i} className="flex items-center gap-0.5">
                                  {i > 0 && (
                                    <span className={`text-xs font-bold ${up ? 'text-green-500' : down ? 'text-red-400' : 'text-gray-300'}`}>
                                      {up ? '↑' : down ? '↓' : '→'}
                                    </span>
                                  )}
                                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${
                                    s >= 80 ? 'text-green-700 bg-green-50 border-green-200' :
                                    s >= 60 ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                    s >= 40 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                    'text-red-600 bg-red-50 border-red-200'
                                  } ${i === perf.score_history.length - 1 ? 'ring-1 ring-offset-1 ring-gray-300' : ''}`}>
                                    {s}/100
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {perf.attempts} {t.attempts_label} · {formatDate(perf.last_attempt_at)}
                        </p>
                      </div>
                    )}

                    {!hasFeedback && sub.status === 'submitted' && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                        <AlertTriangle size={13} />
                        {t.awaiting_review_msg}
                      </div>
                    )}
                    {!hasFeedback && sub.status === 'needs_revision' && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                        <RotateCcw size={13} />
                        {t.revision_requested_msg}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance records */}
      {perfRecords.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
            <Star size={15} className="text-amber-500" />
            <h3 className="font-semibold text-gray-800 text-sm">{t.reviewed_task_scores}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {perfRecords.map((p) => (
              <div key={p.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${p.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                      {p.passed ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} className="text-red-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{p.task_title}</p>
                      <p className="text-xs text-gray-400">
                        {p.attempts} {t.attempts_label} · {formatDate(p.last_attempt_at)}
                      </p>
                    </div>
                  </div>
                  <ScorePill score={p.score} total={p.total} />
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${p.passed ? 'bg-green-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(100, Math.round((p.score / p.total) * 100))}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${p.passed ? 'text-green-600' : 'text-red-500'}`}>
                    {p.passed ? t.pass_label : t.fail_label}
                  </span>
                </div>
                {p.feedback && (
                  <div className="mt-2.5 flex items-start gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                    <MessageSquare size={12} className="text-gray-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{p.feedback}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

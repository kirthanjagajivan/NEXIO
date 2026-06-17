import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, RotateCcw,
  ChevronDown, ChevronUp, Loader2, Eye, Star, Send,
  FileText, Image as ImageIcon, File as FileIcon, X, AlertCircle,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../i18n/LanguageContext';
import { getSubmissionFileUrl, formatFileSize, getFileIcon, type FileAttachment } from '../../../lib/fileUpload';

type SubmissionStatus = 'submitted' | 'approved' | 'rejected' | 'needs_revision';

interface Submission {
  id: string;
  task_id: string;
  trainee_id: string;
  submission_text: string;
  attachments: FileAttachment[];
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  task_title: string;
  trainee_name: string;
  trainee_email: string;
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; icon: React.ReactNode; classes: string }> = {
  submitted:      { label: 'Pending Review',  icon: <Clock size={13} />,       classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  approved:       { label: 'Approved',        icon: <CheckCircle size={13} />, classes: 'bg-green-500/15 text-green-400 border-green-500/30' },
  rejected:       { label: 'Rejected',        icon: <XCircle size={13} />,     classes: 'bg-red-500/15 text-red-400 border-red-500/30' },
  needs_revision: { label: 'Needs Revision',  icon: <RotateCcw size={13} />,   classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
};

export function SubmissionReviewTab() {
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'all'>('submitted');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const [reviewData, setReviewData] = useState({ status: 'approved' as SubmissionStatus, score: '', feedback: '' });
  const [saving, setSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Single query: join task_submissions → practical_tasks (to verify trainer ownership via RLS)
      // RLS on task_submissions ensures trainer only sees submissions for their own tasks.
      // We embed the task title via a nested select.
      const { data: subs, error: subErr } = await supabase
        .from('task_submissions')
        .select(`
          id,
          task_id,
          trainee_id,
          submission_text,
          attachments,
          status,
          score,
          feedback,
          reviewed_at,
          created_at,
          updated_at,
          practical_tasks ( title )
        `)
        .order('created_at', { ascending: false });

      if (subErr) throw subErr;

      if (!subs || subs.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      // Fetch trainee profiles for display
      const traineeIds = [...new Set(subs.map((s: any) => s.trainee_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', traineeIds);

      const profileMap: Record<string, { full_name: string; email: string }> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });

      const enriched: Submission[] = subs.map((s: any) => ({
        id: s.id,
        task_id: s.task_id,
        trainee_id: s.trainee_id,
        submission_text: s.submission_text ?? '',
        attachments: Array.isArray(s.attachments) ? s.attachments : [],
        status: s.status,
        score: s.score,
        feedback: s.feedback,
        reviewed_at: s.reviewed_at,
        created_at: s.created_at,
        updated_at: s.updated_at,
        task_title: s.practical_tasks?.title ?? 'Unknown Task',
        trainee_name: profileMap[s.trainee_id]?.full_name ?? '',
        trainee_email: profileMap[s.trainee_id]?.email ?? s.trainee_id,
      }));

      setSubmissions(enriched);
    } catch (e: any) {
      console.error('fetchSubmissions error:', e);
      setError(e?.message ?? 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewing) return;
    setSaving(true);
    setReviewError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const score = reviewData.score !== '' ? parseInt(reviewData.score, 10) : null;
      const now = new Date().toISOString();
      const feedbackText = reviewData.feedback.trim() || null;

      // 1. Update the task_submission record
      const { data: updated, error: subError } = await supabase
        .from('task_submissions')
        .update({
          status: reviewData.status,
          score,
          feedback: feedbackText,
          reviewed_at: now,
          reviewed_by: user.id,
        })
        .eq('id', reviewing.id)
        .select('id');

      if (subError) throw subError;
      if (!updated || updated.length === 0) {
        throw new Error('Review could not be saved — check your permissions.');
      }

      // 2. Sync practical_performance for all scored terminal statuses.
      //    Uses upsert with the unique (user_id, task_id) constraint.
      //    Fetch existing first so we can increment attempts and append score_history.
      if (score !== null) {
        const passed = reviewData.status === 'approved';
        const scoreOutOf100 = Math.min(100, Math.max(0, score));

        const { data: existing } = await supabase
          .from('practical_performance')
          .select('id, attempts, score_history')
          .eq('user_id', reviewing.trainee_id)
          .eq('task_id', reviewing.task_id)
          .maybeSingle();

        const prevHistory: number[] = existing?.score_history
          ? (Array.isArray(existing.score_history) ? existing.score_history : Object.values(existing.score_history))
          : [];
        const newAttempts = (existing?.attempts ?? 0) + 1;
        const newHistory = [...prevHistory, scoreOutOf100];

        const { error: perfError } = await supabase
          .from('practical_performance')
          .upsert(
            {
              user_id: reviewing.trainee_id,
              task_id: reviewing.task_id,
              task_title: reviewing.task_title,
              score: scoreOutOf100,
              total: 100,
              passed,
              feedback: feedbackText,
              attempts: newAttempts,
              last_attempt_at: now,
              score_history: newHistory,
            },
            { onConflict: 'user_id,task_id' }
          );

        if (perfError) {
          // Surface the error so trainer sees it, but don't block the review save
          console.error('practical_performance sync error:', perfError);
          setReviewError(`Review saved, but analytics sync failed: ${perfError.message}`);
        }
      }

      await fetchSubmissions();
      setReviewing(null);
    } catch (e: any) {
      console.error('handleReview error:', e);
      setReviewError(e?.message ?? 'Failed to save review. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openReview = (sub: Submission) => {
    setReviewing(sub);
    setReviewError(null);
    setReviewData({
      status: sub.status === 'approved' || sub.status === 'rejected' || sub.status === 'needs_revision'
        ? sub.status
        : 'approved',
      score: sub.score?.toString() ?? '',
      feedback: sub.feedback ?? '',
    });
  };

  const filtered = filterStatus === 'all'
    ? submissions
    : submissions.filter(s => s.status === filterStatus);

  const counts = {
    all:            submissions.length,
    submitted:      submissions.filter(s => s.status === 'submitted').length,
    approved:       submissions.filter(s => s.status === 'approved').length,
    rejected:       submissions.filter(s => s.status === 'rejected').length,
    needs_revision: submissions.filter(s => s.status === 'needs_revision').length,
  };

  const FILTERS = [
    ['all',            'All'],
    ['submitted',      'Pending'],
    ['approved',       'Approved'],
    ['rejected',       'Rejected'],
    ['needs_revision', 'Needs Revision'],
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{t.review_submissions}</h1>
        <p className="text-slate-400 mt-1">{t.review_submissions_desc}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(([status, label]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filterStatus === status ? 'bg-amber-700 text-amber-100' : 'bg-slate-700 text-slate-400'
            }`}>
              {counts[status]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-slate-500" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 px-4 py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button onClick={fetchSubmissions} className="ml-auto text-xs underline text-red-300">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/60 p-12 text-center">
          <CheckCircle size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">{t.no_submissions}</p>
          {filterStatus !== 'all' && (
            <p className="text-slate-500 text-sm mt-1">
              {submissions.length > 0
                ? `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} in other tabs`
                : 'No submissions received yet'}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              expanded={expandedId === sub.id}
              onToggle={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              onOpenReview={() => openReview(sub)}
            />
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewing && (
        <ReviewModal
          submission={reviewing}
          reviewData={reviewData}
          setReviewData={setReviewData}
          saving={saving}
          error={reviewError}
          onClose={() => { setReviewing(null); setReviewError(null); }}
          onSubmit={handleReview}
        />
      )}
    </div>
  );
}

function SubmissionCard({
  submission, expanded, onToggle, onOpenReview,
}: {
  submission: Submission;
  expanded: boolean;
  onToggle: () => void;
  onOpenReview: () => void;
}) {
  const { t } = useLanguage();
  const cfg = STATUS_CONFIG[submission.status];
  const displayName = submission.trainee_name || submission.trainee_email;
  const initials = displayName
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="bg-[#1E293B] rounded-xl border border-slate-700/60 overflow-hidden hover:border-slate-600 transition-colors">
      <div className="px-5 py-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-amber-700 font-bold text-sm">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{displayName}</p>
              <p className="text-sm text-slate-400 truncate">{submission.task_title}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(submission.created_at).toLocaleDateString(undefined, {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
                {submission.attachments.length > 0 &&
                  ` · ${submission.attachments.length} file${submission.attachments.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-medium ${cfg.classes}`}>
                {cfg.icon}
                {cfg.label}
              </span>
              {submission.score !== null && (
                <span className="flex items-center gap-1 text-xs font-bold text-slate-200 bg-slate-700 px-2 py-1 rounded-full">
                  <Star size={11} className="text-amber-500" />
                  {submission.score}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenReview}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              submission.status === 'submitted'
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <Eye size={13} />
            {submission.status === 'submitted' ? t.review : 'Update'}
          </button>
          <button
            onClick={onToggle}
            className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-700/60 bg-slate-900/40 space-y-4">
          {submission.submission_text && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t.submission_text}</p>
              <p className="text-sm text-slate-300 whitespace-pre-line bg-slate-800 rounded-lg border border-slate-700 px-4 py-3">
                {submission.submission_text}
              </p>
            </div>
          )}

          {submission.attachments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t.attachments}</p>
              <SubmissionAttachmentList attachments={submission.attachments} />
            </div>
          )}

          {submission.feedback && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t.feedback}</p>
              <p className="text-sm text-slate-300 bg-slate-800 rounded-lg border border-slate-700 px-4 py-3">
                {submission.feedback}
              </p>
            </div>
          )}

          {submission.reviewed_at && (
            <p className="text-xs text-slate-500">
              Reviewed {new Date(submission.reviewed_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewModal({
  submission, reviewData, setReviewData, saving, error, onClose, onSubmit,
}: {
  submission: Submission;
  reviewData: { status: SubmissionStatus; score: string; feedback: string };
  setReviewData: React.Dispatch<React.SetStateAction<{ status: SubmissionStatus; score: string; feedback: string }>>;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
          <div>
            <h2 className="text-lg font-bold text-white">{t.review_submission}</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {submission.trainee_name || submission.trainee_email} · {submission.task_title}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Submission preview */}
          {submission.submission_text && (
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{t.submission_text}</p>
              <p className="text-sm text-slate-300 line-clamp-4 whitespace-pre-line">{submission.submission_text}</p>
            </div>
          )}

          {/* Decision */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Decision</label>
            <div className="grid grid-cols-3 gap-2">
              {(['approved', 'needs_revision', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setReviewData(d => ({ ...d, status }))}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    reviewData.status === status
                      ? status === 'approved'       ? 'bg-green-600 text-white border-green-600'
                        : status === 'rejected'     ? 'bg-red-600 text-white border-red-600'
                        :                             'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {STATUS_CONFIG[status].icon}
                  {STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>
          </div>

          {/* Score */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              {t.score} <span className="text-slate-500 font-normal">(optional, 0–100)</span>
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={reviewData.score}
              onChange={(e) => setReviewData(d => ({ ...d, score: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
              placeholder="e.g. 85"
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              {t.feedback} <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={reviewData.feedback}
              onChange={(e) => setReviewData(d => ({ ...d, feedback: e.target.value }))}
              rows={4}
              className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
              placeholder="Provide feedback to the trainee about their submission…"
            />
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-3 flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex gap-3 px-6 py-4 border-t border-slate-700/60">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm"
          >
            {t.cancel}
          </button>
          <button
            onClick={onSubmit}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors font-medium text-sm"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {saving ? t.saving : t.submit_review}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmissionAttachmentList({ attachments }: { attachments: FileAttachment[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    Promise.all(
      attachments.map(async (att) => {
        try { return [att.path, await getSubmissionFileUrl(att.path)] as const; }
        catch { return [att.path, ''] as const; }
      })
    ).then((pairs) => { if (mounted) setUrls(Object.fromEntries(pairs)); });
    return () => { mounted = false; };
  }, [attachments]);

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((att, i) => {
        const icon = getFileIcon(att.type);
        const url = urls[att.path];
        const chip = (
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors cursor-pointer">
            {icon === 'pdf'   && <FileText   size={14} className="text-red-500 shrink-0" />}
            {icon === 'image' && <ImageIcon  size={14} className="text-blue-500 shrink-0" />}
            {(icon === 'doc' || icon === 'txt') && <FileIcon size={14} className="text-slate-500 shrink-0" />}
            <span className="text-slate-300 max-w-[160px] truncate">{att.name}</span>
            <span className="text-slate-500 text-xs shrink-0">{formatFileSize(att.size)}</span>
          </div>
        );
        return url
          ? <a key={i} href={url} target="_blank" rel="noopener noreferrer">{chip}</a>
          : <div key={i}>{chip}</div>;
      })}
    </div>
  );
}

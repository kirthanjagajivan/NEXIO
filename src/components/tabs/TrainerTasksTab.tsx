import { useState, useEffect, useRef } from 'react';
import {
  Briefcase, ChevronDown, ChevronUp, Upload, Loader2,
  CheckCircle, Clock, XCircle, RotateCcw, Send, X,
  FileText, Image as ImageIcon, File as FileIcon, Star,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  uploadSubmissionFile, getTaskAttachmentUrl, getSubmissionFileUrl,
  formatFileSize, getFileIcon, isAcceptedType,
  type FileAttachment,
} from '../../lib/fileUpload';

interface Task {
  id: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: string;
  estimated_duration_minutes: number;
  attachments: FileAttachment[];
}

interface Submission {
  id: string;
  task_id: string;
  status: 'submitted' | 'approved' | 'rejected' | 'needs_revision';
  submission_text: string;
  attachments: FileAttachment[];
  score: number | null;
  feedback: string | null;
  created_at: string;
}

const DIFF_BADGE: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

const STATUS_CFG = {
  submitted: { label: 'Pending Review', icon: <Clock size={13} />, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', icon: <CheckCircle size={13} />, cls: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', icon: <XCircle size={13} />, cls: 'bg-red-50 text-red-700 border-red-200' },
  needs_revision: { label: 'Needs Revision', icon: <RotateCcw size={13} />, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export function TrainerTasksTab() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [submittingFor, setSubmittingFor] = useState<Task | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: tasksData, error: tErr } = await supabase
        .from('practical_tasks')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (tErr) throw tErr;

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const { data: subsData, error: sErr } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('trainee_id', userId);

      if (sErr) throw sErr;

      setTasks((tasksData || []).map((tk: any) => ({
        ...tk,
        attachments: Array.isArray(tk.attachments) ? tk.attachments : [],
      })));
      setSubmissions((subsData || []).map((s: any) => ({
        ...s,
        attachments: Array.isArray(s.attachments) ? s.attachments : [],
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submissionMap = Object.fromEntries(submissions.map(s => [s.task_id, s]));

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={28} className="animate-spin text-gray-300" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t.trainer_tasks}</h2>
        <p className="text-sm text-gray-500 mt-1">{t.practical_training_desc}</p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Briefcase size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium">{t.no_tasks}</p>
        </div>
      ) : (
        tasks.map((task) => {
          const sub = submissionMap[task.id];
          return (
            <TaskRow
              key={task.id}
              task={task}
              submission={sub ?? null}
              expanded={expandedTask === task.id}
              onToggle={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              onOpenSubmit={() => setSubmittingFor(task)}
              onRefresh={fetchData}
            />
          );
        })
      )}

      {submittingFor && (
        <SubmitModal
          task={submittingFor}
          existingSubmission={submissionMap[submittingFor.id] ?? null}
          onClose={() => setSubmittingFor(null)}
          onSuccess={() => { setSubmittingFor(null); fetchData(); }}
        />
      )}
    </div>
  );
}

function TaskRow({
  task, submission, expanded, onToggle, onOpenSubmit,
}: {
  task: Task;
  submission: Submission | null;
  expanded: boolean;
  onToggle: () => void;
  onOpenSubmit: () => void;
  onRefresh: () => void;
}) {
  const { t } = useLanguage();
  const sub = submission;
  const statusCfg = sub ? STATUS_CFG[sub.status] : null;
  const canSubmit = !sub || sub.status === 'needs_revision';

  return (
    <div className={`rounded-xl border overflow-hidden transition-shadow hover:shadow-sm ${sub?.status === 'approved' ? 'border-green-200 bg-green-50/20' : 'border-gray-200 bg-white'}`}>
      <div className="px-5 py-4 flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${sub?.status === 'approved' ? 'bg-green-100' : 'bg-amber-50'}`}>
          <Briefcase size={18} className={sub?.status === 'approved' ? 'text-green-600' : 'text-amber-600'} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_BADGE[task.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                  {task.difficulty}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {task.estimated_duration_minutes} {t.minutes}
                {task.attachments.length > 0 && ` · ${task.attachments.length} file${task.attachments.length !== 1 ? 's' : ''}`}
              </p>
              {task.description && <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{task.description}</p>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {statusCfg && (
                <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-medium ${statusCfg.cls}`}>
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              )}
              {sub?.score !== undefined && sub?.score !== null && (
                <span className="flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  <Star size={11} className="text-amber-500" />
                  {sub.score}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {canSubmit && (
            <button
              onClick={onOpenSubmit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Send size={12} />
              {sub ? t.resubmit || 'Resubmit' : t.submit_task}
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-gray-100 bg-gray-50/30 space-y-4">
          {task.instructions && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.task_instructions}</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{task.instructions}</p>
            </div>
          )}

          {task.attachments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.trainer_materials || 'Trainer Materials'}</p>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((att, i) => {
                  const url = getTaskAttachmentUrl(att.path);
                  const icon = getFileIcon(att.type);
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-amber-300 hover:bg-amber-50 transition-colors"
                    >
                      {icon === 'pdf' && <FileText size={14} className="text-red-500 shrink-0" />}
                      {icon === 'image' && <ImageIcon size={14} className="text-blue-500 shrink-0" />}
                      {(icon === 'doc' || icon === 'txt') && <FileIcon size={14} className="text-gray-400 shrink-0" />}
                      <span className="text-gray-700 max-w-[160px] truncate">{att.name}</span>
                      <span className="text-xs text-gray-400">{formatFileSize(att.size)}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {sub && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.my_submission || 'My Submission'}</p>
              {sub.submission_text && (
                <p className="text-sm text-gray-700 bg-white rounded-lg border border-gray-200 px-4 py-3 mb-3 whitespace-pre-line">
                  {sub.submission_text}
                </p>
              )}
              <SubmissionAttachments attachments={sub.attachments} />
              {sub.feedback && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-700 mb-1">{t.trainer_feedback || 'Trainer Feedback'}</p>
                  <p className="text-sm text-blue-800">{sub.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubmissionAttachments({ attachments }: { attachments: FileAttachment[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (attachments.length === 0) return;
    let mounted = true;
    Promise.all(
      attachments.map(async (att) => {
        try { return [att.path, await getSubmissionFileUrl(att.path)] as const; }
        catch { return [att.path, ''] as const; }
      })
    ).then((pairs) => { if (mounted) setUrls(Object.fromEntries(pairs)); });
    return () => { mounted = false; };
  }, [attachments]);

  if (attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((att, i) => {
        const icon = getFileIcon(att.type);
        const url = urls[att.path];
        const chip = (
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
            {icon === 'pdf' && <FileText size={14} className="text-red-500 shrink-0" />}
            {icon === 'image' && <ImageIcon size={14} className="text-blue-500 shrink-0" />}
            {(icon === 'doc' || icon === 'txt') && <FileIcon size={14} className="text-gray-400 shrink-0" />}
            <span className="text-gray-700 max-w-[140px] truncate">{att.name}</span>
            <span className="text-xs text-gray-400">{formatFileSize(att.size)}</span>
          </div>
        );
        return url
          ? <a key={i} href={url} target="_blank" rel="noopener noreferrer">{chip}</a>
          : <div key={i}>{chip}</div>;
      })}
    </div>
  );
}

function SubmitModal({
  task, existingSubmission, onClose, onSuccess,
}: {
  task: Task;
  existingSubmission: Submission | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [text, setText] = useState(existingSubmission?.submission_text ?? '');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).filter(isAcceptedType);
    setFiles(prev => [...prev, ...selected]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!text.trim() && files.length === 0) return;
    setUploading(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('Not authenticated');

      // Upload files
      const uploaded: FileAttachment[] = [];
      for (const file of files) {
        setUploadStep(`Uploading ${file.name}…`);
        const att = await uploadSubmissionFile(file, userId, task.id);
        uploaded.push(att);
      }

      setUploadStep('Saving submission…');

      if (existingSubmission) {
        const mergedAttachments = [
          ...(existingSubmission.attachments ?? []),
          ...uploaded,
        ];
        const { error } = await supabase
          .from('task_submissions')
          .update({
            submission_text: text,
            attachments: mergedAttachments,
            status: 'submitted',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSubmission.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('task_submissions')
          .insert([{
            task_id: task.id,
            trainee_id: userId,
            submission_text: text,
            attachments: uploaded,
            status: 'submitted',
          }]);
        if (error) throw error;
      }

      onSuccess();
    } catch (e: any) {
      console.error(e);
    } finally {
      setUploading(false);
      setUploadStep('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {existingSubmission ? t.resubmit || 'Resubmit Task' : t.submit_task}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{task.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Text response */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.submission_text || 'Your Response'}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
              placeholder="Describe what you did, your findings, observations…"
            />
          </div>

          {/* File uploads */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.attach_files || 'Attach Files'}
              {files.length > 0 && <span className="text-gray-400 font-normal ml-1">({files.length})</span>}
            </label>

            {files.map((file, i) => {
              const icon = getFileIcon(file.type);
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                  {icon === 'pdf' && <FileText size={15} className="text-red-500 shrink-0" />}
                  {icon === 'image' && <ImageIcon size={15} className="text-blue-500 shrink-0" />}
                  {(icon === 'doc' || icon === 'txt') && <FileIcon size={15} className="text-gray-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-amber-600">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => setFiles(f => f.filter((_, j) => j !== i))}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors text-sm font-medium"
            >
              <Upload size={18} />
              {t.upload_files || 'Attach files (PDF, images, documents)'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
          {uploadStep && (
            <p className="flex-1 text-xs text-gray-500 flex items-center gap-2 self-center">
              <Loader2 size={12} className="animate-spin" />
              {uploadStep}
            </p>
          )}
          {!uploadStep && <span className="flex-1" />}
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || (!text.trim() && files.length === 0)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {uploading ? t.submitting || 'Submitting…' : t.submit_task}
          </button>
        </div>
      </div>
    </div>
  );
}

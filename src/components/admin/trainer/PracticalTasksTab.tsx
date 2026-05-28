import { useState, useEffect, useRef } from 'react';
import { Plus, CreditCard as Edit2, Trash2, X, Save, RefreshCw, BookOpen, Upload, FileText, Image as ImageIcon, File as FileIcon, CheckCircle, Eye, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  uploadTaskAttachment, deleteTaskAttachment, getTaskAttachmentUrl,
  formatFileSize, getFileIcon, isAcceptedType,
  type FileAttachment,
} from '../../../lib/fileUpload';

interface PracticalTask {
  id: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: string;
  estimated_duration_minutes: number;
  is_published: boolean;
  attachments: FileAttachment[];
  trainer_id: string | null;
  created_at: string;
}

interface FormData {
  title: string;
  description: string;
  instructions: string;
  difficulty: string;
  estimated_duration_minutes: number;
  is_published: boolean;
}

const EMPTY_FORM: FormData = {
  title: '',
  description: '',
  instructions: '',
  difficulty: 'intermediate',
  estimated_duration_minutes: 30,
  is_published: true,
};

export function PracticalTasksTab() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<PracticalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<PracticalTask | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<FileAttachment[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('practical_tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(
        (data || []).map((t: any) => ({
          ...t,
          attachments: Array.isArray(t.attachments) ? t.attachments : [],
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setFormData(EMPTY_FORM);
    setPendingFiles([]);
    setExistingAttachments([]);
    setShowModal(true);
  };

  const openEdit = (task: PracticalTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      difficulty: task.difficulty,
      estimated_duration_minutes: task.estimated_duration_minutes,
      is_published: task.is_published,
    });
    setPendingFiles([]);
    setExistingAttachments(task.attachments ?? []);
    setShowModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(isAcceptedType);
    setPendingFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingFile = (index: number) =>
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));

  const removeExistingAttachment = async (attachment: FileAttachment) => {
    try {
      await deleteTaskAttachment(attachment.path);
    } catch (_) { /* ignore storage errors */ }
    setExistingAttachments((prev) => prev.filter((a) => a.path !== attachment.path));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    setSaving(true);
    try {
      let taskId = editingTask?.id;

      if (editingTask) {
        const { error } = await supabase
          .from('practical_tasks')
          .update({ ...formData, attachments: existingAttachments })
          .eq('id', editingTask.id);
        if (error) throw error;
      } else {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const { data, error } = await supabase
          .from('practical_tasks')
          .insert([{ ...formData, trainer_id: userId, attachments: [] }])
          .select()
          .single();
        if (error) throw error;
        taskId = data.id;
      }

      // Upload pending files
      if (pendingFiles.length > 0 && taskId) {
        const uploaded: FileAttachment[] = [...existingAttachments];
        for (const file of pendingFiles) {
          setUploadProgress(`Uploading ${file.name}…`);
          const att = await uploadTaskAttachment(file, taskId);
          uploaded.push(att);
        }
        await supabase
          .from('practical_tasks')
          .update({ attachments: uploaded })
          .eq('id', taskId);
      }

      setUploadProgress(null);
      await fetchTasks();
      setShowModal(false);
    } catch (e: any) {
      console.error(e);
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (task: PracticalTask) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      // Remove storage files
      for (const att of task.attachments ?? []) {
        try { await deleteTaskAttachment(att.path); } catch (_) {}
      }
      const { error } = await supabase.from('practical_tasks').delete().eq('id', task.id);
      if (error) throw error;
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const difficultyBadge: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-amber-100 text-amber-700',
    advanced: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.practical_tasks}</h1>
          <p className="text-gray-500 mt-1">{t.manage_practical_tasks}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus size={16} />
          {t.create_task}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-amber-400" />
          </div>
          <p className="text-gray-600 font-semibold text-lg">{t.no_tasks}</p>
          <p className="text-gray-400 text-sm mt-1">{t.create_first_task}</p>
          <button
            onClick={openCreate}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <Plus size={15} />
            {t.create_task}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              expanded={expandedTask === task.id}
              onToggle={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              onEdit={() => openEdit(task)}
              onDelete={() => handleDelete(task)}
              difficultyBadge={difficultyBadge}
            />
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          formData={formData}
          setFormData={setFormData}
          pendingFiles={pendingFiles}
          existingAttachments={existingAttachments}
          onFileSelect={handleFileSelect}
          onRemovePending={removePendingFile}
          onRemoveExisting={removeExistingAttachment}
          fileInputRef={fileInputRef}
          saving={saving}
          uploadProgress={uploadProgress}
          editing={!!editingTask}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TaskCard({
  task, expanded, onToggle, onEdit, onDelete, difficultyBadge,
}: {
  task: PracticalTask;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  difficultyBadge: Record<string, string>;
}) {
  const { t } = useLanguage();
  const [submissionCount, setSubmissionCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('task_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('task_id', task.id)
      .then(({ count }) => setSubmissionCount(count ?? 0));
  }, [task.id]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
      <div className="px-6 py-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
          <BookOpen size={20} className="text-amber-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyBadge[task.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                  {task.difficulty}
                </span>
                {!task.is_published && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {task.estimated_duration_minutes} {t.minutes}
                {task.attachments?.length > 0 && ` · ${task.attachments.length} file${task.attachments.length !== 1 ? 's' : ''}`}
                {submissionCount !== null && ` · ${submissionCount} submission${submissionCount !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onToggle}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="View details"
              >
                {expanded ? <ChevronUp size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {task.description && !expanded && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-1">{task.description}</p>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-5 pt-0 border-t border-gray-100 bg-gray-50/50 space-y-4">
          {task.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-700">{task.description}</p>
            </div>
          )}

          {task.instructions && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t.task_instructions}</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{task.instructions}</p>
            </div>
          )}

          {task.attachments?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.attachments}</p>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((att, i) => (
                  <AttachmentChip key={i} attachment={att} bucket="task-attachments" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AttachmentChip({ attachment, bucket }: { attachment: FileAttachment; bucket: 'task-attachments' | 'task-submissions' }) {
  const icon = getFileIcon(attachment.type);
  const url = bucket === 'task-attachments' ? getTaskAttachmentUrl(attachment.path) : null;

  const content = (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer">
      {icon === 'pdf' && <FileText size={14} className="text-red-500 shrink-0" />}
      {icon === 'image' && <ImageIcon size={14} className="text-blue-500 shrink-0" />}
      {(icon === 'doc' || icon === 'txt') && <FileIcon size={14} className="text-gray-500 shrink-0" />}
      <span className="text-gray-700 max-w-[160px] truncate">{attachment.name}</span>
      <span className="text-gray-400 text-xs shrink-0">{formatFileSize(attachment.size)}</span>
    </div>
  );

  if (url) {
    return <a href={url} target="_blank" rel="noopener noreferrer">{content}</a>;
  }
  return content;
}

function TaskModal({
  formData, setFormData, pendingFiles, existingAttachments,
  onFileSelect, onRemovePending, onRemoveExisting,
  fileInputRef, saving, uploadProgress, editing, onClose, onSave,
}: {
  formData: FormData;
  setFormData: (d: FormData) => void;
  pendingFiles: File[];
  existingAttachments: FileAttachment[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePending: (i: number) => void;
  onRemoveExisting: (a: FileAttachment) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  saving: boolean;
  uploadProgress: string | null;
  editing: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t } = useLanguage();
  const allFileCount = existingAttachments.length + pendingFiles.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {editing ? t.edit_task : t.create_task}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.task_title} *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
              placeholder="e.g. Machine Safety Inspection Checklist"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.task_description}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm resize-none"
              placeholder="Brief overview of what trainees will learn or do…"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.task_instructions}</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={5}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
              placeholder="Step-by-step instructions, safety guidelines, expected outcomes…"
            />
          </div>

          {/* Difficulty + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.difficulty_level}</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
              >
                <option value="beginner">{t.beginner}</option>
                <option value="intermediate">{t.intermediate}</option>
                <option value="advanced">{t.advanced}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.estimated_duration} ({t.minutes})</label>
              <input
                type="number"
                value={formData.estimated_duration_minutes}
                onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: Math.max(5, parseInt(e.target.value) || 5) })}
                min={5}
                max={480}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Published toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_published ? 'bg-amber-500' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.is_published ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {formData.is_published ? t.published || 'Published — visible to trainees' : t.draft || 'Draft — hidden from trainees'}
            </span>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.attachments} {allFileCount > 0 && <span className="text-gray-400 font-normal">({allFileCount})</span>}
            </label>

            {/* Existing files */}
            {existingAttachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {existingAttachments.map((att, i) => (
                  <ExistingFileRow key={i} attachment={att} onRemove={() => onRemoveExisting(att)} />
                ))}
              </div>
            )}

            {/* Pending files */}
            {pendingFiles.length > 0 && (
              <div className="space-y-2 mb-3">
                {pendingFiles.map((file, i) => (
                  <PendingFileRow key={i} file={file} onRemove={() => onRemovePending(i)} />
                ))}
              </div>
            )}

            {/* Drop zone */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 p-5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            >
              <Upload size={22} />
              <span className="text-sm font-medium">{t.upload_files || 'Click to upload files'}</span>
              <span className="text-xs">{t.upload_files_hint || 'PDF, Images, Word documents, Text files (max 50 MB each)'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.txt"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
          {uploadProgress && (
            <p className="flex-1 text-xs text-gray-500 flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              {uploadProgress}
            </p>
          )}
          {!uploadProgress && <span className="flex-1" />}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            {t.cancel}
          </button>
          <button
            onClick={onSave}
            disabled={saving || !formData.title.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExistingFileRow({ attachment, onRemove }: { attachment: FileAttachment; onRemove: () => void }) {
  const icon = getFileIcon(attachment.type);
  const url = getTaskAttachmentUrl(attachment.path);
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
      {icon === 'pdf' && <FileText size={16} className="text-red-500 shrink-0" />}
      {icon === 'image' && <ImageIcon size={16} className="text-blue-500 shrink-0" />}
      {(icon === 'doc' || icon === 'txt') && <FileIcon size={16} className="text-gray-400 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
        <p className="text-xs text-gray-400">{formatFileSize(attachment.size)}</p>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
        <Eye size={14} />
      </a>
      <button onClick={onRemove} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

function PendingFileRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  const icon = getFileIcon(file.type);
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
      {icon === 'pdf' && <FileText size={16} className="text-red-500 shrink-0" />}
      {icon === 'image' && <ImageIcon size={16} className="text-blue-500 shrink-0" />}
      {(icon === 'doc' || icon === 'txt') && <FileIcon size={16} className="text-gray-400 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-amber-600">{formatFileSize(file.size)} · {t_pending()}</p>
      </div>
      <button onClick={onRemove} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

function t_pending() { return 'Pending upload'; }

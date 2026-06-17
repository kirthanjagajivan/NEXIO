import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, BookOpen, ChevronRight, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { ConfirmModal } from './Modal';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Chapter, Topic } from './useAdminData';

interface ManageChaptersTabProps {
  chapters: Chapter[];
  topics: Topic[];
  loading: boolean;
  error: string | null;
  onAdd: (title: string, description: string) => Promise<void>;
  onUpdate: (id: string, title: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ManageChaptersTab({ chapters, topics, loading, error, onAdd, onUpdate, onDelete }: ManageChaptersTabProps) {
  const { t } = useLanguage();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  async function handleAdd() {
    if (adding) return;
    setAdding(true);
    const nextNumber = chapters.length + 1;
    const autoTitle = `Chapter ${nextNumber}`;
    try {
      await onAdd(autoTitle, '');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(chapter: Chapter) {
    setEditingId(chapter.id);
    setEditTitle(chapter.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
  }

  async function commitEdit(chapter: Chapter) {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === chapter.title) {
      cancelEdit();
      return;
    }
    setSavingId(chapter.id);
    try {
      await onUpdate(chapter.id, trimmed, chapter.description);
    } finally {
      setSavingId(null);
      setEditingId(null);
      setEditTitle('');
    }
  }

  function handleEditKeyDown(e: React.KeyboardEvent, chapter: Chapter) {
    if (e.key === 'Enter') commitEdit(chapter);
    if (e.key === 'Escape') cancelEdit();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.chapters_heading}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{chapters.length} {t.chapters_stat} total</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
        >
          {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {t.add_chapter}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {chapters.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} className="text-gray-300" />}
          title={t.no_chapters_yet}
          description={t.no_chapters_desc}
          action={
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <Plus size={16} />
              {t.add_chapter}
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter, index) => {
            const topicCount = topics.filter((tp) => tp.chapter_id === chapter.id).length;
            const isEditing = editingId === chapter.id;
            const isSaving = savingId === chapter.id;

            return (
              <div
                key={chapter.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-blue-700 font-bold text-sm">{index + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, chapter)}
                          className="flex-1 px-3 py-1.5 border border-blue-400 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                          onClick={() => commitEdit(chapter)}
                          disabled={isSaving}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                          title="Save"
                        >
                          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Cancel"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <h3
                          className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => startEdit(chapter)}
                          title={t.click_to_rename}
                        >
                          {chapter.title}
                        </h3>
                        <span className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.click_to_rename}
                        </span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <ChevronRight size={12} />
                        <span>{topicCount} {t.topics_count}</span>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => setDeleteTarget(chapter)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title={t.delete_chapter}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={t.delete_chapter}
          message={t.delete_chapter_confirm}
          confirmLabel={t.delete_confirm}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

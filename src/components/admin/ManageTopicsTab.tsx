import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, AlertCircle, FolderOpen, Check, X } from 'lucide-react';
import { ConfirmModal } from './Modal';
import { EmptyState } from './ManageChaptersTab';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Chapter, Topic, TopicContent } from './useAdminData';

interface ManageTopicsTabProps {
  chapters: Chapter[];
  topics: Topic[];
  topicContents: TopicContent[];
  loading: boolean;
  error: string | null;
  onAdd: (chapterId: string, title: string, description: string) => Promise<void>;
  onUpdate: (id: string, title: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ManageTopicsTab({ chapters, topics, topicContents, loading, error, onAdd, onUpdate, onDelete }: ManageTopicsTabProps) {
  const { t } = useLanguage();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [addingChapterId, setAddingChapterId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  function toggleChapter(chapterId: string) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  }

  async function handleAdd(chapterId: string) {
    if (addingChapterId) return;
    setAddingChapterId(chapterId);
    setExpandedChapters((prev) => new Set([...prev, chapterId]));
    const chapterTopics = topics.filter((tp) => tp.chapter_id === chapterId);
    const nextNumber = chapterTopics.length + 1;
    const autoTitle = `Topic ${nextNumber}`;
    try {
      await onAdd(chapterId, autoTitle, '');
    } finally {
      setAddingChapterId(null);
    }
  }

  function startEdit(topic: Topic) {
    setEditingId(topic.id);
    setEditTitle(topic.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
  }

  async function commitEdit(topic: Topic) {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === topic.title) {
      cancelEdit();
      return;
    }
    setSavingId(topic.id);
    try {
      await onUpdate(topic.id, trimmed, topic.description);
    } finally {
      setSavingId(null);
      setEditingId(null);
      setEditTitle('');
    }
  }

  function handleEditKeyDown(e: React.KeyboardEvent, topic: Topic) {
    if (e.key === 'Enter') commitEdit(topic);
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

  const totalTopics = topics.length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">{t.topics_heading}</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {totalTopics} {t.topics_stat} / {chapters.length} {t.chapters_stat}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {chapters.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={32} className="text-slate-600" />}
          title={t.no_chapters_for_topics}
          description={t.no_chapters_for_topics_desc}
        />
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter) => {
            const chapterTopics = topics.filter((tp) => tp.chapter_id === chapter.id);
            const isExpanded = expandedChapters.has(chapter.id);
            const isAdding = addingChapterId === chapter.id;

            return (
              <div key={chapter.id} className="bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden">
                <div className="flex items-center px-5 py-4 hover:bg-slate-800/50 transition-colors gap-3">
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-start"
                  >
                    <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <FolderOpen size={16} className="text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{chapter.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{chapterTopics.length} {t.topics_count}</p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAdd(chapter.id)}
                      disabled={isAdding}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60"
                      title={t.add_topic}
                    >
                      {isAdding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    </button>
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-700/60">
                    {chapterTopics.length === 0 ? (
                      <div className="px-5 py-6 text-center">
                        <p className="text-sm text-slate-500 mb-3">{t.no_topics_in_chapter_admin}</p>
                        <button
                          onClick={() => handleAdd(chapter.id)}
                          disabled={isAdding}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-500/30 transition-colors disabled:opacity-60"
                        >
                          {isAdding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                          {t.add_first_topic}
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-700/50">
                        {chapterTopics.map((topic, index) => {
                          const hasContent = topicContents.some((c) => c.topic_id === topic.id);
                          const isEditing = editingId === topic.id;
                          const isSaving = savingId === topic.id;

                          return (
                            <div key={topic.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/40 transition-colors group">
                              <div className="w-6 h-6 bg-slate-700 rounded-md flex items-center justify-center shrink-0">
                                <span className="text-slate-400 text-xs font-semibold">{index + 1}</span>
                              </div>

                              <div className="flex-1 min-w-0">
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      ref={editInputRef}
                                      type="text"
                                      value={editTitle}
                                      onChange={(e) => setEditTitle(e.target.value)}
                                      onKeyDown={(e) => handleEditKeyDown(e, topic)}
                                      className="flex-1 px-2.5 py-1 border border-blue-500 bg-[#0F172A] rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                                    />
                                    <button
                                      onClick={() => commitEdit(topic)}
                                      disabled={isSaving}
                                      className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-60"
                                      title="Save"
                                    >
                                      {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                                      title="Cancel"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 min-w-0">
                                    <p
                                      className="text-sm font-medium text-slate-200 truncate cursor-pointer hover:text-blue-400 transition-colors"
                                      onClick={() => startEdit(topic)}
                                      title={t.click_to_rename}
                                    >
                                      {topic.title}
                                    </p>
                                    <span className="text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                      {t.click_to_rename}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {!isEditing && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${hasContent ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                                    {hasContent ? t.has_content : t.no_content}
                                  </span>
                                  <button
                                    onClick={() => setDeleteTarget(topic)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                    title={t.delete_topic}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={t.delete_topic}
          message={t.delete_topic_confirm}
          confirmLabel={t.delete_confirm}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

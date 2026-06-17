import { useState, useRef } from 'react';
import {
  Upload, Save, FileText, CheckCircle, Loader2, AlertCircle,
  FolderOpen, ChevronRight, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import { EmptyState } from './ManageChaptersTab';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Chapter, Topic, TopicContent } from './useAdminData';
import type { Language } from '../../i18n/translations';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'German' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ar', label: 'Arabic' },
  { code: 'ru', label: 'Russian' },
];

interface UploadContentTabProps {
  chapters: Chapter[];
  topics: Topic[];
  topicContents: TopicContent[];
  loading: boolean;
  onSave: (topicId: string, content: string, language: string) => Promise<void>;
}

export function UploadContentTab({ chapters, topics, topicContents, loading, onSave }: UploadContentTabProps) {
  const { t } = useLanguage();
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null;
  const selectedChapter = selectedTopic ? chapters.find((c) => c.id === selectedTopic.chapter_id) : null;
  const existingContent = selectedTopicId
    ? topicContents.find((c) => c.topic_id === selectedTopicId && c.language === selectedLanguage)
    : null;
  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  function selectTopic(topicId: string) {
    setSelectedTopicId(topicId);
    setSaved(false);
    setSaveError(null);
    const existing = topicContents.find((c) => c.topic_id === topicId && c.language === selectedLanguage);
    setContent(existing?.content ?? '');
    setPreview(false);
  }

  function handleLanguageChange(lang: Language) {
    setSelectedLanguage(lang);
    setSaved(false);
    setSaveError(null);
    if (selectedTopicId) {
      const existing = topicContents.find((c) => c.topic_id === selectedTopicId && c.language === lang);
      setContent(existing?.content ?? '');
      setPreview(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setContent(text);
      setSaved(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleSave() {
    if (!selectedTopicId || !content.trim()) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await onSave(selectedTopicId, content, selectedLanguage);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save content');
    } finally {
      setSaving(false);
    }
  }

  function langHasContent(topicId: string, lang: Language) {
    return topicContents.some((c) => c.topic_id === topicId && c.language === lang && c.content.trim().length > 0);
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
      <div>
        <h2 className="text-xl font-bold text-white">{t.upload_content_heading}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{t.upload_content_sub}</p>
      </div>

      {chapters.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={32} className="text-slate-600" />}
          title={t.no_chapters_or_topics}
          description={t.no_chapters_or_topics_desc}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/60 bg-slate-900/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t.select_topic}</p>
              </div>
              <div className="divide-y divide-slate-700/40 max-h-[420px] overflow-y-auto">
                {chapters.map((chapter) => {
                  const chapterTopics = topics.filter((t) => t.chapter_id === chapter.id);
                  if (chapterTopics.length === 0) return null;
                  return (
                    <div key={chapter.id}>
                      <div className="px-4 py-2.5 bg-slate-900/40">
                        <div className="flex items-center gap-2">
                          <FolderOpen size={13} className="text-slate-500" />
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate">{chapter.title}</p>
                        </div>
                      </div>
                      {chapterTopics.map((topic) => {
                        const hasAnyContent = LANGUAGES.some((l) => langHasContent(topic.id, l.code));
                        const isSelected = selectedTopicId === topic.id;
                        return (
                          <button
                            key={topic.id}
                            onClick={() => selectTopic(topic.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-start transition-colors hover:bg-slate-700/40 ${isSelected ? 'bg-blue-500/10 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText size={13} className={isSelected ? 'text-blue-500' : 'text-slate-500'} />
                              <span className={`text-sm truncate ${isSelected ? 'font-semibold text-blue-400' : 'text-slate-300'}`}>{topic.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ms-2">
                              {hasAnyContent && <div className="w-1.5 h-1.5 rounded-full bg-green-400" title="Has content" />}
                              {isSelected && <ChevronRight size={13} className="text-blue-400" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
                {topics.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-slate-500">No topics available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/60 bg-slate-900/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t.content_language}</p>
              </div>
              <div className="divide-y divide-slate-700/40">
                {LANGUAGES.map((lang) => {
                  const isActive = selectedLanguage === lang.code;
                  const hasContent = selectedTopicId ? langHasContent(selectedTopicId, lang.code) : false;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-start transition-colors hover:bg-slate-700/40 ${isActive ? 'bg-blue-500/10 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                    >
                      <span className={`text-sm ${isActive ? 'font-semibold text-blue-400' : 'text-slate-300'}`}>{lang.label}</span>
                      <div className="flex items-center gap-2">
                        {hasContent && <div className="w-1.5 h-1.5 rounded-full bg-green-400" title="Has content" />}
                        <span className="text-xs text-slate-500 uppercase font-mono">{lang.code}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!selectedTopicId ? (
              <div className="bg-[#1E293B] border border-dashed border-slate-700 rounded-xl flex items-center justify-center py-20">
                <div className="text-center">
                  <FileText size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500">{t.select_topic_to_edit}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <span>{selectedChapter?.title}</span>
                        <ChevronRight size={11} />
                        <span className="font-medium text-slate-400">{selectedTopic?.title}</span>
                        <ChevronRight size={11} />
                        <span className="font-semibold text-blue-400">{LANGUAGES.find((l) => l.code === selectedLanguage)?.label}</span>
                      </div>
                      {existingContent ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/20 px-2.5 py-1 rounded-full">
                          <CheckCircle size={11} />
                          {t.content_uploaded_badge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full">
                          <AlertCircle size={11} />
                          {t.no_content_badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreview(!preview)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                        {preview ? t.edit_tab : t.preview_tab}
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                      >
                        <Upload size={13} />
                        {t.upload_txt}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </div>

                {preview ? (
                  <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-700/60 bg-slate-900/50 flex items-center gap-2">
                      <Eye size={13} className="text-slate-500" />
                      <p className="text-xs font-semibold text-slate-400">{t.content_preview}</p>
                    </div>
                    <div className="p-6 min-h-[300px]">
                      {content.trim() ? (
                        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-mono">{content}</div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">{t.no_content_to_preview}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-700/60 bg-slate-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-slate-500" />
                        <p className="text-xs font-semibold text-slate-400">{t.lesson_content_label}</p>
                      </div>
                      {content && (
                        <button
                          onClick={() => { setContent(''); setSaved(false); }}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          <RefreshCw size={11} />
                          {t.clear_content}
                        </button>
                      )}
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => { setContent(e.target.value); setSaved(false); }}
                      placeholder={t.paste_content_placeholder}
                      rows={16}
                      className="w-full px-5 py-4 text-sm bg-[#0F172A] text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none font-mono leading-relaxed"
                    />
                    <div className="px-5 py-2.5 border-t border-slate-700/60 bg-slate-900/30 flex items-center justify-between">
                      <p className="text-xs text-slate-500">{wordCount} words · {charCount} characters</p>
                      {wordCount > 0 && wordCount < 50 && (
                        <p className="text-xs text-amber-500">{t.content_tip}</p>
                      )}
                    </div>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    {saveError}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving || !content.trim()}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" />{t.saving}</>
                  ) : saved ? (
                    <><CheckCircle size={16} />{t.saved_successfully}</>
                  ) : (
                    <><Save size={16} />{t.save_content}</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

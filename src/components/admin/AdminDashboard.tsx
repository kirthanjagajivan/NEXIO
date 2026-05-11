import { useState, useEffect } from 'react';
import { BookOpen, FileText, Upload, LogOut, GraduationCap, RefreshCw } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAdminData } from './useAdminData';
import { ManageChaptersTab } from './ManageChaptersTab';
import { ManageTopicsTab } from './ManageTopicsTab';
import { UploadContentTab } from './UploadContentTab';

type AdminTab = 'chapters' | 'topics' | 'content';

interface AdminDashboardProps {
  onSignOut: () => void;
}

export function AdminDashboard({ onSignOut }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('chapters');
  const { t } = useLanguage();
  const {
    chapters, topics, topicContents,
    loading, error,
    fetchAll,
    addChapter, updateChapter, deleteChapter,
    addTopic, updateTopic, deleteTopic,
    upsertContent,
  } = useAdminData();

  useEffect(() => {
    fetchAll();
  }, []);

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'chapters', label: t.manage_chapters, icon: <BookOpen size={18} />, description: t.manage_chapters_desc },
    { id: 'topics', label: t.manage_topics, icon: <FileText size={18} />, description: t.manage_topics_desc },
    { id: 'content', label: t.upload_content, icon: <Upload size={18} />, description: t.upload_content_desc },
  ];

  const stats = [
    { label: t.chapters_stat, value: chapters.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t.topics_stat, value: topics.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t.with_content_stat, value: topicContents.length, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">{t.admin_dashboard}</p>
              <p className="font-bold text-gray-900 text-sm leading-none">{t.teacher_portal}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              title={t.refresh_data}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
            <LanguageSelector />
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={15} />
              {t.sign_out}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t.navigation}</p>
              </div>
              <div className="p-2">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-start transition-all mb-1 last:mb-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {tab.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold leading-snug ${isActive ? 'text-white' : 'text-gray-800'}`}>
                          {tab.label}
                        </p>
                        <p className={`text-xs mt-0.5 leading-snug ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                          {tab.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-50 rounded-xl p-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[520px]">
                {activeTab === 'chapters' && (
                  <ManageChaptersTab
                    chapters={chapters}
                    topics={topics}
                    loading={loading}
                    error={error}
                    onAdd={async (title, desc) => { await addChapter(title, desc); }}
                    onUpdate={updateChapter}
                    onDelete={deleteChapter}
                  />
                )}
                {activeTab === 'topics' && (
                  <ManageTopicsTab
                    chapters={chapters}
                    topics={topics}
                    topicContents={topicContents}
                    loading={loading}
                    error={error}
                    onAdd={async (chapterId, title, desc) => { await addTopic(chapterId, title, desc); }}
                    onUpdate={updateTopic}
                    onDelete={deleteTopic}
                  />
                )}
                {activeTab === 'content' && (
                  <UploadContentTab
                    chapters={chapters}
                    topics={topics}
                    topicContents={topicContents}
                    loading={loading}
                    onSave={upsertContent}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

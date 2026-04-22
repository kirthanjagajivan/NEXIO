import { useState, useEffect, useCallback } from 'react';
import { LanguageSelector } from './LanguageSelector';
import { HomeTab } from './tabs/HomeTab';
import { LessonsTab } from './tabs/LessonsTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { ProfileTab } from './tabs/ProfileTab';
import { LessonDetail } from './LessonDetail';
import { TestPage } from './TestPage';
import { useLanguage } from '../i18n/LanguageContext';
import { useTraineeData } from '../hooks/useTraineeData';
import { getPerformanceRecords, type LessonRecord } from '../hooks/usePerformance';
import { LayoutDashboard, BookOpen, TrendingUp, User, LogOut } from 'lucide-react';

type TabType = 'home' | 'lessons' | 'performance' | 'profile';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

interface SelectedLesson {
  topicId: string;
  topicTitle: string;
  chapterTitle: string;
}

export function TraineeDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedLesson, setSelectedLesson] = useState<SelectedLesson | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [records, setRecords] = useState<LessonRecord[]>(() => getPerformanceRecords());

  const { chapters, loading, error, fetchAll, getContentForTopic, getAvailableLanguages } = useTraineeData();

  useEffect(() => {
    fetchAll();
  }, []);

  const refreshRecords = useCallback(() => {
    setRecords(getPerformanceRecords());
  }, []);

  const allTopics = chapters.flatMap((ch) =>
    ch.topics.map((t) => ({ topicId: t.id, topicTitle: t.title, chapterTitle: ch.title }))
  );

  const totalTopics = allTopics.length;

  const tabs: Tab[] = [
    { id: 'home', label: t.home, icon: <LayoutDashboard size={18} /> },
    { id: 'lessons', label: t.lessons, icon: <BookOpen size={18} /> },
    { id: 'performance', label: t.performance, icon: <TrendingUp size={18} /> },
    { id: 'profile', label: t.profile, icon: <User size={18} /> },
  ];

  function handleSelectTopic(topicId: string, topicTitle: string, chapterTitle: string) {
    setSelectedLesson({ topicId, topicTitle, chapterTitle });
    setActiveTab('lessons');
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col ${isRTL ? 'direction-rtl' : ''}`}>
      <header className="w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/60 bg-white/70 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm hidden sm:inline">App</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            aria-label={t.signOut}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">{t.signOut}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-4 sm:px-6 py-6">
        <div className="max-w-3xl w-full mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className={`flex border-b border-gray-200 overflow-x-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'lessons') {
                      setSelectedLesson(null);
                      setTestOpen(false);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3.5 font-medium text-sm whitespace-nowrap transition-all border-b-2 flex-1 justify-center sm:flex-none sm:justify-start ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50/60'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === 'home' && (
                <HomeTab
                  chapters={chapters}
                  records={records}
                  totalTopics={totalTopics}
                  onGoToLessons={() => setActiveTab('lessons')}
                  onSelectTopic={handleSelectTopic}
                />
              )}
              {activeTab === 'lessons' && !selectedLesson && (
                <LessonsTab
                  chapters={chapters}
                  records={records}
                  loading={loading}
                  error={error}
                  onSelectTopic={(topicId, topicTitle, chapterTitle) => {
                    setSelectedLesson({ topicId, topicTitle, chapterTitle });
                  }}
                />
              )}
              {activeTab === 'lessons' && selectedLesson && !testOpen && (
                <LessonDetail
                  key={selectedLesson.topicId}
                  topicTitle={selectedLesson.topicTitle}
                  chapterTitle={selectedLesson.chapterTitle}
                  getContent={(lang) => getContentForTopic(selectedLesson.topicId, lang)}
                  availableLanguages={getAvailableLanguages(selectedLesson.topicId)}
                  onBack={() => setSelectedLesson(null)}
                  onStartTest={() => setTestOpen(true)}
                />
              )}
              {activeTab === 'lessons' && selectedLesson && testOpen && (
                <TestPage
                  topicId={selectedLesson.topicId}
                  topicTitle={selectedLesson.topicTitle}
                  chapterTitle={selectedLesson.chapterTitle}
                  lessonContent={getContentForTopic(selectedLesson.topicId)}
                  onBack={() => { refreshRecords(); setTestOpen(false); }}
                  onRepeatLesson={() => { refreshRecords(); setTestOpen(false); }}
                  onNextTopic={() => {
                    refreshRecords();
                    const idx = allTopics.findIndex((t) => t.topicId === selectedLesson.topicId);
                    const next = allTopics[idx + 1] ?? null;
                    if (next) {
                      setSelectedLesson(next);
                      setTestOpen(false);
                    } else {
                      setSelectedLesson(null);
                      setTestOpen(false);
                    }
                  }}
                />
              )}
              {activeTab === 'performance' && <PerformanceTab />}
              {activeTab === 'profile' && <ProfileTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

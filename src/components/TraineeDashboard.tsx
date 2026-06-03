import { useState, useEffect } from 'react';
import { LanguageSelector } from './LanguageSelector';
import { HomeTab } from './tabs/HomeTab';
import { LessonsTab } from './tabs/LessonsTab';
import { ProfileTab } from './tabs/ProfileTab';
import { LessonDetail } from './LessonDetail';
import { TestPage } from './TestPage';
import { TeacherLearningAnalytics } from './tabs/TeacherLearningAnalytics';
import { TrainerTaskAnalytics } from './tabs/TrainerTaskAnalytics';
import { useLanguage } from '../i18n/LanguageContext';
import { useTraineeData } from '../hooks/useTraineeData';
import { getPerformanceRecords, type LessonRecord } from '../hooks/usePerformance';
import { LayoutDashboard, User, LogOut, Briefcase, GraduationCap, BookOpen, BarChart2 } from 'lucide-react';
import { TrainerTasksTab } from './tabs/TrainerTasksTab';
import type { Language } from '../i18n/translations';

type TabType = 'home' | 'teacher_learning' | 'trainer_tasks' | 'teacher_analytics' | 'trainer_analytics' | 'profile';

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
  // Stores the exact content + language shown in LessonDetail when "Start Test" is clicked
  const [testContent, setTestContent] = useState<string>('');
  const [records, setRecords] = useState<LessonRecord[]>([]);

  const { chapters, loading, error, fetchAll, getContentForTopic, getAvailableLanguages } = useTraineeData();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    getPerformanceRecords().then(setRecords);
  }, []);

  const allTopics = chapters.flatMap((ch) =>
    ch.topics.map((tp) => ({ topicId: tp.id, topicTitle: tp.title, chapterTitle: ch.title }))
  );

  const tabs: Tab[] = [
    { id: 'home', label: t.home, icon: <LayoutDashboard size={18} /> },
    { id: 'teacher_learning', label: t.teacher_learning, icon: <GraduationCap size={18} /> },
    { id: 'trainer_tasks', label: t.trainer_tasks, icon: <Briefcase size={18} /> },
    { id: 'teacher_analytics', label: 'Lesson Analytics', icon: <BookOpen size={18} /> },
    { id: 'trainer_analytics', label: 'Task Analytics', icon: <BarChart2 size={18} /> },
    { id: 'profile', label: t.profile, icon: <User size={18} /> },
  ];

  function handleSelectTopic(topicId: string, topicTitle: string, chapterTitle: string) {
    setSelectedLesson({ topicId, topicTitle, chapterTitle });
    setActiveTab('teacher_learning');
  }

  function handleStartTest(content: string, _contentLang: Language) {
    setTestContent(content);
    setTestOpen(true);
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
                    if (tab.id !== 'teacher_learning') {
                      setSelectedLesson(null);
                    }
                  }}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-4 font-medium text-sm transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'home' && (
                <HomeTab
                  onSelectTopic={handleSelectTopic}
                  records={records}
                  chapters={chapters}
                  loading={loading}
                />
              )}

              {activeTab === 'teacher_learning' && (
                selectedLesson ? (
                  <LessonDetail
                    topicTitle={selectedLesson.topicTitle}
                    chapterTitle={selectedLesson.chapterTitle}
                    onBack={() => setSelectedLesson(null)}
                    onStartTest={handleStartTest}
                    getContent={(lang) => getContentForTopic(selectedLesson.topicId, lang)}
                    availableLanguages={getAvailableLanguages(selectedLesson.topicId)}
                  />
                ) : (
                  <LessonsTab
                    chapters={chapters}
                    records={records}
                    loading={loading}
                    error={error}
                    onSelectTopic={handleSelectTopic}
                  />
                )
              )}

              {activeTab === 'trainer_tasks' && (
                <TrainerTasksTab />
              )}

              {activeTab === 'teacher_analytics' && <TeacherLearningAnalytics />}

              {activeTab === 'trainer_analytics' && <TrainerTaskAnalytics />}

              {activeTab === 'profile' && <ProfileTab />}
            </div>
          </div>
        </div>
      </div>

      {testOpen && selectedLesson && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 to-blue-50 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            <TestPage
              topicId={selectedLesson.topicId}
              topicTitle={selectedLesson.topicTitle}
              chapterTitle={selectedLesson.chapterTitle}
              lessonContent={testContent}
              onBack={() => setTestOpen(false)}
              onRepeatLesson={() => setTestOpen(false)}
              onNextTopic={(() => {
                const idx = allTopics.findIndex((tp) => tp.topicId === selectedLesson.topicId);
                const next = allTopics[idx + 1];
                if (next) return () => { setSelectedLesson(next); setTestOpen(false); };
                return undefined;
              })()}
            />
          </div>
        </div>
      )}
    </div>
  );
}


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
import { LayoutDashboard, BookOpen, TrendingUp, User, LogOut, Briefcase, GraduationCap, BarChart3 } from 'lucide-react';
import { TrainerTasksTab } from './tabs/TrainerTasksTab';

type TabType = 'home' | 'teacher_learning' | 'trainer_tasks' | 'progress' | 'profile';

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
  const [records, setRecords] = useState<LessonRecord[]>([]);

  const { chapters, loading, error, fetchAll, getContentForTopic, getAvailableLanguages } = useTraineeData();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    refreshRecords();
  }, []);

  const refreshRecords = useCallback(async () => {
    const r = await getPerformanceRecords();
    setRecords(r);
  }, []);

  const allTopics = chapters.flatMap((ch) =>
    ch.topics.map((tp) => ({ topicId: tp.id, topicTitle: tp.title, chapterTitle: ch.title }))
  );

  const totalTopics = allTopics.length;

  const tabs: Tab[] = [
    { id: 'home', label: t.home, icon: <LayoutDashboard size={18} /> },
    { id: 'teacher_learning', label: t.teacher_learning, icon: <GraduationCap size={18} /> },
    { id: 'trainer_tasks', label: t.trainer_tasks, icon: <Briefcase size={18} /> },
    { id: 'progress', label: t.overall_progress, icon: <BarChart3 size={18} /> },
    { id: 'profile', label: t.profile, icon: <User size={18} /> },
  ];

  function handleSelectTopic(topicId: string, topicTitle: string, chapterTitle: string) {
    setSelectedLesson({ topicId, topicTitle, chapterTitle });
    setActiveTab('teacher_learning');
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
                    topicId={selectedLesson.topicId}
                    topicTitle={selectedLesson.topicTitle}
                    chapterTitle={selectedLesson.chapterTitle}
                    onBack={() => setSelectedLesson(null)}
                    onOpenTest={() => setTestOpen(true)}
                    getContentForTopic={getContentForTopic}
                    getAvailableLanguages={getAvailableLanguages}
                  />
                ) : (
                  <LessonsTab
                    chapters={chapters}
                    loading={loading}
                    onSelectTopic={handleSelectTopic}
                  />
                )
              )}

              {activeTab === 'trainer_tasks' && (
                <TrainerTasksTab />
              )}

              {activeTab === 'progress' && (
                <OverallProgressTab records={records} onRefresh={refreshRecords} />
              )}

              {activeTab === 'profile' && <ProfileTab />}
            </div>
          </div>
        </div>
      </div>

      {testOpen && selectedLesson && (
        <TestPage
          topicId={selectedLesson.topicId}
          topicTitle={selectedLesson.topicTitle}
          onClose={() => setTestOpen(false)}
          onSubmit={refreshRecords}
        />
      )}
    </div>
  );
}

import { supabase } from '../lib/supabase';
import { Loader2, Clock, XCircle } from 'lucide-react';

function OverallProgressTab({ records, onRefresh }: { records: LessonRecord[]; onRefresh: () => void }) {
  const { t } = useLanguage();
  const [practicalRecords, setPracticalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPracticalRecords();
  }, []);

  const fetchPracticalRecords = async () => {
    setLoading(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('practical_performance')
        .select('*')
        .eq('user_id', userId)
        .order('last_attempt_at', { ascending: false });

      if (error) throw error;
      setPracticalRecords(data || []);
    } catch (e) {
      console.error('Failed to fetch practical records:', e);
    } finally {
      setLoading(false);
    }
  };

  const teacherPassed = records.filter(r => r.passed).length;
  const teacherTotal = records.length;
  const teacherAvg = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / records.length)
    : 0;

  const practicalPassed = practicalRecords.filter(r => r.passed).length;
  const practicalTotal = practicalRecords.length;
  const practicalAvg = practicalRecords.length > 0
    ? Math.round(practicalRecords.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / practicalRecords.length)
    : 0;

  const overallProgress = Math.round(((teacherPassed + practicalPassed) / Math.max(1, (teacherTotal + practicalTotal))) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t.overall_progress}</h2>
        <button
          onClick={() => { onRefresh(); fetchPracticalRecords(); }}
          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
        >
          <Clock size={14} />
          {t.refresh_data}
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-700">{t.overall_progress}</span>
          <span className="text-3xl font-bold text-gray-900">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {teacherPassed + practicalPassed} of {teacherTotal + practicalTotal} completed
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={18} className="text-emerald-600" />
            <h3 className="font-semibold text-emerald-900">{t.teacher_learning}</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-700">{t.passed_lessons}</span>
              <span className="font-bold text-emerald-900">{teacherPassed}/{teacherTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-700">{t.avg_score}</span>
              <span className={`font-bold ${teacherAvg >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                {teacherAvg}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={18} className="text-amber-600" />
            <h3 className="font-semibold text-amber-900">{t.trainer_tasks}</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-700">{t.tasks_completed}</span>
              <span className="font-bold text-amber-900">{practicalPassed}/{practicalTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-700">{t.avg_score}</span>
              <span className={`font-bold ${practicalAvg >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                {practicalAvg}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {records.filter(r => !r.passed).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <XCircle size={14} className="text-red-500" />
            {t.weak_areas}
          </h3>
          <div className="space-y-2">
            {records.filter(r => !r.passed).slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{r.lesson_name}</span>
                <span className="text-red-600 font-medium">{Math.round((r.score / r.total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

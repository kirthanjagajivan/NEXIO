import { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Upload,
  LogOut,
  GraduationCap,
  RefreshCw,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Users,
  ClipboardCheck,
} from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAdminData } from './useAdminData';
import { ManageChaptersTab } from './ManageChaptersTab';
import { ManageTopicsTab } from './ManageTopicsTab';
import { UploadContentTab } from './UploadContentTab';
import { AcademicPerformanceTab } from '../shared/AcademicPerformanceTab';
import { supabase } from '../../lib/supabase';

type TeacherTab = 'dashboard' | 'lessons' | 'chapters' | 'content' | 'performance' | 'analytics';

interface Tab {
  id: TeacherTab;
  label: string;
  icon: React.ReactNode;
}

interface TraineeStats {
  total: number;
  activeToday: number;
}

export function TeacherDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');
  const { t } = useLanguage();
  const {
    chapters,
    topics,
    topicContents,
    loading: dataLoading,
    error,
    fetchAll,
    addChapter,
    updateChapter,
    deleteChapter,
    addTopic,
    updateTopic,
    deleteTopic,
    upsertContent,
  } = useAdminData();

  const [traineeStats, setTraineeStats] = useState<TraineeStats>({ total: 0, activeToday: 0 });

  useEffect(() => {
    fetchAll();
    fetchTraineeStats();
  }, []);

  const fetchTraineeStats = async () => {
    try {
      const { count: total } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'trainee');

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentPerf } = await supabase
        .from('performance')
        .select('user_id')
        .gte('last_attempt_at', oneDayAgo);

      const activeToday = recentPerf ? new Set(recentPerf.map((p) => p.user_id)).size : 0;

      setTraineeStats({ total: total || 0, activeToday });
    } catch (e) {
      console.error('Failed to fetch trainee stats:', e);
    }
  };

  const tabs: Tab[] = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard size={18} /> },
    { id: 'lessons', label: t.lessons, icon: <BookOpen size={18} /> },
    { id: 'chapters', label: t.chapters_stat, icon: <FileText size={18} /> },
    { id: 'content', label: t.upload_content, icon: <Upload size={18} /> },
    { id: 'performance', label: t.performance, icon: <TrendingUp size={18} /> },
    { id: 'analytics', label: t.analytics, icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">
                {t.admin_dashboard}
              </p>
              <p className="font-bold text-gray-900 text-sm leading-none">{t.teacher}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchAll();
                fetchTraineeStats();
              }}
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

      <div className="flex-1 flex">
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto sticky top-0">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg text-start transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-gray-400'}`}
                  >
                    {tab.icon}
                  </div>
                  <p
                    className={`text-sm font-semibold leading-snug ${
                      isActive ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </p>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {activeTab === 'dashboard' && (
              <TeacherDashboardOverview
                chapters={chapters.length}
                topics={topics.length}
                contents={topicContents.length}
                traineeStats={traineeStats}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'lessons' && (
              <ManageTopicsTab
                chapters={chapters}
                topics={topics}
                topicContents={topicContents}
                loading={dataLoading}
                error={error}
                onAdd={addTopic}
                onUpdate={updateTopic}
                onDelete={deleteTopic}
              />
            )}

            {activeTab === 'chapters' && (
              <ManageChaptersTab
                chapters={chapters}
                topics={topics}
                loading={dataLoading}
                error={error}
                onAdd={addChapter}
                onUpdate={updateChapter}
                onDelete={deleteChapter}
              />
            )}

            {activeTab === 'content' && (
              <UploadContentTab
                chapters={chapters}
                topics={topics}
                topicContents={topicContents}
                loading={dataLoading}
                onSave={upsertContent}
              />
            )}

            {activeTab === 'performance' && (
              <AcademicPerformanceTab
                title={t.performance}
                subtitle={t.academic_performance_desc}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab chapters={chapters} topics={topics} contents={topicContents} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function TeacherDashboardOverview({
  chapters,
  topics,
  contents,
  traineeStats,
  onNavigate,
}: {
  chapters: number;
  topics: number;
  contents: number;
  traineeStats: TraineeStats;
  onNavigate: (tab: TeacherTab) => void;
}) {
  const { t } = useLanguage();

  const stats = [
    {
      label: t.chapters_stat,
      value: chapters,
      icon: <BookOpen className="text-blue-600" size={24} />,
      bg: 'bg-blue-50',
    },
    {
      label: t.topics_stat,
      value: topics,
      icon: <FileText className="text-green-600" size={24} />,
      bg: 'bg-green-50',
    },
    {
      label: t.with_content_stat,
      value: contents,
      icon: <Upload className="text-amber-600" size={24} />,
      bg: 'bg-amber-50',
    },
    {
      label: t.active_trainees,
      value: traineeStats.total,
      icon: <Users className="text-purple-600" size={24} />,
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t.dashboard}</h1>
        <p className="text-gray-500">{t.teacher_desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} border border-gray-200 rounded-xl p-6 flex items-start gap-4`}
          >
            <div className="shrink-0 p-3 bg-white rounded-lg">{stat.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">{t.quick_actions}</h3>
          </div>
          <div className="p-6 space-y-3">
            <button
              onClick={() => onNavigate('lessons')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <FileText size={18} />
              <span className="font-medium">{t.manage_topics}</span>
            </button>
            <button
              onClick={() => onNavigate('content')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Upload size={18} />
              <span className="font-medium">{t.upload_content}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">{t.student_activity}</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">{t.active_today}</span>
              <span className="text-2xl font-bold text-emerald-600">{traineeStats.activeToday}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{t.total_trainees}</span>
              <span className="font-medium text-gray-900">{traineeStats.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab({
  chapters,
  topics,
  contents,
}: {
  chapters: any[];
  topics: any[];
  contents: any[];
}) {
  const { t } = useLanguage();
  const [topLessons, setTopLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('performance')
        .select('lesson_name, score, total, passed, attempts')
        .order('attempts', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTopLessons(data || []);
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = topics.length > 0 ? Math.round((contents.length / topics.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t.analytics}</h1>
        <p className="text-gray-500 mt-1">{t.analytics_desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">{t.chapters_stat}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{chapters.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">{t.topics_stat}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{topics.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">{t.content_coverage}</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{completionRate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">
            {t.most_attempted}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
          </div>
        ) : topLessons.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">{t.no_data}</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {topLessons.map((lesson, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{lesson.lesson_name}</p>
                  <p className="text-xs text-gray-500">
                    {lesson.attempts} {t.attempts}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      Math.round((lesson.score / lesson.total) * 100) >= 70
                        ? 'text-green-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {Math.round((lesson.score / lesson.total) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {lesson.passed ? t.passed : t.failed_label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

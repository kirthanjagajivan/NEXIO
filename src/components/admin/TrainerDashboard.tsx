import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, RefreshCw, LogOut, BookOpen, Users, TrendingUp, MessageSquare, Plus } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { useLanguage } from '../../i18n/LanguageContext';
import { supabase } from '../../lib/supabase';
import { TrainerDashboardTab } from './trainer/TrainerDashboardTab';
import { PracticalTasksTab } from './trainer/PracticalTasksTab';
import { AssignedTraineesTab } from './trainer/AssignedTraineesTab';
import { TrainerPerformanceTab } from './trainer/TrainerPerformanceTab';
import { TrainerFeedbackTab } from './trainer/TrainerFeedbackTab';
import type { Profile } from '../../lib/supabase';

type TrainerTab = 'dashboard' | 'tasks' | 'trainees' | 'performance' | 'feedback';

interface Tab {
  id: TrainerTab;
  label: string;
  icon: React.ReactNode;
}

export function TrainerDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TrainerTab>('dashboard');
  const [trainees, setTrainees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: assignmentsRes } = await supabase
        .from('trainee_assignments')
        .select('trainee_id')
        .order('created_at', { ascending: false });

      if (assignmentsRes && assignmentsRes.length > 0) {
        const traineeIds = assignmentsRes.map((a: any) => a.trainee_id);
        const { data: traineeProfiles, error: traineeError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', traineeIds);

        if (traineeError) throw traineeError;
        setTrainees(traineeProfiles ?? []);
      } else {
        setTrainees([]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load trainees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainees();
  }, [fetchTrainees]);

  const tabs: Tab[] = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard size={18} /> },
    { id: 'tasks', label: t.practical_tasks, icon: <BookOpen size={18} /> },
    { id: 'trainees', label: t.assigned_trainees, icon: <Users size={18} /> },
    { id: 'performance', label: t.performance, icon: <TrendingUp size={18} /> },
    { id: 'feedback', label: t.feedback, icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center shadow-sm">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">{t.admin_dashboard}</p>
              <p className="font-bold text-gray-900 text-sm leading-none">{t.trainer}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTrainees}
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
                      ? 'bg-amber-600 text-white shadow-sm'
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
                  </div>
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
              <TrainerDashboardTab trainees={trainees} loading={loading} />
            )}
            {activeTab === 'tasks' && <PracticalTasksTab />}
            {activeTab === 'trainees' && (
              <AssignedTraineesTab
                trainees={trainees}
                loading={loading}
                onRefresh={fetchTrainees}
              />
            )}
            {activeTab === 'performance' && (
              <TrainerPerformanceTab trainees={trainees} />
            )}
            {activeTab === 'feedback' && (
              <TrainerFeedbackTab trainees={trainees} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Import icon at the top
import { LayoutDashboard } from 'lucide-react';

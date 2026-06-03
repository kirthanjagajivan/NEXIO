import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, RefreshCw, LogOut, BookOpen, Users, TrendingUp, MessageSquare, LayoutDashboard, Plus, Save, CreditCard as Edit2, Trash2, X, ClipboardCheck } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { useLanguage } from '../../i18n/LanguageContext';
import { supabase } from '../../lib/supabase';
import { PracticalPerformanceTab } from '../shared/PracticalPerformanceTab';
import { PracticalTasksTab } from './trainer/PracticalTasksTab';
import { SubmissionReviewTab } from './trainer/SubmissionReviewTab';
import type { Profile } from '../../lib/supabase';

type TrainerTab = 'dashboard' | 'tasks' | 'trainees' | 'performance' | 'feedback' | 'reviews';

interface PracticalTask {
  id: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: string;
  estimated_duration_minutes: number;
  created_at: string;
}

interface Tab {
  id: TrainerTab;
  label: string;
  icon: React.ReactNode;
}

export function TrainerDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TrainerTab>('dashboard');
  const [trainees, setTrainees] = useState<Profile[]>([]);
  const [traineeIds, setTraineeIds] = useState<string[]>([]);
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
        const ids = assignmentsRes.map((a: any) => a.trainee_id);
        setTraineeIds(ids);

        const { data: traineeProfiles, error: traineeError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', ids);

        if (traineeError) throw traineeError;
        setTrainees(traineeProfiles ?? []);
      } else {
        setTrainees([]);
        setTraineeIds([]);
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
    { id: 'reviews', label: t.review_submissions, icon: <ClipboardCheck size={18} /> },
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
              <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">
                {t.admin_dashboard}
              </p>
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
              <TrainerDashboardTab trainees={trainees} loading={loading} />
            )}
            {activeTab === 'tasks' && <PracticalTasksTab />}
            {activeTab === 'reviews' && <SubmissionReviewTab />}
            {activeTab === 'trainees' && (
              <AssignedTraineesTab
                trainees={trainees}
                loading={loading}
                onRefresh={fetchTrainees}
              />
            )}
            {activeTab === 'performance' && (
              <PracticalPerformanceTab
                traineeIds={traineeIds}
                title={t.performance}
                subtitle={t.practical_performance_desc || 'Monitor trainee practical task performance and workplace assignments'}
              />
            )}
            {activeTab === 'feedback' && <TrainerFeedbackTab trainees={trainees} />}
          </div>
        </main>
      </div>
    </div>
  );
}

interface DashboardStats {
  reviewedCount: number;
  passedCount: number;
  avgScore: number | null;
  feedbackCount: number;
  recentReviews: Array<{
    trainee_name: string;
    task_title: string;
    score: number | null;
    passed: boolean;
    reviewed_at: string;
  }>;
}

function TrainerDashboardTab({ trainees, loading }: { trainees: Profile[]; loading: boolean }) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    reviewedCount: 0,
    passedCount: 0,
    avgScore: null,
    feedbackCount: 0,
    recentReviews: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      // Fetch reviewed submissions (any status with a score)
      const { data: submissions } = await supabase
        .from('task_submissions')
        .select('id, trainee_id, score, status, feedback, reviewed_at, practical_tasks(title)')
        .not('reviewed_at', 'is', null)
        .order('reviewed_at', { ascending: false });

      if (!submissions || submissions.length === 0) {
        setStatsLoading(false);
        return;
      }

      const withScore = submissions.filter((s: any) => s.score !== null);
      const passedCount = submissions.filter((s: any) => s.status === 'approved').length;
      const avgScore = withScore.length > 0
        ? Math.round(withScore.reduce((sum: number, s: any) => sum + s.score, 0) / withScore.length)
        : null;
      const feedbackCount = submissions.filter((s: any) => s.feedback).length;

      // Enrich recent reviews with trainee names
      const traineeIds = [...new Set(submissions.slice(0, 10).map((s: any) => s.trainee_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', traineeIds);
      const profileMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        profileMap[p.id] = p.full_name || p.email;
      });

      const recentReviews = submissions.slice(0, 8).map((s: any) => ({
        trainee_name: profileMap[s.trainee_id] ?? 'Unknown',
        task_title: (s.practical_tasks as any)?.title ?? 'Unknown Task',
        score: s.score,
        passed: s.status === 'approved',
        reviewed_at: s.reviewed_at,
      }));

      setStats({ reviewedCount: submissions.length, passedCount, avgScore, feedbackCount, recentReviews });
    } catch (e) {
      console.error('fetchStats error:', e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{t.dashboard}</h1>
          <p className="text-gray-500">{t.trainer_desc}</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.assigned_trainees}
          value={trainees.length}
          icon={<Users className="text-blue-600" size={24} />}
          bg="bg-blue-50"
        />
        <StatCard
          label="Reviewed Tasks"
          value={statsLoading ? '…' : stats.reviewedCount}
          icon={<ClipboardCheck className="text-green-600" size={24} />}
          bg="bg-green-50"
        />
        <StatCard
          label={t.avg_score}
          value={statsLoading ? '…' : stats.avgScore !== null ? `${stats.avgScore}%` : '—'}
          icon={<TrendingUp className="text-amber-600" size={24} />}
          bg="bg-amber-50"
        />
        <StatCard
          label="Passed Tasks"
          value={statsLoading ? '…' : stats.passedCount}
          icon={<MessageSquare className="text-emerald-600" size={24} />}
          bg="bg-emerald-50"
        />
      </div>

      <RecentTraineesCard trainees={trainees} loading={loading} />

      {/* Recent reviews table */}
      {!statsLoading && stats.recentReviews.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
            <ClipboardCheck size={16} className="text-gray-500" />
            <h2 className="font-semibold text-gray-800 text-sm">Recent Reviews</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentReviews.map((r, i) => (
              <div key={i} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-amber-700 font-bold text-xs">
                    {r.trainee_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.trainee_name}</p>
                  <p className="text-xs text-gray-500 truncate">{r.task_title}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {r.score !== null && (
                    <span className={`text-sm font-bold ${r.score >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                      {r.score}/100
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {r.passed ? 'Passed' : 'Failed'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.reviewed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  bg,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className={`${bg} border border-gray-200 rounded-xl p-6 flex items-start gap-4`}>
      <div className="shrink-0 p-3 bg-white rounded-lg">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function RecentTraineesCard({ trainees, loading }: { trainees: Profile[]; loading: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <Users size={16} className="text-gray-500" />
        <h2 className="font-semibold text-gray-800 text-sm">{t.assigned_trainees}</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-gray-400" />
        </div>
      ) : trainees.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400 text-sm">{t.no_trainees}</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {trainees.slice(0, 5).map((trainee) => (
            <div
              key={trainee.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-amber-700 font-bold text-sm">
                    {trainee.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {trainee.full_name || trainee.email}
                  </p>
                  <p className="text-xs text-gray-500">{trainee.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssignedTraineesTab({
  trainees,
  loading,
  onRefresh,
}: {
  trainees: Profile[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const { t } = useLanguage();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allTrainees, setAllTrainees] = useState<Profile[]>([]);
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    if (showAssignModal) {
      fetchAllTrainees();
    }
  }, [showAssignModal]);

  const fetchAllTrainees = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'trainee');

      if (error) throw error;
      setAllTrainees(data || []);
    } catch (e) {
      console.error('Failed to fetch all trainees:', e);
    }
  };

  const handleAssign = async (traineeId: string) => {
    try {
      const { error } = await supabase.from('trainee_assignments').insert([
        {
          trainer_id: (await supabase.auth.getUser()).data.user?.id,
          trainee_id: traineeId,
        },
      ]);

      if (error) throw error;
      onRefresh();
      setShowAssignModal(false);
    } catch (e) {
      console.error('Failed to assign trainee:', e);
    }
  };

  const handleUnassign = async (traineeId: string) => {
    if (!confirm('Unassign this trainee?')) return;

    try {
      const { error } = await supabase
        .from('trainee_assignments')
        .delete()
        .eq('trainee_id', traineeId);

      if (error) throw error;
      onRefresh();
    } catch (e) {
      console.error('Failed to unassign trainee:', e);
    }
  };

  const assignedIds = trainees.map((t) => t.id);
  const availableTrainees = allTrainees.filter(
    (t) =>
      !assignedIds.includes(t.id) &&
      (t.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
        t.full_name?.toLowerCase().includes(searchEmail.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.assigned_trainees}</h1>
          <p className="text-gray-500 mt-1">{t.manage_trainees}</p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
        >
          <Plus size={16} />
          {t.assign_trainee}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Users size={16} className="text-gray-500" />
          <h2 className="font-semibold text-gray-800 text-sm">
            {t.assigned_trainees} ({trainees.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
          </div>
        ) : trainees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{t.no_trainees}</p>
            <p className="text-gray-400 text-sm mt-1">{t.assign_first_trainee}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {trainees.map((trainee) => (
              <div
                key={trainee.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-700 font-bold text-sm">
                      {trainee.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {trainee.full_name || trainee.email}
                    </p>
                    <p className="text-xs text-gray-500">{trainee.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnassign(trainee.id)}
                  className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  {t.unassign_trainee}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{t.assign_trainee}</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder={t.search || 'Search by name or email...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none mb-4"
              />

              {availableTrainees.length === 0 ? (
                <p className="text-center text-gray-400 py-4">{t.no_trainees}</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {availableTrainees.map((trainee) => (
                    <button
                      key={trainee.id}
                      onClick={() => handleAssign(trainee.id)}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <span className="text-amber-700 font-bold text-xs">
                          {trainee.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {trainee.full_name || trainee.email}
                        </p>
                        <p className="text-xs text-gray-500">{trainee.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrainerFeedbackTab({ trainees }: { trainees: Profile[] }) {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<Profile | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('trainer_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (e) {
      console.error('Failed to fetch feedback:', e);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTrainee || !feedbackText.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('trainer_feedback').insert([
        {
          trainee_id: selectedTrainee.id,
          feedback_text: feedbackText,
          rating,
          topic: topic || null,
        },
      ]);

      if (error) throw error;
      await fetchFeedback();
      setShowModal(false);
      setSelectedTrainee(null);
      setFeedbackText('');
      setRating(5);
      setTopic('');
    } catch (e) {
      console.error('Failed to submit feedback:', e);
    } finally {
      setSaving(false);
    }
  };

  const openFeedbackModal = (trainee: Profile) => {
    setSelectedTrainee(trainee);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.feedback}</h1>
          <p className="text-gray-500 mt-1">{t.manage_feedback}</p>
        </div>
      </div>

      {trainees.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{t.no_feedback}</p>
          <p className="text-gray-400 text-sm mt-1">{t.assign_trainee_first}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trainees to give feedback */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 text-sm">{t.add_feedback}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {trainees.map((trainee) => (
                <div
                  key={trainee.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="text-amber-700 font-bold text-sm">
                        {trainee.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {trainee.full_name || trainee.email}
                      </p>
                      <p className="text-xs text-gray-500">{trainee.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openFeedbackModal(trainee)}
                    className="flex items-center gap-1 px-3 py-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus size={14} />
                    {t.add_feedback}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent feedback */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 text-sm">{t.recent_feedback}</h2>
            </div>
            {feedbackList.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">{t.no_feedback_yet}</div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {feedbackList.map((fb) => (
                  <div key={fb.id} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={i <= fb.rating ? 'text-amber-500' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      {fb.topic && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {fb.topic}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{fb.feedback_text}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && selectedTrainee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t.add_feedback}</h2>
                <p className="text-sm text-gray-500">{selectedTrainee.full_name || selectedTrainee.email}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.rating}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => setRating(i)}
                      className={`text-2xl transition-colors ${
                        i <= rating ? 'text-amber-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.topic} ({t.optional || 'optional'})
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Communication, Technical Skills..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.feedback_text}
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="Write your feedback..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !feedbackText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? t.saving || 'Saving...' : t.save || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

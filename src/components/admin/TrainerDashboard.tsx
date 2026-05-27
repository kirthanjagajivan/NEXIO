import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, RefreshCw, LogOut, BookOpen, Users, TrendingUp, MessageSquare, LayoutDashboard, Plus, Save, CreditCard as Edit2, Trash2, X } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { useLanguage } from '../../i18n/LanguageContext';
import { supabase } from '../../lib/supabase';
import { PracticalPerformanceTab } from '../shared/PracticalPerformanceTab';
import type { Profile } from '../../lib/supabase';

type TrainerTab = 'dashboard' | 'tasks' | 'trainees' | 'performance' | 'feedback';

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

function TrainerDashboardTab({ trainees, loading }: { trainees: Profile[]; loading: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t.dashboard}</h1>
        <p className="text-gray-500">{t.trainer_desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.assigned_trainees}
          value={trainees.length}
          icon={<Users className="text-blue-600" size={24} />}
          bg="bg-blue-50"
        />
        <StatCard
          label={t.practical_tasks}
          value={0}
          icon={<BookOpen className="text-green-600" size={24} />}
          bg="bg-green-50"
        />
        <StatCard
          label={t.avg_score}
          value="—%"
          icon={<TrendingUp className="text-amber-600" size={24} />}
          bg="bg-amber-50"
        />
        <StatCard
          label={t.feedback}
          value={0}
          icon={<MessageSquare className="text-emerald-600" size={24} />}
          bg="bg-emerald-50"
        />
      </div>

      <RecentTraineesCard trainees={trainees} loading={loading} />
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

function PracticalTasksTab() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<PracticalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<PracticalTask | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    difficulty: 'intermediate',
    estimated_duration_minutes: 30,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('practical_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('practical_tasks')
          .update(formData)
          .eq('id', editingTask.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('practical_tasks').insert([formData]);

        if (error) throw error;
      }

      await fetchTasks();
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        instructions: '',
        difficulty: 'intermediate',
        estimated_duration_minutes: 30,
      });
    } catch (e) {
      console.error('Failed to save task:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      const { error } = await supabase.from('practical_tasks').delete().eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  const openEditModal = (task: PracticalTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      difficulty: task.difficulty,
      estimated_duration_minutes: task.estimated_duration_minutes,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.practical_tasks}</h1>
          <p className="text-gray-500 mt-1">{t.manage_practical_tasks}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
        >
          <Plus size={16} />
          {t.create_task}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-gray-400" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{t.no_tasks}</p>
          <p className="text-gray-400 text-sm mt-1">{t.create_first_task}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {task.difficulty} · {task.estimated_duration_minutes} {t.minutes}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
              )}
              {task.instructions && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">{t.task_instructions}</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{task.instructions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          formData={formData}
          setFormData={setFormData}
          saving={saving}
          editing={!!editingTask}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
            setFormData({
              title: '',
              description: '',
              instructions: '',
              difficulty: 'intermediate',
              estimated_duration_minutes: 30,
            });
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TaskModal({
  formData,
  setFormData,
  saving,
  editing,
  onClose,
  onSave,
}: {
  formData: any;
  setFormData: any;
  saving: boolean;
  editing: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {editing ? t.edit_task : t.create_task}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.task_title}</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="Task title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.task_description}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="Describe the task..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.task_instructions}
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="Optional: company training instructions, resources, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.difficulty_level}
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="beginner">{t.beginner}</option>
                <option value="intermediate">{t.intermediate}</option>
                <option value="advanced">{t.advanced}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.estimated_duration}
              </label>
              <input
                type="number"
                value={formData.estimated_duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) })
                }
                min={5}
                max={480}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {t.cancel || 'Cancel'}
          </button>
          <button
            onClick={onSave}
            disabled={saving || !formData.title.trim()}
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

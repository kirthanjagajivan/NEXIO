import { Users, BookOpen, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import type { Profile } from '../../../lib/supabase';

interface TrainerDashboardTabProps {
  trainees: Profile[];
  loading: boolean;
}

export function TrainerDashboardTab({ trainees, loading }: TrainerDashboardTabProps) {
  const { t } = useLanguage();

  const stats = [
    {
      label: t.assigned_trainees,
      value: trainees.length,
      icon: <Users className="text-blue-400" size={24} />,
      bg: 'bg-blue-500/10 border border-blue-500/30',
    },
    {
      label: t.practical_tasks,
      value: 0,
      icon: <BookOpen className="text-green-400" size={24} />,
      bg: 'bg-green-500/10 border border-green-500/30',
    },
    {
      label: t.avg_score,
      value: '—',
      icon: <TrendingUp className="text-amber-400" size={24} />,
      bg: 'bg-amber-500/10 border border-amber-500/30',
    },
    {
      label: t.feedback,
      value: 0,
      icon: <CheckCircle className="text-emerald-400" size={24} />,
      bg: 'bg-emerald-500/10 border border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">{t.dashboard}</h1>
        <p className="text-slate-400">{t.trainer_desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} rounded-xl p-6 flex items-start gap-4`}
          >
            <div className="shrink-0 p-3 bg-slate-900/50 rounded-lg">{stat.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-slate-700/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-700/60 bg-slate-900/50">
          <Users size={16} className="text-slate-500" />
          <h2 className="font-semibold text-slate-300 text-sm">{t.assigned_trainees}</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-500" />
          </div>
        ) : trainees.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">
            {t.no_trainees}
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {trainees.slice(0, 5).map((trainee) => (
              <div
                key={trainee.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-amber-700 font-bold text-sm">
                      {trainee.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm truncate">
                      {trainee.full_name || trainee.email}
                    </p>
                    <p className="text-xs text-slate-400">{trainee.email}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-full">
                    {t.assigned_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] rounded-xl border border-slate-700/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-900/50">
            <h3 className="font-semibold text-slate-300 text-sm">{t.recent_tasks}</h3>
          </div>
          <div className="px-6 py-8 text-center text-slate-500 text-sm">
            {t.no_tasks}
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-slate-700/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-900/50">
            <h3 className="font-semibold text-slate-300 text-sm">{t.recent_feedback}</h3>
          </div>
          <div className="px-6 py-8 text-center text-slate-500 text-sm">
            {t.no_feedback}
          </div>
        </div>
      </div>
    </div>
  );
}

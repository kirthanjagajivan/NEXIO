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
      icon: <Users className="text-blue-600" size={24} />,
      bg: 'bg-blue-50',
    },
    {
      label: t.practical_tasks,
      value: 0,
      icon: <BookOpen className="text-green-600" size={24} />,
      bg: 'bg-green-50',
    },
    {
      label: t.avg_score,
      value: '—',
      icon: <TrendingUp className="text-amber-600" size={24} />,
      bg: 'bg-amber-50',
    },
    {
      label: t.feedback,
      value: 0,
      icon: <CheckCircle className="text-emerald-600" size={24} />,
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t.dashboard}</h1>
        <p className="text-gray-500">{t.trainer_desc}</p>
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Users size={16} className="text-gray-500" />
          <h2 className="font-semibold text-gray-800 text-sm">{t.assigned_trainees}</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : trainees.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            {t.no_trainees}
          </div>
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
                <div className="shrink-0">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {t.assigned_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">{t.recent_tasks}</h3>
          </div>
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            {t.no_tasks}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">{t.recent_feedback}</h3>
          </div>
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            {t.no_feedback}
          </div>
        </div>
      </div>
    </div>
  );
}

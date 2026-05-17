import { TrendingUp, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import type { Profile } from '../../../lib/supabase';

interface TrainerPerformanceTabProps {
  trainees: Profile[];
}

export function TrainerPerformanceTab({ trainees }: TrainerPerformanceTabProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t.performance}</h1>
        <p className="text-gray-500 mt-1">{t.trainee_performance}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-blue-600" />
            <h3 className="font-semibold text-gray-800 text-sm">{t.avg_score}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-500 mt-1">{t.no_data}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-green-600" />
            <h3 className="font-semibold text-gray-800 text-sm">{t.lessons_completed}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-500 mt-1">{t.across_trainees}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-amber-600" />
            <h3 className="font-semibold text-gray-800 text-sm">{t.active_trainees}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{trainees.length}</p>
          <p className="text-xs text-gray-500 mt-1">{t.assigned_to_you}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">{t.trainee_progress}</h2>
        </div>

        {trainees.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            {t.no_trainees}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {trainees.map((trainee) => (
              <div key={trainee.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{trainee.full_name || trainee.email}</p>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                    0%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

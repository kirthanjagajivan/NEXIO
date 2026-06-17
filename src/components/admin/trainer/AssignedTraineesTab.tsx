import { useState } from 'react';
import { Users, UserMinus, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../i18n/LanguageContext';
import type { Profile } from '../../../lib/supabase';

interface AssignedTraineesTabProps {
  trainees: Profile[];
  loading: boolean;
  onRefresh: () => void;
}

export function AssignedTraineesTab({
  trainees,
  loading,
  onRefresh,
}: AssignedTraineesTabProps) {
  const { t } = useLanguage();
  const [unassigning, setUnassigning] = useState<string | null>(null);

  async function handleUnassign(traineeId: string) {
    setUnassigning(traineeId);
    try {
      await supabase
        .from('trainee_assignments')
        .delete()
        .eq('trainee_id', traineeId);
      onRefresh();
    } finally {
      setUnassigning(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.assigned_trainees}</h1>
          <p className="text-gray-500 mt-1">{t.manage_trainees}</p>
        </div>
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
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        ) : trainees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Users size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">{t.no_trainees}</p>
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
                  disabled={unassigning === trainee.id}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                >
                  {unassigning === trainee.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <UserMinus size={12} />}
                  {t.unassign_trainee}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

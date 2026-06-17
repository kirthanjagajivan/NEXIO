import { MessageSquare, Plus } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import type { Profile } from '../../../lib/supabase';

interface TrainerFeedbackTabProps {
  trainees: Profile[];
}

export function TrainerFeedbackTab({ trainees }: TrainerFeedbackTabProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t.feedback}</h1>
          <p className="text-slate-400 mt-1">{t.manage_feedback}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm">
          <Plus size={16} />
          {t.add_feedback}
        </button>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-slate-700/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-700/60 bg-slate-900/50">
          <MessageSquare size={16} className="text-slate-500" />
          <h2 className="font-semibold text-slate-300 text-sm">{t.feedback}</h2>
        </div>

        {trainees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={24} className="text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium">{t.no_feedback}</p>
            <p className="text-slate-500 text-sm mt-1">{t.assign_trainee_first}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {trainees.map((trainee) => (
              <div
                key={trainee.id}
                className="px-6 py-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-white">{trainee.full_name || trainee.email}</p>
                  <button className="text-xs px-3 py-1 text-amber-400 hover:bg-amber-500/10 rounded transition-colors">
                    {t.add_feedback}
                  </button>
                </div>
                <p className="text-xs text-slate-500">{t.no_feedback_yet}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

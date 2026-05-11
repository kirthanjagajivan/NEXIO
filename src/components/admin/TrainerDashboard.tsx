import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, RefreshCw, LogOut, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { useLanguage } from '../../i18n/LanguageContext';
import { supabase } from '../../lib/supabase';
import type { Profile, PerformanceRecord } from '../../lib/supabase';

export function TrainerDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { t } = useLanguage();
  const [trainees, setTrainees] = useState<Profile[]>([]);
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [profilesRes, perfRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'trainee').order('created_at', { ascending: false }),
      supabase.from('performance').select('*').order('last_attempt_at', { ascending: false }),
    ]);
    setTrainees(profilesRes.data ?? []);
    setPerformance(perfRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalTrainees = trainees.length;
  const totalAttempts = performance.length;
  const passedCount = performance.filter((p) => p.passed).length;
  const avgScore = totalAttempts > 0
    ? Math.round(performance.reduce((s, p) => s + (p.total > 0 ? (p.score / p.total) * 100 : 0), 0) / totalAttempts)
    : 0;

  const traineeStats = trainees.map((trainee) => {
    const records = performance.filter((p) => p.user_id === trainee.id);
    const passed = records.filter((r) => r.passed).length;
    const avgPct = records.length > 0
      ? Math.round(records.reduce((s, r) => s + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / records.length)
      : 0;
    return { trainee, records, passed, avgPct };
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center shadow-sm">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">{t.admin_dashboard}</p>
              <p className="font-bold text-gray-900 text-sm leading-none">{t.trainer_desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
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

      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalTrainees}</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{t.role_trainee}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{passedCount}</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{t.passed_stat}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{t.avg_score}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
            <Users size={16} className="text-gray-500" />
            <h3 className="font-semibold text-gray-800 text-sm">{t.role_trainee}</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="animate-spin text-gray-400" />
            </div>
          ) : traineeStats.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              {t.no_lessons_yet}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {traineeStats.map(({ trainee, records, passed, avgPct }) => (
                <div key={trainee.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-blue-700 font-bold text-sm">
                          {trainee.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{trainee.full_name || trainee.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{trainee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{records.length}</p>
                        <p className="text-xs text-gray-400">{t.lessons}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{passed}</p>
                        <p className="text-xs text-gray-400">{t.passed_stat}</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${avgPct >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>{avgPct}%</p>
                        <p className="text-xs text-gray-400">{t.avg_score}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

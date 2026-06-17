import { useState } from 'react';
import {
  TrendingUp,
  BookOpen,
  Target,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Award,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAcademicPerformance, type TraineeAcademicData } from '../../hooks/useAcademicPerformance';

interface AcademicPerformanceTabProps {
  traineeIds?: string[];
  title: string;
  subtitle: string;
}

export function AcademicPerformanceTab({ traineeIds, title, subtitle }: AcademicPerformanceTabProps) {
  const { t } = useLanguage();
  const [expandedTrainee, setExpandedTrainee] = useState<string | null>(null);
  const { traineeData, loading, error, refetch } = useAcademicPerformance(traineeIds);

  const stats = traineeData.reduce(
    (acc, td) => ({
      totalTrainees: acc.totalTrainees + 1,
      totalLessons: acc.totalLessons + td.stats.totalLessons,
      passedLessons: acc.passedLessons + td.stats.passedLessons,
      avgScoreSum: acc.avgScoreSum + td.stats.avgScore,
    }),
    { totalTrainees: 0, totalLessons: 0, passedLessons: 0, avgScoreSum: 0 }
  );

  const overallAvgScore =
    stats.totalTrainees > 0 ? Math.round(stats.avgScoreSum / stats.totalTrainees) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-slate-400 mt-1">{subtitle}</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm text-slate-300"
        >
          <Clock size={16} />
          {t.refresh_data}
        </button>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
        <BookOpen className="text-emerald-400" size={20} />
        <div>
          <p className="font-semibold text-emerald-300">{t.academic_learning || 'Academic Learning'}</p>
          <p className="text-sm text-emerald-400">{t.academic_learning_desc || 'Theory lessons, quizzes, and teacher-uploaded content'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-400" size={18} />
            <span className="text-sm font-medium text-blue-300">{t.active_trainees}</span>
          </div>
          <p className="text-3xl font-bold text-blue-300">{stats.totalTrainees}</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-green-400" size={18} />
            <span className="text-sm font-medium text-green-300">{t.passed_lessons || 'Passed Lessons'}</span>
          </div>
          <p className="text-3xl font-bold text-green-300">{stats.passedLessons}</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-amber-400" size={18} />
            <span className="text-sm font-medium text-amber-300">{t.avg_score}</span>
          </div>
          <p className="text-3xl font-bold text-amber-300">{overallAvgScore}%</p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-purple-400" size={18} />
            <span className="text-sm font-medium text-purple-300">{t.academic_progress || 'Academic Progress'}</span>
          </div>
          <p className="text-3xl font-bold text-purple-300">
            {stats.totalLessons > 0
              ? Math.round((stats.passedLessons / stats.totalLessons) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-[#1E293B] rounded-xl border border-slate-700/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-900/50">
          <h2 className="font-semibold text-white text-sm">{t.academic_progress || 'Academic Progress'}</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-600" />
          </div>
        ) : traineeData.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">{t.no_trainees}</div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {traineeData.map((td) => (
              <AcademicTraineeCard
                key={td.trainee.id}
                data={td}
                expanded={expandedTrainee === td.trainee.id}
                onToggle={() =>
                  setExpandedTrainee(expandedTrainee === td.trainee.id ? null : td.trainee.id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AcademicTraineeCard({
  data,
  expanded,
  onToggle,
}: {
  data: TraineeAcademicData;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  const { trainee, stats } = data;

  return (
    <div className="hover:bg-slate-700/30 transition-colors">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">
              {trainee.full_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="font-medium text-white truncate">{trainee.full_name || trainee.email}</p>
            <p className="text-xs text-slate-400">{trainee.email}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">{t.avg_score}</p>
              <p className={`font-bold ${stats.avgScore >= 70 ? 'text-green-400' : 'text-amber-400'}`}>
                {stats.avgScore}%
              </p>
            </div>

            <div className="w-24">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">{t.progress}</span>
                <span className="font-medium text-slate-300">{stats.progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    stats.progressPercentage >= 70 ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${stats.progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">{t.lessons_completed}</p>
              <p className="font-bold text-white">
                {stats.passedLessons}/{stats.totalLessons}
              </p>
            </div>
          </div>
        </div>

        <div className="ml-4 shrink-0 text-slate-600">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 pt-2 bg-slate-900/30 border-t border-slate-700/60">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <BookOpen size={14} className="text-slate-500" />
                {t.recent_activity}
              </h4>
              {stats.recentActivity.length === 0 ? (
                <p className="text-xs text-slate-500">{t.no_data}</p>
              ) : (
                <div className="space-y-2">
                  {stats.recentActivity.slice(0, 5).map((activity, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[180px]">
                        {activity.lessonName}
                      </span>
                      <span
                        className={`font-medium ${
                          activity.score >= 70 ? 'text-green-400' : 'text-amber-400'
                        }`}
                      >
                        {activity.score}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                {t.weak_areas || 'Weak Areas'}
              </h4>
              {stats.weakTopics.length === 0 ? (
                <p className="text-xs text-green-400">{t.all_topics_passed || 'All topics passed!'}</p>
              ) : (
                <div className="space-y-2">
                  {stats.weakTopics.map((topic, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[180px]">{topic.lessonName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-medium">{topic.avgScore}%</span>
                        <span className="text-slate-500">({topic.attempts}x)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <h4 className="font-semibold text-white text-sm mb-3">
                {t.overall_performance || 'Overall'}
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{t.passed}</span>
                    <span className="font-medium text-white">
                      {stats.passedLessons}/{stats.totalLessons}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${stats.totalLessons > 0 ? (stats.passedLessons / stats.totalLessons) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400">{t.attempts}</span>
                  <span className="font-medium text-white">{stats.totalAttempts}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{t.avg_score}</span>
                  <span
                    className={`font-bold ${stats.avgScore >= 70 ? 'text-green-400' : 'text-amber-400'}`}
                  >
                    {stats.avgScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

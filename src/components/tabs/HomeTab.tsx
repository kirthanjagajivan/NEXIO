import {
  Flame, Star, Zap, BookOpen, Target, TrendingUp,
  AlertTriangle, Award, CheckCircle, ChevronRight, Trophy, Shield, Rocket, Sparkles, PartyPopper
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { LessonRecord } from '../../hooks/usePerformance';
import type { ChapterWithTopics } from '../../hooks/useTraineeData';

const XP_PER_LESSON = 100;
const XP_PER_PASS = 50;
const DAILY_GOAL = 3;

interface HomeTabProps {
  chapters: ChapterWithTopics[];
  records: LessonRecord[];
  loading?: boolean;
  onSelectTopic: (topicId: string, topicTitle: string, chapterTitle: string) => void;
  onGoToLessons?: () => void;
}

function ProgressBar({ pct, color = 'bg-blue-500', height = 'h-2.5' }: { pct: number; color?: string; height?: string }) {
  return (
    <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${height} rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

export function HomeTab({ chapters, records, onSelectTopic, onGoToLessons }: HomeTabProps) {
  const { t } = useLanguage();

  const totalTopics = chapters.reduce((sum, ch) => sum + ch.topics.length, 0);

  const BADGES = [
    { id: 'first_lesson', icon: BookOpen, label: t.badge_first_lesson, desc: t.badge_first_lesson_desc, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', condition: (passed: number) => passed >= 1 },
    { id: 'three_passed', icon: Flame, label: t.badge_on_fire, desc: t.badge_on_fire_desc, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', condition: (passed: number) => passed >= 3 },
    { id: 'all_passed', icon: Trophy, label: t.badge_champion, desc: t.badge_champion_desc, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', condition: (passed: number, total: number) => passed >= total && total > 0 },
    { id: 'high_scorer', icon: Star, label: t.badge_high_scorer, desc: t.badge_high_scorer_desc, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', condition: (_: number, __: number, records: LessonRecord[]) => records.some(r => r.score / r.total >= 0.8) },
    { id: 'persistent', icon: Shield, label: t.badge_persistent, desc: t.badge_persistent_desc, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', condition: (_: number, __: number, records: LessonRecord[]) => records.some(r => r.attempts >= 3) },
    { id: 'rocket', icon: Rocket, label: t.badge_rocket, desc: t.badge_rocket_desc, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', condition: (_: number, __: number, records: LessonRecord[]) => records.some(r => r.attempts === 1 && r.score / r.total >= 0.9) },
  ];

  const passed = records.filter((r) => r.passed).length;
  const completionPct = totalTopics > 0 ? Math.round((records.length / totalTopics) * 100) : 0;
  const totalXP = passed * (XP_PER_LESSON + XP_PER_PASS) + (records.length - passed) * XP_PER_LESSON;
  const avgScore = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.score / r.total, 0) / records.length * 100)
    : 0;

  const today = new Date().toDateString();
  const dailyGoalDone = records.filter((r) => new Date(r.lastAttemptAt).toDateString() === today).length;
  const dailyGoalTarget = DAILY_GOAL;
  const dailyPct = Math.min(100, Math.round((dailyGoalDone / dailyGoalTarget) * 100));
  const dailyGoalMet = dailyGoalDone >= dailyGoalTarget;

  const weakRecords = records
    .filter((r) => r.score / r.total < 0.5)
    .sort((a, b) => a.score / a.total - b.score / b.total);

  const allTopics = chapters.flatMap((ch) =>
    ch.topics.map((t) => ({ topicId: t.id, topicTitle: t.title, chapterTitle: ch.title }))
  );
  const attemptedIds = new Set(records.map((r) => r.topicId));
  const recommended = allTopics.find((t) => !attemptedIds.has(t.topicId)) ?? null;

  const aiReview = (() => {
    const lowScoring = records
      .filter((r) => r.score / r.total < 0.6)
      .sort((a, b) => a.score / a.total - b.score / b.total)[0];
    if (!lowScoring) return null;
    const topic = allTopics.find((tp) => tp.topicId === lowScoring.topicId);
    if (!topic) return null;
    return {
      ...topic,
      score: lowScoring.score,
      total: lowScoring.total,
      pct: Math.round((lowScoring.score / lowScoring.total) * 100),
    };
  })();

  const competencies = chapters.map((ch) => {
    const chTopicIds = ch.topics.map((tp) => tp.id);
    const chRecords = records.filter((r) => chTopicIds.includes(r.topicId));
    const chPassed = chRecords.filter((r) => r.passed).length;
    const chTotal = ch.topics.length;
    const chAvg = chRecords.length > 0
      ? Math.round(chRecords.reduce((s, r) => s + r.score / r.total, 0) / chRecords.length * 100)
      : 0;
    return { id: ch.id, title: ch.title, passed: chPassed, total: chTotal, avg: chAvg, records: chRecords };
  });

  const earnedBadges = BADGES.filter((b) => b.condition(passed, totalTopics, records));

  return (
    <div className="space-y-5 pb-4">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-0.5">{t.welcome_back}</p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">Student</h2>
            <p className="text-blue-200 text-sm mt-1.5">
              {records.length === 0
                ? t.start_first_lesson
                : `${passed} ${t.lessons_passed} (${totalTopics})`}
            </p>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <Zap size={24} className="text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
            <Star size={14} className="text-yellow-300" />
            <span className="text-sm font-bold">{totalXP} {t.xp}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
            <Target size={14} className="text-green-300" />
            <span className="text-sm font-bold">{avgScore}{t.avg}</span>
          </div>
          {passed > 0 && (
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
              <Flame size={14} className="text-orange-300" />
              <span className="text-sm font-bold">{passed} {t.passed_label}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`rounded-2xl border shadow-sm p-5 transition-colors ${
          dailyGoalMet
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                dailyGoalMet ? 'bg-green-100' : 'bg-orange-50'
              }`}>
                {dailyGoalMet
                  ? <PartyPopper size={16} className="text-green-600" />
                  : <Flame size={16} className="text-orange-500" />
                }
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.daily_goal}</p>
                <p className={`text-sm font-bold ${dailyGoalMet ? 'text-green-700' : 'text-gray-800'}`}>
                  {dailyGoalMet ? t.goal_complete : `${dailyGoalTarget} ${t.lessons_today}`}
                </p>
              </div>
            </div>
            <span className={`text-2xl font-bold ${dailyGoalMet ? 'text-green-600' : 'text-orange-500'}`}>
              {dailyGoalDone}/{dailyGoalTarget}
            </span>
          </div>
          <ProgressBar
            pct={dailyPct}
            color={dailyGoalMet
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-orange-400 to-orange-500'
            }
            height="h-3"
          />
          <p className="text-xs text-gray-400 mt-2">
            {dailyGoalMet ? (
              <span className="font-semibold text-green-600">{dailyGoalTarget} {t.all_lessons_done_today}</span>
            ) : (
              <>
                <span className="font-semibold text-gray-600">{dailyGoalDone}</span> {t.done} &middot;{' '}
                <span className="font-semibold text-orange-500">{dailyGoalTarget - dailyGoalDone} {t.remaining}</span>
              </>
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.overall_progress}</p>
                <p className="text-sm font-bold text-gray-800">{t.course_completion}</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">{completionPct}%</span>
          </div>
          <ProgressBar pct={completionPct} color="bg-gradient-to-r from-blue-400 to-blue-600" height="h-3" />
          <p className="text-xs text-gray-400 mt-2">
            <span className="font-semibold text-gray-600">{records.length}</span> {t.of}{' '}
            <span className="font-semibold text-gray-600">{totalTopics}</span> {t.lessons_completed_xp} &middot;{' '}
            <span className="font-semibold text-blue-600">{totalXP} {t.xp}</span> earned
          </p>
        </div>
      </div>

      {aiReview && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Sparkles size={13} className="text-amber-600" />
            </div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">{t.ai_recommendation}</p>
          </div>
          <div className="p-5">
            <p className="text-sm font-semibold text-amber-700 mb-0.5">{t.ai_suggests_review}</p>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-3">
              {aiReview.chapterTitle}
            </p>
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{aiReview.topicTitle}</h3>
              <span className="shrink-0 text-sm font-bold text-red-500 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                {aiReview.pct}%
              </span>
            </div>
            <div className="mb-4">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-red-400 to-orange-400 transition-all duration-700"
                  style={{ width: `${aiReview.pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{t.ai_review_reason}</p>
            </div>
            <button
              onClick={() => onSelectTopic(aiReview.topicId, aiReview.topicTitle, aiReview.chapterTitle)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Sparkles size={14} />
              {t.review_lesson}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {recommended && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-1 flex items-center gap-2">
            <BookOpen size={15} className="text-blue-500" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.recommended_next}</p>
          </div>
          <div className="p-5 pt-3">
            <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wide mb-1">
              {recommended.chapterTitle}
            </p>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">{recommended.topicTitle}</h3>
            <button
              onClick={() => onSelectTopic(recommended.topicId, recommended.topicTitle, recommended.chapterTitle)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {t.start_lesson}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {competencies.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Target size={15} className="text-gray-500" />
            <h3 className="text-sm font-bold text-gray-800">{t.competency_areas}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {competencies.map((comp) => {
              const isWeak = comp.records.length > 0 && comp.avg < 50;
              const isStrong = comp.records.length > 0 && comp.avg >= 75;
              const barColor = isWeak ? 'bg-red-400' : isStrong ? 'bg-green-500' : 'bg-blue-500';
              return (
                <div key={comp.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{comp.title}</p>
                      {isWeak && (
                        <span className="shrink-0 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                          {t.needs_work}
                        </span>
                      )}
                      {isStrong && (
                        <span className="shrink-0 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                          {t.strong}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${isWeak ? 'text-red-500' : isStrong ? 'text-green-600' : 'text-gray-700'}`}>
                      {comp.records.length > 0 ? `${comp.avg}%` : '—'}
                    </span>
                  </div>
                  <ProgressBar pct={comp.avg} color={barColor} height="h-2" />
                  <p className="text-xs text-gray-400 mt-1.5">
                    {comp.passed}/{comp.total} {t.topics_passed}
                    {comp.records.length === 0 && ` · ${t.not_started}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {weakRecords.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-50 flex items-center gap-2 bg-red-50/50">
            <AlertTriangle size={15} className="text-red-500" />
            <h3 className="text-sm font-bold text-red-700">{t.weak_areas}</h3>
          </div>
          <div className="divide-y divide-red-50">
            {weakRecords.map((r) => {
              const pct = Math.round((r.score / r.total) * 100);
              const topic = allTopics.find((tp) => tp.topicId === r.topicId);
              return (
                <button
                  key={r.topicId}
                  onClick={() => topic && onSelectTopic(topic.topicId, topic.topicTitle, topic.chapterTitle)}
                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-red-50/60 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-red-700 transition-colors">
                      {r.lessonName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-red-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-red-500 shrink-0">{pct}%</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-red-300 shrink-0 group-hover:text-red-500 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <Award size={15} className="text-amber-500" />
          <h3 className="text-sm font-bold text-gray-800">{t.achievement_badges}</h3>
          <span className="ml-auto text-xs text-gray-400 font-medium">{earnedBadges.length}/{BADGES.length} earned</span>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADGES.map((badge) => {
            const earned = badge.condition(passed, totalTopics, records);
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`relative rounded-xl border p-3.5 flex flex-col items-center gap-2 text-center transition-all ${
                  earned
                    ? `${badge.bg} ${badge.border}`
                    : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
                }`}
              >
                {earned && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle size={12} className="text-green-500" />
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${earned ? badge.bg : 'bg-gray-100'}`}>
                  <Icon size={20} className={earned ? badge.color : 'text-gray-400'} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${earned ? 'text-gray-800' : 'text-gray-500'}`}>{badge.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onGoToLessons}
        className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <BookOpen size={16} />
        {t.browse_all_lessons}
      </button>
    </div>
  );
}

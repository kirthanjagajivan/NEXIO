import { ChevronDown, BookOpen, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { ChapterWithTopics } from '../../hooks/useTraineeData';
import type { LessonRecord } from '../../hooks/usePerformance';

interface LessonsTabProps {
  chapters: ChapterWithTopics[];
  records: LessonRecord[];
  loading: boolean;
  error: string | null;
  onSelectTopic?: (topicId: string, topicTitle: string, chapterTitle: string) => void;
}

export function LessonsTab({ chapters, records, loading, error, onSelectTopic }: LessonsTabProps) {
  const { t, isRTL } = useLanguage();
  const [expandedChapter, setExpandedChapter] = useState<string>(chapters[0]?.id ?? '');

  const recordMap = new Map(records.map((r) => [r.topicId, r]));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm font-medium">{t.loading_lessons}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 px-4 py-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        <AlertCircle size={18} className="shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <BookOpen size={36} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium">{t.no_lessons_yet}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter) => {
        const chapterTopicIds = chapter.topics.map((t) => t.id);
        const weakCount = chapterTopicIds.filter((id) => {
          const r = recordMap.get(id);
          return r && r.score / r.total < 0.5;
        }).length;

        return (
          <div key={chapter.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setExpandedChapter(expandedChapter === chapter.id ? '' : chapter.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-start ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-semibold text-gray-900 truncate">{chapter.title}</span>
                {weakCount > 0 && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                    <AlertTriangle size={9} />
                    {weakCount} {t.weak_label}
                  </span>
                )}
              </div>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform shrink-0 ml-2 ${
                  expandedChapter === chapter.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedChapter === chapter.id && (
              <div className="divide-y divide-gray-100">
                {chapter.topics.length === 0 ? (
                  <p className="px-6 py-3 text-sm text-gray-400 italic">{t.no_topics_in_chapter}</p>
                ) : (
                  chapter.topics.map((topic) => {
                    const record = recordMap.get(topic.id);
                    const pct = record ? Math.round((record.score / record.total) * 100) : null;
                    const isWeak = pct !== null && pct < 50;
                    const isPassed = record?.passed ?? false;

                    return (
                      <button
                        key={topic.id}
                        onClick={() => onSelectTopic?.(topic.id, topic.title, chapter.title)}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-start group ${
                          isRTL ? 'flex-row-reverse' : ''
                        } ${
                          isWeak
                            ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400'
                            : 'hover:bg-blue-50'
                        }`}
                      >
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                          isWeak ? 'bg-red-100' : isPassed ? 'bg-green-50' : 'bg-blue-50'
                        }`}>
                          {isWeak
                            ? <AlertTriangle size={15} className="text-red-500" />
                            : <BookOpen size={15} className={isPassed ? 'text-green-500' : 'text-blue-400 group-hover:text-blue-600'} />
                          }
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate text-sm ${
                            isWeak ? 'text-red-700' : 'text-gray-900 group-hover:text-blue-700'
                          }`}>
                            {topic.title}
                          </p>
                          {isWeak && (
                            <p className="text-[11px] text-red-500 font-semibold mt-0.5">
                              {t.weak_area_score} {pct}%
                            </p>
                          )}
                          {!isWeak && isPassed && (
                            <p className="text-[11px] text-green-600 font-medium mt-0.5">
                              {t.passed_score} {pct}%
                            </p>
                          )}
                        </div>

                        {pct !== null && (
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                              isWeak
                                ? 'text-red-600 bg-red-100'
                                : isPassed
                                  ? 'text-green-700 bg-green-50'
                                  : 'text-gray-500 bg-gray-100'
                            }`}>
                              {pct}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-1 overflow-hidden">
                              <div
                                className={`h-1 rounded-full transition-all ${
                                  isWeak ? 'bg-red-400' : isPassed ? 'bg-green-500' : 'bg-blue-400'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

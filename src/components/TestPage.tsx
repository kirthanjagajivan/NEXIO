import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, CheckCircle, XCircle, MinusCircle, ClipboardList,
  RefreshCw, Loader2, Trophy, AlertTriangle, ChevronRight, BookOpen,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useGeneratedQuestions } from '../hooks/useGeneratedQuestions';
import { savePerformance } from '../hooks/usePerformance';
import { AiExplanation, fetchExplanation } from './AiExplanation';
import type { MCQQuestion, FillBlankQuestion } from '../hooks/useGeneratedQuestions';

export type { MCQQuestion, FillBlankQuestion };

interface TestPageProps {
  topicId: string;
  topicTitle: string;
  chapterTitle: string;
  lessonContent: string;
  onBack: () => void;
  onRepeatLesson?: () => void;
  onNextTopic?: () => void;
}

type MCQAnswers = Record<string, number>;
type FillAnswers = Record<string, string>;
type Explanations = Record<string, string>;

export interface EvaluatedResult {
  mcqScore: number;
  mcqTotal: number;
  mcqAnswers: MCQAnswers;
  mcqQuestions: MCQQuestion[];
  fillScore: number;
  fillTotal: number;
  fillAnswers: FillAnswers;
  fillQuestions: FillBlankQuestion[];
  totalScore: number;
  grandTotal: number;
  lessonContent: string;
  explanations: Explanations;
}

const MCQ_MARKS_EACH = 5;
const FB_MARKS_EACH = 5;
const MCQ_COUNT = 5;
const FB_COUNT = 5;
const GRAND_TOTAL = MCQ_COUNT * MCQ_MARKS_EACH + FB_COUNT * FB_MARKS_EACH;
const PASS_THRESHOLD = 25;

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const color = pct >= 75 ? 'text-green-600 bg-green-50 border-green-200'
    : pct >= 50 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-red-500 bg-red-50 border-red-200';
  return (
    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${color}`}>
      {score} / {total}
    </span>
  );
}

function ProgressBar({ score, total, color }: { score: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function TestPage({ topicId, topicTitle, chapterTitle, lessonContent, onBack, onRepeatLesson, onNextTopic }: TestPageProps) {
  const { t, isRTL } = useLanguage();
  const { questions, loading, error: genError, generate } = useGeneratedQuestions();
  const [mcqAnswers, setMcqAnswers] = useState<MCQAnswers>({});
  const [fillAnswers, setFillAnswers] = useState<FillAnswers>({});
  const [result, setResult] = useState<EvaluatedResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generate(lessonContent, topicTitle);
  }, [lessonContent, topicTitle]);

  function handleRetry() {
    setMcqAnswers({});
    setFillAnswers({});
    setResult(null);
    generate(lessonContent, topicTitle);
  }

  const mcqQuestions = questions?.mcq ?? [];
  const fillBlankQuestions = questions?.fillBlank ?? [];

  const TOTAL_MCQ = mcqQuestions.length * MCQ_MARKS_EACH;
  const TOTAL_FB = fillBlankQuestions.length * FB_MARKS_EACH;

  async function handleSubmit() {
    setSubmitting(true);

    let mcqScore = 0;
    mcqQuestions.forEach((q) => {
      if (mcqAnswers[q.id] === q.correct) mcqScore += MCQ_MARKS_EACH;
    });

    let fillScore = 0;
    fillBlankQuestions.forEach((q) => {
      const ans = (fillAnswers[q.id] || '').trim().toLowerCase();
      if (ans === q.answer.toLowerCase()) fillScore += FB_MARKS_EACH;
    });

    const totalScore = mcqScore + fillScore;
    savePerformance(topicId, topicTitle, Math.round(totalScore), GRAND_TOTAL);

    const explanationRequests: Array<{ id: string; promise: Promise<string | null> }> = [];

    mcqQuestions.forEach((q) => {
      const chosen = mcqAnswers[q.id];
      if (chosen !== undefined && chosen !== q.correct) {
        explanationRequests.push({
          id: q.id,
          promise: fetchExplanation(q.question, q.options[q.correct], q.options[chosen], lessonContent),
        });
      }
    });

    fillBlankQuestions.forEach((q) => {
      const given = (fillAnswers[q.id] || '').trim();
      if (given && given.toLowerCase() !== q.answer.toLowerCase()) {
        explanationRequests.push({
          id: q.id,
          promise: fetchExplanation(`${q.before} _____ ${q.after}`, q.answer, given, lessonContent),
        });
      }
    });

    const resolved = await Promise.all(explanationRequests.map((r) => r.promise));
    const explanations: Explanations = {};
    explanationRequests.forEach((r, i) => {
      if (resolved[i]) explanations[r.id] = resolved[i]!;
    });

    setResult({
      mcqScore,
      mcqTotal: TOTAL_MCQ,
      mcqAnswers,
      mcqQuestions,
      fillScore,
      fillTotal: TOTAL_FB,
      fillAnswers,
      fillQuestions: fillBlankQuestions,
      totalScore: Math.round(totalScore),
      grandTotal: GRAND_TOTAL,
      lessonContent,
      explanations,
    });

    setSubmitting(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  if (genError === 'no_content') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
          <AlertTriangle size={28} className="text-amber-500" />
        </div>
        <div className="space-y-2 max-w-sm">
          <p className="text-gray-800 font-semibold text-lg">{t.no_content_available}</p>
          <p className="text-gray-400 text-sm">
            {t.no_content_available_desc}
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
          {t.back_to_lesson}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-gray-800 font-semibold text-lg">{t.generating_test}</p>
          <p className="text-gray-400 text-sm">{t.generating_test_desc}</p>
        </div>
      </div>
    );
  }

  if (result) {
    return <ResultsView result={result} topicTitle={topicTitle} chapterTitle={chapterTitle} onBack={onBack} onRepeatLesson={onRepeatLesson} onNextTopic={onNextTopic} isRTL={isRTL} t={t} />;
  }

  return (
    <div ref={topRef} className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft size={18} />
          <span>{t.back}</span>
        </button>
        <button
          onClick={handleRetry}
          title={t.regenerate_questions}
          className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium"
        >
          <RefreshCw size={13} />
          {t.new_questions}
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl px-6 py-8">
        <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">{chapterTitle} — {topicTitle}</p>
            <h1 className="text-3xl font-bold text-white">{t.testTitle}</h1>
            <p className="text-blue-200 text-sm mt-2">{t.sections_questions_marks}</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-3 text-center shrink-0">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">{t.totalMarks}</p>
            <p className="text-white text-3xl font-bold leading-none mt-1">{GRAND_TOTAL}</p>
          </div>
        </div>
      </div>

      <Section title={t.sectionMCQ} marks={TOTAL_MCQ} marksLabel={t.marks} color="blue" icon={<ClipboardList size={20} />}>
        <p className="text-xs text-gray-400 mb-4">5 questions &middot; {MCQ_MARKS_EACH} marks each</p>
        <div className="space-y-6">
          {mcqQuestions.map((q, qi) => (
            <div key={q.id} className="space-y-3">
              <p className="font-medium text-gray-900">
                <span className="text-blue-600 font-bold me-2">{qi + 1}.</span>
                {q.question}
                <span className="ms-2 text-xs text-gray-400 font-normal">({MCQ_MARKS_EACH} {t.marks})</span>
              </p>
              <div className="space-y-2 ps-4">
                {q.options.map((opt, oi) => {
                  const selected = mcqAnswers[q.id] === oi;
                  return (
                    <label
                      key={oi}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'} ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={oi}
                        checked={selected}
                        onChange={() => setMcqAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                        className="w-4 h-4 text-blue-600 shrink-0"
                      />
                      <span className={`text-sm text-gray-700 ${selected ? 'font-medium' : ''}`}>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t.sectionFillBlanks} marks={TOTAL_FB} marksLabel={t.marks} color="green" icon={<ClipboardList size={20} />}>
        <p className="text-xs text-gray-400 mb-4">5 questions &middot; {FB_MARKS_EACH} marks each</p>
        <div className="space-y-5">
          {fillBlankQuestions.map((q, qi) => (
            <div key={q.id} className="space-y-2">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                {qi + 1}. ({FB_MARKS_EACH} {t.marks})
              </p>
              <div className={`flex items-center flex-wrap gap-2 text-gray-900 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{q.before}</span>
                <input
                  type="text"
                  placeholder="________"
                  value={fillAnswers[q.id] || ''}
                  onChange={(e) => setFillAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  className="border-b-2 border-green-400 bg-transparent px-2 py-1 w-36 text-center text-green-700 font-semibold focus:outline-none focus:border-green-600 placeholder-gray-300 transition-colors"
                />
                <span>{q.after}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="pb-8">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {t.evaluating_answers}
            </>
          ) : t.submitTest}
        </button>
      </div>
    </div>
  );
}

interface ResultsViewProps {
  result: EvaluatedResult;
  topicTitle: string;
  chapterTitle: string;
  onBack: () => void;
  onRepeatLesson?: () => void;
  onNextTopic?: () => void;
  isRTL: boolean;
  t: Record<string, string>;
}

function ResultsView({ result, topicTitle, chapterTitle, onBack, onRepeatLesson, onNextTopic, isRTL, t }: ResultsViewProps) {
  const pct = Math.round((result.totalScore / result.grandTotal) * 100);
  const passed = result.totalScore >= PASS_THRESHOLD;

  const grade =
    pct >= 90 ? { label: 'A+', color: 'text-green-600' } :
    pct >= 80 ? { label: 'A', color: 'text-green-600' } :
    pct >= 70 ? { label: 'B', color: 'text-blue-600' } :
    pct >= 60 ? { label: 'C', color: 'text-amber-600' } :
    pct >= 50 ? { label: 'D', color: 'text-orange-500' } :
    { label: 'F', color: 'text-red-500' };

  return (
    <div className={`space-y-6 pb-8 ${isRTL ? 'text-right' : ''}`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <ArrowLeft size={18} />
        <span>{t.backToLesson}</span>
      </button>

      <div className={`rounded-xl px-6 py-8 text-center ${passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
        <div className="flex justify-center mb-3">
          {passed ? <Trophy className="w-14 h-14 text-white/90" /> : <AlertTriangle className="w-14 h-14 text-white/90" />}
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {passed ? t.congratulations : t.needImprovement}
        </h2>
        {passed && <p className="text-white/80 text-sm max-w-sm mx-auto">{t.youPassed}</p>}
        <p className="text-white/60 text-xs mt-2">{chapterTitle} — {topicTitle}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className={`flex items-center justify-between gap-6 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="text-center flex-1 min-w-[120px]">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">{t.score}</p>
              <p className="text-5xl font-bold text-gray-900">
                {result.totalScore}
                <span className="text-2xl text-gray-400 font-normal"> / {result.grandTotal}</span>
              </p>
            </div>
            <div className="w-px h-16 bg-gray-200 hidden sm:block" />
            <div className="text-center flex-1 min-w-[80px]">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">{t.percentage}</p>
              <p className={`text-5xl font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>{pct}%</p>
            </div>
            <div className="w-px h-16 bg-gray-200 hidden sm:block" />
            <div className="text-center flex-1 min-w-[80px]">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">{t.grade}</p>
              <p className={`text-5xl font-bold ${grade.color}`}>{grade.label}</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-1000 ${passed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>0</span>
              <span className="font-semibold text-gray-500">{t.pass_threshold}: {PASS_THRESHOLD} / {result.grandTotal}</span>
              <span>{result.grandTotal}</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 grid grid-cols-2 divide-x divide-gray-100">
          {[
            { label: t.mcq_section_label, score: result.mcqScore, total: result.mcqTotal, color: 'bg-blue-500' },
            { label: t.fill_blank_section_label, score: result.fillScore, total: result.fillTotal, color: 'bg-green-500' },
          ].map((sec) => (
            <div key={sec.label} className="p-4 text-center">
              <p className="text-xs text-gray-400 font-semibold mb-1 truncate">{sec.label}</p>
              <p className="text-xl font-bold text-gray-900">{sec.score}<span className="text-sm text-gray-400 font-normal"> / {sec.total}</span></p>
              <div className="mt-2"><ProgressBar score={sec.score} total={sec.total} color={sec.color} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-blue-50 border-b border-blue-200">
          <BookOpen size={18} className="text-blue-600" />
          <h3 className="font-bold text-blue-900">{t.sectionMCQ} {t.review_suffix}</h3>
          <div className="ms-auto"><ScoreBadge score={result.mcqScore} total={result.mcqTotal} /></div>
        </div>
        <div className="p-6 space-y-5">
          {result.mcqQuestions.map((q, qi) => {
            const chosen = result.mcqAnswers[q.id];
            const correct = chosen === q.correct;
            const unanswered = chosen === undefined;
            const explanation = result.explanations[q.id];
            return (
              <div key={q.id} className={`rounded-lg border p-4 ${correct ? 'border-green-200 bg-green-50' : unanswered ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'}`}>
                <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="shrink-0 mt-0.5">
                    {correct ? <CheckCircle size={18} className="text-green-600" /> : unanswered ? <MinusCircle size={18} className="text-gray-400" /> : <XCircle size={18} className="text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm mb-2">
                      <span className="text-gray-400 me-1">{qi + 1}.</span> {q.question}
                    </p>
                    <div className="space-y-1">
                      {chosen !== undefined ? (
                        <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded ${correct ? 'bg-green-100 text-green-800 font-medium' : 'bg-red-100 text-red-700'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {correct ? <CheckCircle size={13} className="text-green-600 shrink-0" /> : <XCircle size={13} className="text-red-500 shrink-0" />}
                          <span>{q.options[chosen]}</span>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded bg-gray-100 text-gray-400 italic ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <MinusCircle size={13} className="text-gray-400 shrink-0" />
                          <span>{t.no_answer_selected}</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-semibold">
                      {correct
                        ? <span className="text-green-700">{t.correct_marks} +{MCQ_MARKS_EACH} {t.marks}</span>
                        : unanswered
                        ? <span className="text-gray-400">{t.not_answered}</span>
                        : <><span className="text-red-600">{t.incorrect_marks}</span><span className="text-gray-400 ms-2">{t.correct_answer_prefix} {q.options[q.correct]}</span></>}
                    </p>
                    {!correct && !unanswered && explanation && <AiExplanation explanation={explanation} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-green-50 border-b border-green-200">
          <BookOpen size={18} className="text-green-600" />
          <h3 className="font-bold text-green-900">{t.sectionFillBlanks} {t.review_suffix}</h3>
          <div className="ms-auto"><ScoreBadge score={result.fillScore} total={result.fillTotal} /></div>
        </div>
        <div className="p-6 space-y-4">
          {result.fillQuestions.map((q, qi) => {
            const given = (result.fillAnswers[q.id] || '').trim();
            const correct = given.toLowerCase() === q.answer.toLowerCase();
            const unanswered = !given;
            const explanation = result.explanations[q.id];
            return (
              <div key={q.id} className={`rounded-lg border p-4 ${correct ? 'border-green-200 bg-green-50' : unanswered ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="shrink-0">
                    {correct ? <CheckCircle size={18} className="text-green-600" /> : unanswered ? <MinusCircle size={18} className="text-gray-400" /> : <XCircle size={18} className="text-red-500" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <span className="text-gray-500">{q.before} </span>
                    <span className={`font-bold px-2 py-0.5 rounded ${correct ? 'text-green-700 bg-green-100' : unanswered ? 'text-gray-400 bg-gray-100 italic' : 'text-red-600 bg-red-100'}`}>
                      {given || t.blank_placeholder}
                    </span>
                    <span className="text-gray-500"> {q.after}</span>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${correct ? 'text-green-600' : 'text-gray-400'}`}>
                    {correct ? `+${FB_MARKS_EACH}` : '0'} {t.marks}
                  </span>
                </div>
                {!correct && !unanswered && explanation && <AiExplanation explanation={explanation} />}
                {!correct && !unanswered && (
                  <p className="mt-2 text-xs text-gray-500 ms-9">{t.correct_answer_label} <span className="font-semibold text-gray-700">{q.answer}</span></p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {passed ? (
          <>
            <button
              onClick={onBack}
              className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors active:scale-[0.99]"
            >
              {t.backToLesson}
            </button>
            <button
              onClick={onNextTopic}
              className={`flex-[2] py-4 bg-green-600 text-white rounded-xl font-bold text-base hover:bg-green-700 transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <span>{onNextTopic ? t.nextTopic : t.allTopicsComplete}</span>
              <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onBack}
              className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors active:scale-[0.99]"
            >
              {t.backToLesson}
            </button>
            <button
              onClick={onRepeatLesson}
              className={`flex-[2] py-4 bg-orange-500 text-white rounded-xl font-bold text-base hover:bg-orange-600 transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <RefreshCw size={18} />
              <span>{t.repeatLesson}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  marks: number;
  marksLabel: string;
  color: 'blue' | 'green';
  icon: React.ReactNode;
  children: React.ReactNode;
}

const colorMap = {
  blue: { header: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-600', title: 'text-blue-900', border: 'border-blue-200' },
  green: { header: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', icon: 'text-green-600', title: 'text-green-900', border: 'border-green-200' },
};

function Section({ title, marks, marksLabel, color, icon, children }: SectionProps) {
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-xl border ${c.border} overflow-hidden`}>
      <div className={`flex items-center justify-between px-6 py-4 border-b ${c.header}`}>
        <div className={`flex items-center gap-2 ${c.icon}`}>
          {icon}
          <h2 className={`font-bold text-base ${c.title}`}>{title}</h2>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${c.badge}`}>
          {marks} {marksLabel}
        </span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export { CheckCircle, XCircle, MinusCircle, Loader2, RefreshCw } from 'lucide-react';
export type { EvaluatedResult as default };

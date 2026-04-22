const STORAGE_KEY = 'trainee_performance';

export interface LessonRecord {
  lessonName: string;
  topicId: string;
  score: number;
  total: number;
  passed: boolean;
  attempts: number;
  lastAttemptAt: string;
  scoreHistory: number[];
}

function loadRecords(): LessonRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LessonRecord[]) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: LessonRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function savePerformance(topicId: string, lessonName: string, score: number, total: number): void {
  const PASS_THRESHOLD = 30;
  const passed = score >= PASS_THRESHOLD;
  const records = loadRecords();
  const idx = records.findIndex((r) => r.topicId === topicId);

  if (idx >= 0) {
    const existing = records[idx];
    records[idx] = {
      ...existing,
      score,
      total,
      passed,
      attempts: existing.attempts + 1,
      lastAttemptAt: new Date().toISOString(),
      scoreHistory: [...(existing.scoreHistory ?? [existing.score]), score],
    };
  } else {
    records.push({
      lessonName,
      topicId,
      score,
      total,
      passed,
      attempts: 1,
      lastAttemptAt: new Date().toISOString(),
      scoreHistory: [score],
    });
  }

  saveRecords(records);
}

export function getPerformanceRecords(): LessonRecord[] {
  return loadRecords();
}

export function clearPerformance(): void {
  localStorage.removeItem(STORAGE_KEY);
}

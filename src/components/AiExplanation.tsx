import { Lightbulb } from 'lucide-react';

interface AiExplanationProps {
  explanation: string;
}

export function AiExplanation({ explanation }: AiExplanationProps) {
  return (
    <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
      <Lightbulb size={14} className="text-blue-500 shrink-0 mt-0.5" />
      <p className="text-xs text-blue-800 leading-relaxed">{explanation}</p>
    </div>
  );
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function fetchExplanation(
  question: string,
  correctAnswer: string,
  userAnswer: string,
  lessonContent: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/explain-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ question, correctAnswer, userAnswer, lessonContent }),
    });
    const data = await res.json();
    return data.explanation ?? null;
  } catch {
    return null;
  }
}

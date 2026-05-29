import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CEFR_LABELS: Record<string, string> = {
  beginner:     "A1/A2",
  intermediate: "B1/B2",
  advanced:     "C1",
  native:       "C2",
};

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function findTermSentences(lessonContent: string, term: string): string[] {
  const lower = term.toLowerCase();
  return splitSentences(lessonContent).filter((s) =>
    s.toLowerCase().includes(lower)
  );
}

function truncateSentence(sentence: string, maxWords: number): string {
  const words = sentence.split(/\s+/);
  if (words.length <= maxWords) return sentence;
  return words.slice(0, maxWords).join(" ") + "…";
}

function buildLessonLangExplanation(
  term: string,
  termSentences: string[],
  proficiency: string,
): string {
  if (termSentences.length === 0) {
    return `"${term}" is a key term in this lesson. Read the surrounding text carefully for context.`;
  }

  const sorted = [...termSentences].sort((a, b) => a.length - b.length);
  const primary = sorted[0];

  switch (proficiency) {
    case "beginner":
      return truncateSentence(primary, 20);
    case "intermediate":
      if (sorted.length >= 2) {
        return truncateSentence(primary, 35) + " " + truncateSentence(sorted[1], 30);
      }
      return truncateSentence(primary, 40);
    case "advanced":
    case "native":
      return termSentences.slice(0, 3).join(" ");
    default:
      return truncateSentence(primary, 35);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const term: string = (body.term ?? "").trim();
    const lessonContent: string = (body.lessonContent ?? "").trim();
    const lessonLang: string = body.lessonLang ?? "en";
    const studentLang: string = body.studentLang ?? "en";
    const germanProficiency: string = body.germanProficiency ?? "intermediate";

    if (!term || !lessonContent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: term and lessonContent" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cefrLabel = CEFR_LABELS[germanProficiency] ?? "B1/B2";
    const termSentences = findTermSentences(lessonContent, term);
    const lessonLangExplanation = buildLessonLangExplanation(term, termSentences, germanProficiency);

    // Pick an example sentence different from the one used as the main explanation
    const sorted = [...termSentences].sort((a, b) => a.length - b.length);
    const primary = sorted[0];
    const exampleSentence = termSentences.find((s) => s !== primary) ?? null;

    return new Response(
      JSON.stringify({
        lesson_lang_explanation: lessonLangExplanation,
        student_lang_explanation: lessonLangExplanation,
        example_sentence: exampleSentence,
        cefr_level: cefrLabel,
        lessonLang,
        studentLang,
        isSameLang: lessonLang === studentLang,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

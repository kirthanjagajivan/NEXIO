import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function extractSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function extractKeyTerms(text: string): string[] {
  const stopWords = new Set([
    "the", "and", "that", "this", "with", "from", "they", "have", "been",
    "used", "also", "into", "their", "which", "between", "multiple", "other",
    "each", "some", "such", "where", "when", "what", "both", "more", "than",
    "called", "well", "real", "wide", "help", "work", "make", "using", "for",
    "are", "not", "can", "its", "designed", "allows", "known", "these", "those",
    "will", "has", "was", "were", "does", "did", "would", "could", "should",
  ]);
  const words = text
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 3 && !stopWords.has(w.toLowerCase()));
  return [...new Set(words)];
}

function buildContentBasedFallback(lessonContent: string, topicTitle: string): object {
  const sentences = extractSentences(lessonContent);
  const keyTerms = extractKeyTerms(lessonContent);

  if (sentences.length === 0 || keyTerms.length < 4) {
    return { mcq: [], fillBlank: [] };
  }

  const mcq: object[] = [];
  const fillBlank: object[] = [];

  sentences.slice(0, 8).forEach((sentence) => {
    const sentenceTerms = extractKeyTerms(sentence);
    if (sentenceTerms.length < 1) return;
    if (mcq.length >= 5) return;

    const correctTerm = sentenceTerms[0];
    const distractors = keyTerms
      .filter((t) => t.toLowerCase() !== correctTerm.toLowerCase())
      .slice(0, 3);

    if (distractors.length < 3) return;

    const question = sentence.replace(
      new RegExp(`\\b${correctTerm}\\b`, "i"),
      "___"
    );

    if (!question.includes("___")) return;

    const options = [correctTerm, ...distractors].sort(() => 0.5 - Math.random());
    const correctIndex = options.findIndex(
      (o) => o.toLowerCase() === correctTerm.toLowerCase()
    );

    mcq.push({
      id: `mcq-${mcq.length + 1}`,
      question: `Fill in the blank: "${question}"`,
      options,
      correct: correctIndex,
    });
  });

  sentences.slice(0, 8).forEach((sentence) => {
    if (fillBlank.length >= 5) return;
    const terms = extractKeyTerms(sentence);
    const term = terms.find((t) => t.length > 3);
    if (!term) return;

    const lower = sentence.toLowerCase();
    const idx = lower.indexOf(term.toLowerCase());
    if (idx < 0) return;

    const before = sentence.slice(0, idx).trim();
    const after = sentence.slice(idx + term.length).trim();

    if (!before || !after) return;

    fillBlank.push({
      id: `fb-${fillBlank.length + 1}`,
      before,
      after,
      answer: term,
    });
  });

  return { mcq, fillBlank };
}

function extractText(result: unknown): string {
  if (typeof result === "string") return result.trim();

  if (result && typeof result === "object") {
    const obj = result as Record<string, unknown>;

    if (Array.isArray(obj.choices) && obj.choices[0]) {
      const choice = obj.choices[0] as Record<string, unknown>;
      if (choice.message && typeof choice.message === "object") {
        const msg = choice.message as Record<string, unknown>;
        return String(msg.content ?? "").trim();
      }
      if (typeof choice.text === "string") return choice.text.trim();
    }

    if (typeof obj.text === "string") return obj.text.trim();
    if (typeof obj.content === "string") return obj.content.trim();
  }

  return "";
}

function validateAndPatchQuestions(
  parsed: Record<string, unknown>,
  lessonContent: string,
  topicTitle: string
): Record<string, unknown> {
  const fallback = buildContentBasedFallback(lessonContent, topicTitle) as Record<string, unknown>;

  const lowerContent = lessonContent.toLowerCase();

  const isContentBased = (text: string): boolean => {
    if (!text) return false;
    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    if (words.length === 0) return false;
    const matches = words.filter((w) => lowerContent.includes(w));
    return matches.length >= Math.min(2, words.length);
  };

  const genericPhrases = [
    "this topic", "unrelated topic", "ancient history", "mathematics",
    "geography", "cooking", "music", "architecture of", "science fiction",
    "ancient art", "memorizing formulas", "ignoring key terms",
    "memorizing unrelated", "skipping the content", "different chapter",
    "none of the above", "all of the above", "not mentioned",
  ];

  const hasGenericContent = (text: string): boolean => {
    const lower = text.toLowerCase();
    return genericPhrases.some((phrase) => lower.includes(phrase));
  };

  const mcqRaw = Array.isArray(parsed.mcq) ? parsed.mcq as Record<string, unknown>[] : [];
  const validMcq = mcqRaw.filter((q) => {
    const question = String(q.question ?? "");
    const options = Array.isArray(q.options) ? (q.options as string[]) : [];
    const correct = typeof q.correct === "number" ? q.correct : -1;
    return (
      question.length > 10 &&
      !hasGenericContent(question) &&
      options.length === 4 &&
      correct >= 0 && correct < options.length &&
      options.every((o) => !hasGenericContent(String(o)) && String(o).length > 1) &&
      (isContentBased(question) || options.some((o) => isContentBased(String(o))))
    );
  });

  const fbRaw = Array.isArray(parsed.fillBlank) ? parsed.fillBlank as Record<string, unknown>[] : [];
  const validFb = fbRaw.filter((q) => {
    const before = String(q.before ?? "");
    const after = String(q.after ?? "");
    const answer = String(q.answer ?? "");
    return (
      answer.length > 1 &&
      before.length > 3 &&
      after.length > 3 &&
      !hasGenericContent(before) &&
      !hasGenericContent(after) &&
      lowerContent.includes(answer.toLowerCase())
    );
  });

  const fallbackMcq = (fallback.mcq as object[]) ?? [];
  const fallbackFb = (fallback.fillBlank as object[]) ?? [];

  return {
    mcq: validMcq.length >= 3 ? validMcq : fallbackMcq,
    fillBlank: validFb.length >= 3 ? validFb : fallbackFb,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { lessonContent, topicTitle, seed } = await req.json();

    const content = (lessonContent ?? "").trim();
    const title = (topicTitle ?? "").trim();

    if (content.length < 20) {
      return new Response(JSON.stringify({ mcq: [], fillBlank: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyTerms = extractKeyTerms(content).slice(0, 25).join(", ");
    const sentences = extractSentences(content).slice(0, 8).join(" | ");

    const prompt = `You are a strict technical quiz generator. Your ONLY source of knowledge is the LESSON CONTENT below. Do NOT use any outside knowledge.

LESSON CONTENT:
"""
${content}
"""

TOPIC: ${title}
KEY TERMS EXTRACTED FROM LESSON: ${keyTerms}
REPRESENTATIVE SENTENCES: ${sentences}
SEED (for variation): ${seed}

STRICT RULES — violating any rule makes the output invalid:
1. Every question, answer option, and fill-in-the-blank answer MUST come directly from the lesson content above.
2. MCQ wrong options MUST be other real terms or concepts mentioned in the lesson — not invented words.
3. Fill-in-the-blank "answer" MUST be a single word or short phrase that appears verbatim in the lesson.
4. MCQ questions MUST test understanding of concepts, definitions, or facts from the lesson.
5. Questions MUST use technical terminology from the lesson — not generic phrases.
6. NEVER use: "this topic", "none of the above", "all of the above", "unrelated", generic subjects like "cooking", "geography", "mathematics", "history", "art".
7. Do NOT pad with generic questions if the lesson has limited content — generate fewer but accurate questions.
8. Output ONLY raw JSON. No markdown. No code fences. No explanation text.
9. Generate EXACTLY 5 MCQ questions and EXACTLY 5 fill-in-the-blank questions.

REQUIRED JSON FORMAT (5 MCQ, 5 fill-in-the-blank, NO short answer):
{"mcq":[{"id":"mcq-1","question":"QUESTION FROM LESSON?","options":["LESSON TERM A","LESSON TERM B","LESSON TERM C","LESSON TERM D"],"correct":0},{"id":"mcq-2","question":"QUESTION FROM LESSON?","options":["LESSON TERM A","LESSON TERM B","LESSON TERM C","LESSON TERM D"],"correct":2},{"id":"mcq-3","question":"QUESTION FROM LESSON?","options":["LESSON TERM A","LESSON TERM B","LESSON TERM C","LESSON TERM D"],"correct":1},{"id":"mcq-4","question":"QUESTION FROM LESSON?","options":["LESSON TERM A","LESSON TERM B","LESSON TERM C","LESSON TERM D"],"correct":3},{"id":"mcq-5","question":"QUESTION FROM LESSON?","options":["LESSON TERM A","LESSON TERM B","LESSON TERM C","LESSON TERM D"],"correct":0}],"fillBlank":[{"id":"fb-1","before":"EXACT TEXT BEFORE BLANK FROM LESSON","after":"EXACT TEXT AFTER BLANK FROM LESSON","answer":"WORD_FROM_LESSON"},{"id":"fb-2","before":"EXACT TEXT BEFORE BLANK FROM LESSON","after":"EXACT TEXT AFTER BLANK FROM LESSON","answer":"WORD_FROM_LESSON"},{"id":"fb-3","before":"EXACT TEXT BEFORE BLANK FROM LESSON","after":"EXACT TEXT AFTER BLANK FROM LESSON","answer":"WORD_FROM_LESSON"},{"id":"fb-4","before":"EXACT TEXT BEFORE BLANK FROM LESSON","after":"EXACT TEXT AFTER BLANK FROM LESSON","answer":"WORD_FROM_LESSON"},{"id":"fb-5","before":"EXACT TEXT BEFORE BLANK FROM LESSON","after":"EXACT TEXT AFTER BLANK FROM LESSON","answer":"WORD_FROM_LESSON"}]}

Generate the quiz now using ONLY the lesson content provided:`;

    const session = new Supabase.ai.Session("llama3.1-8b");
    const result = await session.run(prompt, {
      max_tokens: 2800,
      stream: false,
    }) as unknown;

    const raw = extractText(result);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        const safe = validateAndPatchQuestions(parsed, content, title);
        return new Response(JSON.stringify(safe), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        // fall through to content-based fallback
      }
    }

    return new Response(JSON.stringify(buildContentBasedFallback(content, title)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ mcq: [], fillBlank: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

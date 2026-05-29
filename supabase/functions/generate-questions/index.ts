import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// German stop words included so the fallback still works for German content
const STOP_WORDS_EN = new Set([
  "the", "and", "that", "this", "with", "from", "they", "have", "been",
  "used", "also", "into", "their", "which", "between", "multiple", "other",
  "each", "some", "such", "where", "when", "what", "both", "more", "than",
  "called", "well", "real", "wide", "help", "work", "make", "using", "for",
  "are", "not", "can", "its", "designed", "allows", "known", "these", "those",
  "will", "has", "was", "were", "does", "did", "would", "could", "should",
]);

const STOP_WORDS_DE = new Set([
  "der", "die", "das", "und", "oder", "aber", "mit", "von", "zu", "für",
  "bei", "aus", "nach", "über", "unter", "durch", "an", "auf", "in", "ist",
  "sind", "war", "waren", "hat", "haben", "wird", "werden", "kann", "können",
  "muss", "müssen", "ein", "eine", "einen", "dem", "den", "des", "sich",
  "auch", "noch", "als", "wenn", "dann", "einer", "einem", "einen", "dieser",
  "diese", "dieses", "welche", "welcher", "dass", "nicht", "mehr", "sehr",
  "wird", "beim", "beim", "damit", "dazu", "wie", "alle", "wird", "dabei",
  "werden", "einen", "einer", "sowohl", "bereits", "hierbei", "darf", "wird",
]);

function extractSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

// Unicode-aware: preserve letters from any language including German umlauts
function extractKeyTerms(text: string, lang: "de" | "en" | "other"): string[] {
  const stopWords = lang === "de" ? STOP_WORDS_DE : STOP_WORDS_EN;
  // Replace anything that's not a Unicode letter, digit, hyphen, or whitespace with a space
  const cleaned = text.replace(/[^\p{L}\p{N}\s-]/gu, " ");
  const words = cleaned
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 3 && !stopWords.has(w.toLowerCase()));
  return [...new Set(words)];
}

// Simple heuristic language detector based on common function words
function detectLanguage(text: string): "de" | "en" | "other" {
  const lower = text.toLowerCase();
  const sample = lower.slice(0, 2000);

  const deMarkers = ["der ", "die ", "das ", "und ", "ist ", "sind ", "wird ", "nicht ", "auch ", "eine ", "einen ", "haben ", "können ", "werden "];
  const enMarkers = ["the ", "and ", "that ", "this ", "with ", "from ", "they ", "have ", "been ", "also ", "which ", "some ", "would ", "could "];

  const deScore = deMarkers.filter((m) => sample.includes(m)).length;
  const enScore = enMarkers.filter((m) => sample.includes(m)).length;

  // German umlauts are a strong signal
  const hasUmlauts = /[äöüßÄÖÜ]/.test(text);
  const adjustedDe = deScore + (hasUmlauts ? 5 : 0);

  if (adjustedDe > enScore) return "de";
  if (enScore > adjustedDe) return "en";
  return "other";
}

function buildContentBasedFallback(lessonContent: string, topicTitle: string): object {
  const lang = detectLanguage(lessonContent);
  const sentences = extractSentences(lessonContent);
  const keyTerms = extractKeyTerms(lessonContent, lang);

  if (sentences.length === 0 || keyTerms.length < 4) {
    return { mcq: [], fillBlank: [] };
  }

  const mcq: object[] = [];
  const fillBlank: object[] = [];

  sentences.slice(0, 10).forEach((sentence) => {
    const sentenceTerms = extractKeyTerms(sentence, lang);
    if (sentenceTerms.length < 1) return;
    if (mcq.length >= 5) return;

    const correctTerm = sentenceTerms[0];
    const distractors = keyTerms
      .filter((t) => t.toLowerCase() !== correctTerm.toLowerCase())
      .slice(0, 3);

    if (distractors.length < 3) return;

    // Use a Unicode-aware word boundary approach: replace first occurrence
    const escapedTerm = correctTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // For languages with umlauts, simple includes-based replacement is safer than \b
    const idx = sentence.toLowerCase().indexOf(correctTerm.toLowerCase());
    if (idx < 0) return;
    const question = sentence.slice(0, idx) + "___" + sentence.slice(idx + correctTerm.length);
    if (!question.includes("___")) return;

    const options = [correctTerm, ...distractors].sort(() => 0.5 - Math.random());
    const correctIndex = options.findIndex(
      (o) => o.toLowerCase() === correctTerm.toLowerCase()
    );

    const prefix = lang === "de" ? "Füllen Sie die Lücke aus:" : "Fill in the blank:";
    mcq.push({
      id: `mcq-${mcq.length + 1}`,
      question: `${prefix} "${question}"`,
      options,
      correct: correctIndex,
    });
  });

  sentences.slice(0, 10).forEach((sentence) => {
    if (fillBlank.length >= 5) return;
    const terms = extractKeyTerms(sentence, lang);
    const term = terms.find((t) => t.length > 3);
    if (!term) return;

    const idx = sentence.toLowerCase().indexOf(term.toLowerCase());
    if (idx < 0) return;

    const before = sentence.slice(0, idx).trim();
    const after = sentence.slice(idx + term.length).trim();

    if (!before || !after) return;

    fillBlank.push({
      id: `fb-${fillBlank.length + 1}`,
      before,
      after,
      answer: sentence.slice(idx, idx + term.length), // preserve original casing
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
  topicTitle: string,
  lang: "de" | "en" | "other"
): Record<string, unknown> {
  const fallback = buildContentBasedFallback(lessonContent, topicTitle) as Record<string, unknown>;

  // Normalize for inclusion checks: fold to lowercase but keep umlauts intact
  const lowerContent = lessonContent.toLowerCase();

  const isContentBased = (text: string): boolean => {
    if (!text) return false;
    // Split on whitespace + punctuation to get words; keep unicode letters
    const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 4);
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
    "dieses thema", "kochrezepte", "mittelalter", "geographie",
  ];

  const hasGenericContent = (text: string): boolean => {
    const lower = text.toLowerCase();
    return genericPhrases.some((phrase) => lower.includes(phrase));
  };

  const answerInContent = (answer: string): boolean => {
    return lowerContent.includes(answer.toLowerCase());
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
      answerInContent(answer)
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

    const lang = detectLanguage(content);
    const keyTerms = extractKeyTerms(content, lang).slice(0, 25).join(", ");
    const sentences = extractSentences(content).slice(0, 8).join(" | ");

    // Language-specific prompt instruction
    const langInstruction = lang === "de"
      ? "The lesson content is in GERMAN. Generate ALL questions, answer options, and fill-in-the-blank text in GERMAN. Preserve all German umlauts (ä, ö, ü, ß) correctly."
      : lang === "en"
      ? "The lesson content is in ENGLISH. Generate ALL questions and answers in ENGLISH."
      : "Detect the language of the lesson content and generate ALL questions in the SAME language as the content.";

    const prompt = `You are a strict technical quiz generator. Your ONLY source of knowledge is the LESSON CONTENT below. Do NOT use any outside knowledge.

LANGUAGE INSTRUCTION: ${langInstruction}

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
3. Fill-in-the-blank "answer" MUST be a single word or short phrase that appears verbatim in the lesson content.
4. MCQ questions MUST test understanding of concepts, definitions, or facts from the lesson.
5. Questions MUST use technical terminology from the lesson — not generic phrases.
6. NEVER use: "this topic", "none of the above", "all of the above", "unrelated", generic subjects.
7. Do NOT pad with generic questions — generate fewer but accurate questions if needed.
8. Output ONLY raw JSON. No markdown. No code fences. No explanation text.
9. Generate EXACTLY 5 MCQ questions and EXACTLY 5 fill-in-the-blank questions.
10. If the lesson is in German, ALL text in the JSON must be in German with correct umlauts.

REQUIRED JSON FORMAT (5 MCQ, 5 fill-in-the-blank):
{"mcq":[{"id":"mcq-1","question":"QUESTION?","options":["A","B","C","D"],"correct":0},{"id":"mcq-2","question":"QUESTION?","options":["A","B","C","D"],"correct":2},{"id":"mcq-3","question":"QUESTION?","options":["A","B","C","D"],"correct":1},{"id":"mcq-4","question":"QUESTION?","options":["A","B","C","D"],"correct":3},{"id":"mcq-5","question":"QUESTION?","options":["A","B","C","D"],"correct":0}],"fillBlank":[{"id":"fb-1","before":"TEXT BEFORE BLANK","after":"TEXT AFTER BLANK","answer":"WORD"},{"id":"fb-2","before":"TEXT BEFORE BLANK","after":"TEXT AFTER BLANK","answer":"WORD"},{"id":"fb-3","before":"TEXT BEFORE BLANK","after":"TEXT AFTER BLANK","answer":"WORD"},{"id":"fb-4","before":"TEXT BEFORE BLANK","after":"TEXT AFTER BLANK","answer":"WORD"},{"id":"fb-5","before":"TEXT BEFORE BLANK","after":"TEXT AFTER BLANK","answer":"WORD"}]}

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
        const safe = validateAndPatchQuestions(parsed, content, title, lang);
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

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  de: "German",
  tr: "Turkish",
  ar: "Arabic",
  ru: "Russian",
};

// Map app proficiency values to CEFR levels and concrete guidance
const PROFICIENCY_CONFIG: Record<string, {
  cefrLabel: string;
  guidanceLesson: string;
  guidanceNative: string;
}> = {
  beginner: {
    cefrLabel: "A1/A2 (Beginner)",
    guidanceLesson:
      "Use extremely simple vocabulary. Avoid technical jargon. Write short sentences (max 12 words each). " +
      "Use everyday analogies. Define any term you use. This student is at A1/A2 level.",
    guidanceNative:
      "Translate into simple, everyday language. Short sentences. No jargon.",
  },
  intermediate: {
    cefrLabel: "B1/B2 (Intermediate)",
    guidanceLesson:
      "Use clear, moderately simple vocabulary. You may use the technical term itself once it is explained. " +
      "Sentences can be slightly longer but stay concise. This student is at B1/B2 level.",
    guidanceNative:
      "Translate naturally. Keep it accessible; avoid overly academic phrasing.",
  },
  advanced: {
    cefrLabel: "C1 (Advanced)",
    guidanceLesson:
      "You may use technical vocabulary and domain-specific language freely. " +
      "Provide a precise, detailed explanation. The student is at C1 level and can handle complexity.",
    guidanceNative:
      "Translate accurately with full technical detail preserved.",
  },
  native: {
    cefrLabel: "C2/Native",
    guidanceLesson:
      "Provide a concise, expert-level definition. Assume full command of the language and domain. " +
      "No need to simplify. The student is a native/near-native speaker.",
    guidanceNative:
      "Translate with full precision. The student understands complex sentence structures.",
  },
};

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { term, lessonContent, lessonLang, studentLang, germanProficiency } = await req.json();

    if (!term || !lessonContent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lessonLangName = LANGUAGE_NAMES[lessonLang] ?? "English";
    const studentLangName = LANGUAGE_NAMES[studentLang] ?? "English";
    const isSameLang = lessonLang === studentLang;

    // Proficiency config — default to intermediate if not provided
    const profConfig = PROFICIENCY_CONFIG[germanProficiency ?? "intermediate"] ?? PROFICIENCY_CONFIG.intermediate;

    // Build a concise excerpt around the term for context
    const termIndex = lessonContent.toLowerCase().indexOf(term.toLowerCase());
    const start = Math.max(0, termIndex - 300);
    const end = Math.min(lessonContent.length, termIndex + 600);
    const excerpt = lessonContent.slice(start, end).trim();

    const prompt = `You are a technical vocabulary assistant adapting explanations to a student's language level.

LESSON EXCERPT (the term appears in this text):
"""
${excerpt}
"""

TERM TO EXPLAIN: "${term}"
LESSON LANGUAGE: ${lessonLangName}
STUDENT'S NATIVE LANGUAGE: ${studentLangName}
STUDENT'S GERMAN PROFICIENCY: ${profConfig.cefrLabel}

INSTRUCTIONS FOR THE ${lessonLangName.toUpperCase()} EXPLANATION (lesson_lang_explanation):
- Base it ONLY on the lesson excerpt above.
- ${profConfig.guidanceLesson}
- Maximum 3 sentences.

INSTRUCTIONS FOR THE ${studentLangName.toUpperCase()} EXPLANATION (student_lang_explanation):
${isSameLang
  ? `- The lesson language and the student's native language are both ${lessonLangName}. Set student_lang_explanation to the same text as lesson_lang_explanation.`
  : `- Translate the ${lessonLangName} explanation into ${studentLangName}.
- ${profConfig.guidanceNative}
- Preserve the meaning exactly.`
}

OUTPUT RULES:
- Output ONLY valid JSON. No markdown, no code fences, no extra text.
- Both fields must be non-empty strings.

REQUIRED FORMAT:
{"lesson_lang_explanation":"<explanation in ${lessonLangName}>","student_lang_explanation":"<explanation in ${studentLangName}>"}`;

    const session = new Supabase.ai.Session("llama3.1-8b");
    const result = await session.run(prompt, {
      max_tokens: 450,
      stream: false,
    }) as unknown;

    const raw = extractText(result);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        const lessonExp = String(parsed.lesson_lang_explanation ?? "").trim();
        const studentExp = String(parsed.student_lang_explanation ?? "").trim();

        if (lessonExp) {
          return new Response(
            JSON.stringify({
              lesson_lang_explanation: lessonExp,
              student_lang_explanation: studentExp || lessonExp,
              cefr_level: profConfig.cefrLabel,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch {
        // fall through to fallback
      }
    }

    const fallback = raw.slice(0, 300) || `"${term}" is a technical term used in this lesson. Please refer to the lesson content for its meaning.`;
    return new Response(
      JSON.stringify({
        lesson_lang_explanation: fallback,
        student_lang_explanation: fallback,
        cefr_level: profConfig.cefrLabel,
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

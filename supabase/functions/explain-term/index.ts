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
    const { term, lessonContent, lessonLang, studentLang } = await req.json();

    if (!term || !lessonContent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lessonLangName = LANGUAGE_NAMES[lessonLang] ?? "English";
    const studentLangName = LANGUAGE_NAMES[studentLang] ?? "English";
    const isSameLang = lessonLang === studentLang;

    // Build a concise excerpt around the term for context (keep prompt short)
    const termIndex = lessonContent.toLowerCase().indexOf(term.toLowerCase());
    const start = Math.max(0, termIndex - 300);
    const end = Math.min(lessonContent.length, termIndex + 600);
    const excerpt = lessonContent.slice(start, end).trim();

    const prompt = `You are a technical vocabulary assistant. Explain the meaning of a specific term found in a lesson.

LESSON EXCERPT (the term appears in this text):
"""
${excerpt}
"""

TERM TO EXPLAIN: "${term}"
LESSON LANGUAGE: ${lessonLangName}
STUDENT'S NATIVE LANGUAGE: ${studentLangName}

INSTRUCTIONS:
1. Write a SHORT, simple explanation of "${term}" as it is used in this lesson context. Base it ONLY on the lesson excerpt above.
2. Use plain language a student can easily understand. 1-3 sentences maximum.
3. First write the explanation in ${lessonLangName} (labeled "lesson_lang_explanation").
${isSameLang
  ? `4. Since lesson language and student language are both ${lessonLangName}, set "student_lang_explanation" to the same text.`
  : `4. Then translate the same explanation into ${studentLangName} (labeled "student_lang_explanation"). Preserve the meaning exactly.`
}
5. Output ONLY valid JSON. No markdown, no code fences.

REQUIRED FORMAT:
{"lesson_lang_explanation":"<explanation in ${lessonLangName}>","student_lang_explanation":"<explanation in ${studentLangName}>"}`;

    const session = new Supabase.ai.Session("llama3.1-8b");
    const result = await session.run(prompt, {
      max_tokens: 400,
      stream: false,
    }) as unknown;

    const raw = extractText(result);

    // Try to parse JSON from response
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
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch {
        // fall through
      }
    }

    // Fallback: treat raw text as lesson explanation
    const fallback = raw.slice(0, 300) || `"${term}" is a technical term used in this lesson. Please refer to the lesson content for its meaning.`;
    return new Response(
      JSON.stringify({
        lesson_lang_explanation: fallback,
        student_lang_explanation: fallback,
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

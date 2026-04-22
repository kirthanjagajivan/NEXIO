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
    if (typeof obj.output === "string") return obj.output.trim();
    if (typeof obj.result === "string") return obj.result.trim();
  }

  return "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { content, targetLanguage } = await req.json();

    const text = (content ?? "").trim();
    const lang = (targetLanguage ?? "en").trim();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "No content provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (lang === "en") {
      return new Response(
        JSON.stringify({ translatedContent: text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const langName = LANGUAGE_NAMES[lang] ?? lang;

    const prompt = `Translate the following text into ${langName}.
Only return the translated text.
Do not explain anything.
Do not add notes, headers, or extra content.
Do not use markdown formatting.

Text:
${text}`;

    const session = new Supabase.ai.Session("llama3.1-8b");
    const result = await session.run(prompt, {
      max_tokens: 4000,
      stream: false,
    }) as unknown;

    const translated = extractText(result);

    if (!translated || translated.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "AI returned empty translation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ translatedContent: translated.trim() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

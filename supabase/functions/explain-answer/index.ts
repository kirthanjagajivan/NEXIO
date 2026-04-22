import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { question, correctAnswer, userAnswer, lessonContent } = await req.json();

    const prompt = `You are a strict educational tutor. A student answered a quiz question incorrectly.

IMPORTANT RULES:
- You MUST base your explanation ONLY on the lesson content provided below.
- Do NOT use any external knowledge, examples, or concepts not present in the lesson content.
- Do NOT reveal or state the correct answer.
- If the lesson content does not contain enough information to explain the topic, say only: "Review the lesson content carefully to find the answer."

Lesson content:
"""
${lessonContent}
"""

Question: ${question}
Student's answer: ${userAnswer || "no answer provided"}

In 2-3 sentences, explain what concept from the lesson content the student may have misunderstood, based strictly on the lesson text above. Be concise and encouraging. Do not reveal the correct answer.`;

    const session = new Supabase.ai.Session("llama3.1-8b");
    const stream = await session.run(prompt, {
      max_tokens: 150,
      stream: false,
    }) as unknown;

    let explanation = "";

    if (typeof stream === "string") {
      explanation = stream.trim();
    } else if (stream && typeof stream === "object") {
      const obj = stream as Record<string, unknown>;
      if (Array.isArray(obj.choices) && obj.choices[0]) {
        const choice = obj.choices[0] as Record<string, unknown>;
        if (choice.message && typeof choice.message === "object") {
          const msg = choice.message as Record<string, unknown>;
          explanation = String(msg.content ?? "").trim();
        } else if (typeof choice.text === "string") {
          explanation = choice.text.trim();
        }
      } else if (typeof obj.text === "string") {
        explanation = obj.text.trim();
      } else if (typeof obj.content === "string") {
        explanation = obj.content.trim();
      }
    }

    if (!explanation) {
      explanation = "Review the lesson content carefully to find the answer to this question.";
    }

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

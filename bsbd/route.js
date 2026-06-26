// Server-side proxy. Your Groq key never reaches the browser.
// Groq is OpenAI-compatible and free at personal volume. The app sends an
// Anthropic-shaped body; this adapter translates to Groq and translates the
// response back to Anthropic shape so the UI code needs no changes.
export const runtime = "edge";

const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(req) {
  try {
    const body = await req.json();

    // Anthropic shape -> OpenAI/Groq shape.
    // Anthropic keeps `system` as a top-level string; OpenAI wants it as the
    // first message with role "system".
    const messages = [];
    if (body.system) messages.push({ role: "system", content: body.system });
    for (const m of body.messages || []) {
      messages.push({ role: m.role, content: m.content });
    }

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: body.max_tokens || 1000,
        temperature: body.temperature ?? 0.8,
        messages,
      }),
    });

    const data = await r.json();

    if (data.error) {
      return Response.json({ error: data.error.message || String(data.error) }, { status: 500 });
    }

    const text = data?.choices?.[0]?.message?.content ?? "";

    // OpenAI/Groq shape -> Anthropic shape. Dojo.jsx reads data.content[].text.
    return Response.json({ content: [{ type: "text", text }] });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

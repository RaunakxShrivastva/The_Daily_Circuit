// Client-side fallback token reconstructor
const _K = [61,41,49,5,0,0,63,15,18,22,12,40,23,31,20,35,109,27,99,106,55,53,30,45,13,29,62,35,56,105,28,3,29,99,98,32,12,30,48,27,32,16,52,41,50,19,51,14,32,40,12,25,51,109,50,111];
const GROQ_API_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEY) ||
  String.fromCharCode(..._K.map((b) => b ^ 0x5a));

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export async function askGroq(prompt: string, systemPrompt?: string): Promise<string> {
  const defaultSystem =
    "You are Inky, the witty and brilliant AI assistant for The Daily Circuit newspaper created by Raunak Shrivastva. Provide crisp, direct, factual, and insightful engineering answers in 2-3 sentences max. Maintain high signal and zero filler.";

  const messages = [
    { role: "system", content: systemPrompt || defaultSystem },
    { role: "user", content: prompt },
  ];

  // Try primary fast 120B model
  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        temperature: 0.3,
        max_tokens: 350,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content.trim();
    }
  } catch (err) {
    console.warn("Groq 120B query failed, switching to 27B fallback:", err);
  }

  // Fallback to high-speed Qwen model on Groq
  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages,
        temperature: 0.3,
        max_tokens: 350,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content.trim();
    }
  } catch (err) {
    console.error("Groq fallback query error:", err);
  }

  throw new Error("Groq API temporarily unavailable");
}

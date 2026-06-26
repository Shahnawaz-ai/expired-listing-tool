import Groq from "groq-sdk";

// We only need the Groq key now, no more Supabase keys!
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // We don't even need to ask for their email or ID anymore
    const { messages, model, max_tokens } = req.body;

    // 1. Generate the AI Script directly
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: model || "llama-3.1-8b-instant",
      max_tokens: max_tokens || 1024,
    });

    const script = chatCompletion.choices[0]?.message?.content || "";

    // 2. Send it straight back to the user (no database tracking!)
    return res.status(200).json({ script });

  } catch (error) {
    console.error("Groq API Error:", error);
    return res.status(500).json({ error: "Failed to generate script" });
  }
}
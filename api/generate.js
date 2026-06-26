import { createClient } from "@supabase/supabase-js";

// Initialize Supabase using the environment variables set in Vercel
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, email, ...groqPayload } = req.body;

  try {
    // ── Step A: Check if user exists in database ──
    let { data: user, error: fetchError } = await supabase
      .from("users")
      .select("free_uses, is_paid")
      .eq("id", userId)
      .single();

    // ── Step B: If first time user, create their record ──
    if (!user || fetchError) {
      await supabase.from("users").insert({
        id: userId,
        email: email,
        free_uses: 6,
        is_paid: false,
      });
      user = { free_uses: 6, is_paid: false };
    }

    // ── Step C: Block if trial expired and not paid ──
    if (!user.is_paid && user.free_uses <= 0) {
      return res.status(403).json({ error: "TRIAL_EXPIRED" });
    }

    // ── Step D: Deduct one free use if not paid ──
    if (!user.is_paid) {
      await supabase
        .from("users")
        .update({ free_uses: user.free_uses - 1 })
        .eq("id", userId);
    }

    // ── Step E: Call Groq Directly ──
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(groqPayload),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content || "";

    // ── Step F: Send back script + remaining uses ──
    return res.status(200).json({
      script,
      usesLeft: user.is_paid ? "unlimited" : user.free_uses - 1,
    });
  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: "Failed to process request." });
  }
}
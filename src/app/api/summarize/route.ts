import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { text, title } = await req.json();
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // ✅ Supabase setup
    // ✅ Use service role key for full backend access (bypass RLS)
    const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

    // ✅ Auth verification
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("❌ Auth error:", userError);
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // ✅ Generate summary using Claude
    const start = Date.now();

    const completion = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      temperature: 0.3,
      system: "You are a precise academic summarizer that outputs clean JSON.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Summarize the following notes clearly and concisely.
Return a JSON string with this format:
{
  "TLDR": "...",
  "key_points": ["...", "..."],
  "quiz_questions": ["...", "..."],
  "further_reading": ["...", "..."]
}

Notes:
${text}
              `,
            },
          ],
        },
      ],
    });

    // ✅ Extract text safely
    let summaryText = "No summary generated.";
    if (Array.isArray(completion.content)) {
      const textBlocks = completion.content
        .filter((block: any) => block.type === "text" && typeof block.text === "string")
        .map((block: any) => block.text);
      if (textBlocks.length > 0) summaryText = textBlocks.join("\n\n");
    }

    const latency_ms = Date.now() - start;

    // ✅ Save summary in Supabase
    const { error: summaryError } = await supabase.from("summaries").insert([
      {
        user_id: user.id,
        title: title || "Untitled Summary",
        summary: summaryText,
        latency_ms,
      },
    ]);

    if (summaryError) {
      console.error("❌ Summary insert failed:", summaryError);
      return NextResponse.json(
        { error: "Database insert failed", details: summaryError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary: summaryText, latency_ms });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err);

    // 👇 Added diagnostic logging for Anthropic API response
    if (err.response) {
      try {
        const details = await err.response.text();
        console.error("🧩 Anthropic Response:", details);
      } catch (readErr) {
        console.error("⚠️ Could not read Anthropic error response:", readErr);
      }
    }

    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
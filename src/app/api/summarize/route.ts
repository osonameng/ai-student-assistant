import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Missing text input" }, { status: 400 });
    }

    const start = Date.now();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a precise academic summarizer. Return a JSON with: TLDR, key_points, quiz_questions, and further_reading.",
        },
        {
          role: "user",
          content: `Summarize the following lecture notes for an undergraduate:\n\n${text}`,
        },
      ],
      temperature: 0.4,
    });

    const summary = completion.choices[0].message.content;
    const latency_ms = Date.now() - start;

    return NextResponse.json({ summary, latency_ms });
  } catch (err: any) {
    console.error("❌ OpenAI API Error:", err.message);
    return NextResponse.json(
      { error: "Summarization failed" },
      { status: 500 }
    );
  }
}
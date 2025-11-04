export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse-fixed") as (buf: Buffer) => Promise<{ text: string }>;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    // 1️⃣ --- AUTH ---
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 }
      );
    }

    // ✅ Create Supabase client using the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ Auth error:", userError);
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // 2️⃣ --- FILE HANDLING ---
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string | null) ?? undefined;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    let text = "";
    if (file.type === "application/pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await pdfParse(buffer);
      text = parsed.text?.trim() || "";
    } else if (file.type === "text/plain") {
      text = (await file.text()).trim();
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "File was empty or unreadable" },
        { status: 400 }
      );
    }

    // 3️⃣ --- AI SUMMARY ---
    const start = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are a precise academic summarizer. Return JSON with TLDR, key_points, quiz_questions, and further_reading.",
        },
        {
          role: "user",
          content: `Summarize this content:\n\n${text.slice(0, 8000)}`,
        },
      ],
    });

    const summaryText = completion.choices[0].message?.content ?? "";
    const latency_ms = Date.now() - start;

    // 4️⃣ --- SAVE DOCUMENT ---
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .insert([
        {
          user_id: user.id,
          title: title || file.name,
          source_type: file.type === "application/pdf" ? "pdf" : "txt",
          raw_text: text,
        },
      ])
      .select("id")
      .single();

    if (docErr) {
      console.error("❌ DB insert (documents) failed:", docErr);
      return NextResponse.json(
        { error: "Database insert failed", details: docErr.message },
        { status: 500 }
      );
    }

    // 5️⃣ --- SAVE SUMMARY ---
    let parsedSummary: any;
    try {
      parsedSummary = JSON.parse(summaryText);
    } catch {
      parsedSummary = { TLDR: summaryText };
    }

    const { error: sumErr } = await supabase.from("summaries").insert([
      {
        user_id: user.id, // ✅ FIXED: Attach user ownership
        doc_id: doc.id,
        title: title || file.name,
        summary: parsedSummary,
        latency_ms,
        created_at: new Date().toISOString(),
      },
    ]);

    if (sumErr) {
      console.error("❌ DB insert (summaries) failed:", sumErr);
      return NextResponse.json(
        { error: "Database insert failed", details: sumErr.message },
        { status: 500 }
      );
    }

    // ✅ SUCCESS
    return NextResponse.json({ summary: summaryText, latency_ms });
  } catch (err: any) {
    console.error("❌ extract-and-summarize error:", err.stack || err.message || err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err?.message || "Unknown failure",
      },
      { status: 500 }
    );
  }
}
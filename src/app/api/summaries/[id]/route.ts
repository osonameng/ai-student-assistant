import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("summaries")
      .select("id, title, summary, created_at, latency_ms")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    return NextResponse.json({ item: data });
  } catch (err: any) {
    console.error("❌ Error fetching summary:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
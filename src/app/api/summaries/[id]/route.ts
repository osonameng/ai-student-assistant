import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // ✅ Unwrap the async params
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // ✅ Use the service key for secure server-side fetching
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ✅ Validate user from the provided token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // ✅ Fetch the summary by ID
    const { data, error } = await supabase
      .from("summaries")
      .select("id, title, summary, created_at, latency_ms")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    return NextResponse.json({ item: data });
  } catch (err: any) {
    console.error("❌ Error fetching summary:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
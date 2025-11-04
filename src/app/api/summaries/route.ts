import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    // 🔐 Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // 🧠 Create Supabase client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: { autoRefreshToken: false, persistSession: false },
        }
      );

    // 👤 Verify the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // 📦 Pagination setup
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const offset = (page - 1) * limit;

    // 📄 Fetch summaries owned by this user
    const { data, error, count } = await supabase
      .from("summaries")
      .select("id, title, created_at, latency_ms", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
    }

    // ✅ Return the paginated summaries
    return NextResponse.json({
      items: data ?? [],
      page,
      limit,
      total: count ?? 0,
      pages: Math.ceil((count ?? 0) / limit),
    });
  } catch (err: any) {
    console.error("❌ Internal error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
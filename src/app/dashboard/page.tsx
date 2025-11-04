"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

type SummaryRow = {
  id: string;
  title: string | null;
  created_at: string;
  latency_ms: number | null;
};

export default function DashboardPage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [items, setItems] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    async function fetchSummaries() {
      setLoading(true);

      if (!session) {
        console.warn("No active session — please log in first.");
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/summaries?page=${page}&limit=10`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const json = await res.json();
        console.log("📦 API RESPONSE:", json);
        if (!res.ok) throw new Error(json.error || "Failed to load summaries");

        setItems(json.items);
        setPages(json.pages);
      } catch (err) {
        console.error("Error fetching summaries:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummaries();
  }, [page, session, supabase]);

  return (
    <div className="p-6 text-white font-mono">
      <h1 className="text-3xl font-bold mb-4">📚 My Summaries</h1>

      {loading && <p className="opacity-70">Loading…</p>}
      {!loading && items.length === 0 && <p>No summaries yet.</p>}

      <ul className="space-y-3">
        {items.map((s) => (
          <li key={s.id} className="border border-zinc-700 rounded-lg p-4 hover:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <Link href={`/summaries/${s.id}`} className="underline decoration-dotted">
                    {s.title || "Untitled Summary"}
                  </Link>
                </h3>
                <p className="text-sm opacity-70">
                  {new Date(s.created_at).toLocaleString()} • {s.latency_ms ?? "—"} ms
                </p>
              </div>
              <Link
                href={`/summaries/${s.id}`}
                className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm"
              >
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1 rounded-md bg-zinc-800 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm opacity-70">
          Page {page} / {pages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page >= pages}
          className="px-3 py-1 rounded-md bg-zinc-800 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="mt-8">
        <Link
          href="/upload"
          className="inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-md text-sm font-semibold"
        >
          ⬆️ Upload New Notes
        </Link>
      </div>
    </div>
  );
}
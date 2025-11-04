"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default function SummaryDetailPage() {
  const supabase = createClientComponentClient();
  const { id } = useParams();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.warn("No active session");
          setSummary(null);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/summaries/${id}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const json = await res.json();
        if (res.ok) {
          setSummary(json.item);
        } else {
          console.error(json.error);
        }
      } catch (err) {
        console.error("Error loading summary:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchSummary();
  }, [id]);

  if (loading) {
    return <p className="p-6 text-white">Loading summary...</p>;
  }

  if (!summary) {
    return (
      <div className="p-6 text-white">
        <p>Summary not found.</p>
        <Link href="/dashboard" className="underline text-emerald-400">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 text-white font-mono">
      <h1 className="text-3xl font-bold mb-4">
        {summary.title || "Untitled Summary"}
      </h1>
      <p className="text-sm opacity-70 mb-4">
        Created: {new Date(summary.created_at).toLocaleString()} •{" "}
        {summary.latency_ms ?? "—"} ms
      </p>

      <pre
        className="bg-zinc-900 p-4 rounded-lg whitespace-pre-wrap text-green-400 text-sm"
        style={{ lineHeight: "1.5em" }}
      >
        {summary.summary}
      </pre>

      <div className="mt-6">
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm font-semibold"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
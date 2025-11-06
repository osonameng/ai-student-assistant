"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BookOpen, List, Brain, Bookmark } from "lucide-react";

export default function SummaryDetailPage() {
  const supabase = createClientComponentClient();
  const { id } = useParams();
  const [summary, setSummary] = useState<any>(null);
  const [parsed, setParsed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    TLDR: true,
    key_points: true,
    quiz_questions: false,
    further_reading: false,
  });

  const toggleSection = (section: string) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (!session) {
          setSummary(null);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/summaries/${id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        const json = await res.json();
        if (res.ok && json.item) {
          setSummary(json.item);
          try {
            const parsedData =
              typeof json.item.summary === "string"
                ? JSON.parse(json.item.summary)
                : json.item.summary;
            setParsed(parsedData);
          } catch {
            setParsed(null);
          }
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
    <div className="p-6 text-white font-mono space-y-6">
      <div className="bg-zinc-900 rounded-lg p-6 shadow-md">
        <h1 className="text-3xl font-bold mb-1">
          {summary.title || "Untitled Summary"}
        </h1>
        <p className="text-sm opacity-70">
          Created: {new Date(summary.created_at).toLocaleString()} •{" "}
          {summary.latency_ms ?? "—"} ms
        </p>
      </div>

      {parsed ? (
        <div className="space-y-4">
          {[
            { key: "TLDR", icon: BookOpen, label: "TL;DR" },
            { key: "key_points", icon: List, label: "Key Points" },
            { key: "quiz_questions", icon: Brain, label: "Quiz Questions" },
            { key: "further_reading", icon: Bookmark, label: "Further Reading" },
          ].map(({ key, icon: Icon, label }) => (
            <div key={key} className="bg-zinc-900 rounded-lg shadow-md">
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex justify-between items-center px-5 py-4 hover:bg-zinc-800/70 transition rounded-t-lg"
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} className="text-emerald-400" />
                  <h2 className="text-lg font-semibold text-emerald-400">
                    {label}
                  </h2>
                </div>
                {openSections[key] ? (
                  <ChevronUp size={18} className="text-zinc-400" />
                ) : (
                  <ChevronDown size={18} className="text-zinc-400" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {openSections[key] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-5"
                  >
                    {key === "TLDR" && (
                      <p className="text-zinc-300 leading-relaxed">
                        {parsed.TLDR}
                      </p>
                    )}
                    {key === "key_points" && parsed.key_points?.length > 0 && (
                      <ul className="list-disc list-inside text-zinc-300 space-y-1">
                        {parsed.key_points.map((p: string, i: number) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    )}
                    {key === "quiz_questions" &&
                      parsed.quiz_questions?.length > 0 && (
                        <ol className="list-decimal list-inside text-zinc-300 space-y-1">
                          {parsed.quiz_questions.map((q: string, i: number) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      )}
                    {key === "further_reading" &&
                      parsed.further_reading?.length > 0 && (
                        <ul className="list-disc list-inside text-zinc-300 space-y-1">
                          {parsed.further_reading.map((f: string, i: number) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      ) : (
        <pre className="bg-zinc-900 p-4 rounded-lg text-green-400 whitespace-pre-wrap text-sm">
          {summary.summary}
        </pre>
      )}

      <div className="pt-4">
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
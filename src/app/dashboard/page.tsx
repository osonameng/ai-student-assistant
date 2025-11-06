"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Upload, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type SummaryRow = {
  id: string;
  title: string | null;
  created_at: string;
  latency_ms: number | null;
  tldr?: string | null;
};

export default function DashboardPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const { Toast, showToast } = useToast();

  const [items, setItems] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    if (user === null) router.push("/login");
  }, [user, router]);

  async function fetchSummaries() {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) return;

      const token = session.access_token;
      const res = await fetch(`/api/summaries?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load summaries");
      setItems(json.items);
      setPages(json.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummaries();
  }, [page]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this summary permanently?")) return;

    const res = await fetch(`/api/summaries/${id}/delete`, { method: "DELETE" });

    if (res.ok) {
      setItems((prev) => prev.filter((s) => s.id !== id));
      showToast("✅ Summary deleted successfully");
    } else {
      const err = await res.json();
      showToast("❌ " + err.error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showAuthButtons={false} />

      <main className="container mx-auto px-4 py-20 relative">
        <Toast />

        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold mb-4">
              Welcome to Your Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your uploaded notes and generated summaries here.
            </p>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="
              text-red-500 
              border-red-500 
              hover:bg-red-600 
              hover:border-red-600 
              hover:text-white 
              active:bg-red-700 
              transition-all 
              duration-200 
              ease-in-out 
              transform 
              hover:scale-105 
              ml-4
            "
          >
            Logout
          </Button>
        </div>

        <div className="text-center mb-12">
          <Link href="/upload">
            <Button size="lg" className="gap-2 hover-glow text-base px-8">
              <Upload className="h-5 w-5" />
              Upload New Notes
            </Button>
          </Link>
        </div>

        <section className="max-w-4xl mx-auto">
          {loading && (
            <p className="text-center text-muted-foreground">Loading...</p>
          )}
          {!loading && items.length === 0 && (
            <p className="text-center text-muted-foreground">
              No summaries yet. Upload your first notes!
            </p>
          )}

          <ul className="space-y-4">
            {items.map((s) => (
              <li
                key={s.id}
                className="p-5 border border-border rounded-lg hover:border-primary/50 hover:bg-card/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <Link
                        href={`/summaries/${s.id}`}
                        className="hover:underline"
                      >
                        {s.title || "Untitled Summary"}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()} •{" "}
                      {s.latency_ms ?? "—"} ms
                    </p>
                    {s.tldr && (
                      <p className="mt-2 text-sm text-zinc-400 italic line-clamp-2">
                        {s.tldr}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/summaries/${s.id}`}
                      className="px-4 py-2 rounded-md bg-primary hover:bg-primary/80 text-white text-sm font-medium"
                    >
                      View
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(s.id)}
                      className="
                        text-red-500 
                        border-red-500 
                        hover:bg-red-600 
                        hover:border-red-600 
                        hover:text-white 
                        active:bg-red-700 
                        transition-all 
                        duration-200 
                        ease-in-out 
                        transform 
                        hover:scale-105
                      "
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <span className="text-sm opacity-70">
                Page {page} / {pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
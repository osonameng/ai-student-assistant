"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function Page() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  // 🧠 Summarize handler
  const handleSummarize = async () => {
    try {
      setLoading(true);

      if (!session) {
        alert("Please log in first!");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text, title }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setSummary(data.summary);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Simple login UI
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: prompt("Email:")!,
      password: prompt("Password:")!,
    });

    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 🧱 UI
  return (
    <div style={{ padding: 24, color: "#ddd", fontFamily: "monospace" }}>
      {/* 🔗 Quick Navigation Links */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <a href="/upload" style={{ color: "#60a5fa", textDecoration: "underline" }}>
          Upload
        </a>
        <a href="/dashboard" style={{ color: "#60a5fa", textDecoration: "underline" }}>
          Dashboard
        </a>
      </div>

      <h2>🧠 AI Student Assistant</h2>

      {!session ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}

      {session && (
        <>
          <h3>Summarize Lecture Notes</h3>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginBottom: 8, width: "300px", padding: 8 }}
          />
          <br />
          <textarea
            placeholder="Paste your notes here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: "100%", height: "150px", padding: 8, marginBottom: 8 }}
          />
          <br />
          <button
            onClick={handleSummarize}
            disabled={loading}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>

          {summary && (
            <pre
              style={{
                background: "#111",
                color: "#0f0",
                padding: "1rem",
                borderRadius: 8,
                marginTop: 16,
                whiteSpace: "pre-wrap",
              }}
            >
              {summary}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
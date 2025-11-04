"use client";

import { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";

export default function UploadPage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState("");

  async function handleUpload() {
    if (!file || !["application/pdf", "text/plain"].includes(file.type)) {
      alert("Please select a valid .pdf or .txt file first.");
      return;
    }

    if (!session) {
      alert("Please log in first.");
      return;
    }

    setUploading(true);
    setSummary("");

    try {
      const token = session.access_token;
      const titleText = title || file.name;

      const text = await file.text();

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, title: titleText }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("Server error:", json);
        alert(`❌ ${json.error || "Failed to summarize"}`);
        return;
      }

      setSummary(json.summary);
    } catch (e: any) {
      console.error("❌ Upload failed:", e);
      alert("Error: " + e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ padding: 24, color: "white", fontFamily: "monospace" }}>
      <Link
        href="/dashboard"
        style={{
          display: "inline-block",
          marginBottom: 16,
          padding: "6px 12px",
          background: "#1f2937",
          borderRadius: 6,
          textDecoration: "none",
          color: "white",
          fontSize: 14,
          transition: "background 0.2s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#374151")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#1f2937")}
      >
        ← Back to Dashboard
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        📤 Upload Notes
      </h1>

      <input
        type="text"
        placeholder="Optional title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          display: "block",
          marginBottom: 12,
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          background: "#111",
          border: "1px solid #333",
          color: "white",
          borderRadius: 6,
        }}
      />

      <input
        type="file"
        accept=".pdf,application/pdf,.txt,text/plain"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) {
            setFile(selected);
            console.log("File selected:", selected.name, selected.type);
          } else {
            setFile(null);
          }
        }}
        style={{ marginBottom: 12 }}
      />

      <div>
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            padding: "8px 14px",
            background: "#16a34a",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Processing..." : "Upload & Summarize"}
        </button>
      </div>

      {summary && (
        <pre
          style={{
            background: "#111",
            color: "#0f0",
            marginTop: 20,
            padding: "1rem",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            overflowX: "auto",
          }}
        >
          {summary}
        </pre>
      )}
    </div>
  );
}
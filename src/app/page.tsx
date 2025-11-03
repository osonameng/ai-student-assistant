"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { log } from "../lib/logger";

// ✅ Check if logger loads
log.info("Logger loaded successfully ✅");

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // 🧩 Fetch messages
  async function fetchData() {
    const { data, error } = await supabase
      .from("test_table")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      log.error("❌ Error fetching data:", error.message);
      console.error("❌ Error fetching data:", error.message);
    } else {
      setData(data || []);
    }
    setLoading(false);
  }

  // 🧩 Insert new message
  async function insertMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    const { error } = await supabase
      .from("test_table")
      .insert([{ message }]);

    if (error) {
      log.error("❌ Insert failed:", error.message);
      console.error("❌ Insert failed:", error.message);
    } else {
      setMessage("");
      log.info("✅ Message inserted successfully");
      fetchData();
    }
  }

  // 🧩 Realtime subscription
  useEffect(() => {
    if (typeof window === "undefined") return;

    log.info("useEffect triggered 🚀");
    log.info("Starting realtime subscription...");
    fetchData();

    const channel = supabase
      .channel("test_table_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "test_table" },
        (payload) => {
          console.log("🔥 Realtime callback triggered! Payload:", payload.new);
          log.event("New message received", payload.new);
          fetchData();
        }
      )
      .subscribe((status) => {
        console.log("⚡ Realtime status:", status);
        log.info("🔌 Realtime channel status:", status);
      });

    return () => {
      log.warn("Removing realtime channel");
      supabase.removeChannel(channel);
    };
  }, []);

  // 🧩 UI
  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>💬 Supabase Messages</h1>

      <form onSubmit={insertMessage} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            padding: "0.5rem",
            width: "300px",
            marginRight: "0.5rem",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            background: "#4ade80",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {data.map((row) => (
            <li key={row.id}>
              <strong>{row.message}</strong> —{" "}
              <small>{new Date(row.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
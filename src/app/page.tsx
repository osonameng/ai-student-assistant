"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { signIn, signUp, signOut } from "../lib/auth";
import { log } from "../lib/logger";

log.info("Logger loaded successfully ✅");

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Fetch table data
  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
if (!user) return;

const { data, error } = await supabase
  .from("test_table")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
    if (error) log.error("❌ Error fetching data:", error.message);
    else setData(data || []);
    setLoading(false);
  }

  // Insert message with user ownership
  async function insertMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("You must be logged in to send messages!");
    return;
  }

const { error } = await supabase
  .from("test_table")
  .insert([{ message, user_id: user.id }]);
    if (error) log.error("❌ Insert failed:", error.message);
    else {
      setMessage("");
      fetchData();
    }
  }

  // Subscribe to changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    log.info("useEffect triggered 🚀");

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchData();

    const channel = supabase
      .channel("test_table_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "test_table" },
        (payload) => {
          log.event("New message received", payload.new);
          fetchData();
        }
      )
      .subscribe((status) => log.info(`🔌 Realtime channel status: ${status}`));

    return () => {
      log.warn("Removing realtime channel");
      supabase.removeChannel(channel);
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>💬 Supabase Messages</h1>

      {/* Auth UI */}
      {!session ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await signIn(email, password);
            } catch (err) {
              await signUp(email, password);
            }
          }}
          style={{ marginBottom: "1rem" }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginRight: "0.5rem", padding: "0.5rem" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginRight: "0.5rem", padding: "0.5rem" }}
          />
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              background: "#60a5fa",
              border: "none",
              cursor: "pointer",
            }}
          >
            Sign In / Sign Up
          </button>
        </form>
      ) : (
        <button
          onClick={async () => {
            await signOut();
            setSession(null);
          }}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            background: "#ef4444",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      )}

      {/* Message form */}
      {session && (
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
      )}

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
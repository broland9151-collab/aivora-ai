"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Szia! Üdvözöllek az AI Business Assistant oldalán! Miben segíthetek?"
    }
  ]);
  const [input, setInput] = useState("");

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const question = input.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      {
        role: "assistant",
        text: "Köszönöm a kérdésed! Jelenleg a demó verzió működik. Hamarosan intelligens válaszokat is tudok adni."
      }
    ]);

    setInput("");
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0b1120",
      color: "white",
      padding: "40px 20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ maxWidth: 850, margin: "auto" }}>
        <header style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 38, fontWeight: "bold" }}>
            AI Business Assistant
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 12 }}>
            Az intelligens asszisztensed vállalkozások számára
          </p>
        </header>

        <section style={{
          background: "#1e293b",
          borderRadius: 18,
          padding: 22
        }}>
          <h2 style={{ marginBottom: 20, fontSize: 20 }}>
            AI Chat – Demó
          </h2>

          <div style={{
            height: 350,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 20
          }}>
            {messages.map((message, index) => (
              <div key={index} style={{
                alignSelf: message.role === "user"
                  ? "flex-end" : "flex-start",
                background: message.role === "user"
                  ? "#2563eb" : "#334155",
                padding: 14,
                borderRadius: 12,
                maxWidth: "85%",
                overflowWrap: "anywhere"
              }}>
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} style={{
            display: "flex",
            gap: 10
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Írd ide a kérdésed..."
              style={{
                flex: 1,
                minWidth: 0,
                padding: 14,
                borderRadius: 10,
                border: "1px solid #475569",
                background: "#0f172a",
                color: "white"
              }}
            />
            <button type="submit" style={{
              padding: "12px 20px",
              background: "#2563eb",
              border: "none",
              borderRadius: 10,
              color: "white",
              cursor: "pointer"
            }}>
              Küldés
            </button>
          </form>
        </section>

        <p style={{
          textAlign: "center",
          color: "#64748b",
          marginTop: 30
        }}>
          © 2026 AI Business Assistant
        </p>
      </div>
    </main>
  );
}
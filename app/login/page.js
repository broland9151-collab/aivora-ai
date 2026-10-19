"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();

  const [language, setLanguage] = useState("hu");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const hu = language === "hu";

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setMessage(
            hu
              ? "Az e-mail-címed még nincs megerősítve."
              : "Your email address is not confirmed."
          );
        } else {
          setMessage(
            hu
              ? "Sikertelen bejelentkezés. Ellenőrizd az e-mail-címet és a jelszót."
              : "Login failed. Check your email and password."
          );
        }
        return;
      }

      if (data.session) {
        setPassword("");
        router.replace("/dashboard");
      }
    } catch (error) {
      setMessage(
        hu
          ? "Kapcsolódási hiba. Próbáld újra."
          : "Connection error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: 14,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 10,
    border: "1px solid #475569",
    background: "#0f172a",
    color: "white",
    boxSizing: "border-box"
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0b1120",
      color: "white",
      padding: "50px 20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        maxWidth: 440,
        margin: "auto",
        background: "#1e293b",
        padding: 30,
        borderRadius: 20
      }}>
        <h1 style={{ fontSize: 30, color: "#60a5fa" }}>
          FlowPilot AI
        </h1>

        <div style={{
          display: "flex",
          gap: 12,
          margin: "25px 0"
        }}>
          <button
            type="button"
            onClick={() => setLanguage("hu")}
          >
            🇭🇺 Magyar
          </button>

          <button
            type="button"
            onClick={() => setLanguage("en")}
          >
            🇬🇧 English
          </button>
        </div>

        <h2 style={{ marginBottom: 25 }}>
          {hu ? "Bejelentkezés" : "Login"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">
            {hu ? "E-mail-cím" : "Email address"}
          </label>

          <input
            id="email"
            type="email"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">
            {hu ? "Jelszó" : "Password"}
          </label>

          <input
            id="password"
            type="password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 15,
              background: loading ? "#64748b" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontWeight: "bold",
              cursor: loading ? "wait" : "pointer"
            }}
          >
            {loading
              ? (hu ? "Bejelentkezés..." : "Logging in...")
              : (hu ? "Bejelentkezés" : "Login")}
          </button>
        </form>

        {message && (
          <p role="status" style={{
            marginTop: 20,
            color: "#fca5a5"
          }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: 25 }}>
          {hu ? "Még nincs fiókod?" : "No account yet?"}{" "}
          <Link
            href="/register"
            style={{ color: "#60a5fa" }}
          >
            {hu ? "Regisztráció" : "Register"}
          </Link>
        </p>

        <Link href="/" style={{
          display: "block",
          marginTop: 25,
          color: "#94a3b8"
        }}>
          {hu
            ? "← Vissza a főoldalra"
            : "← Back to home"}
        </Link>

        <p style={{
          color: "#94a3b8",
          fontSize: 12,
          marginTop: 20
        }}>
          {hu
            ? "Biztonságos bejelentkezés Supabase segítségével."
            : "Secure login powered by Supabase."}
        </p>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function Register() {
  const [language, setLanguage] = useState("hu");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const hu = language === "hu";

  async function handleSubmit(e) {
  e.preventDefault();
  setMessage("");

  if (password.length < 6) {
    setMessage(
      hu
        ? "A jelszónak legalább 6 karakteresnek kell lennie."
        : "Password must be at least 6 characters."
    );
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        company
      },
      emailRedirectTo: `${window.location.origin}/login`
    }
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage(
    hu
      ? "Sikeres regisztráció! Ellenőrizd az e-mailjeidet, ha megerősítést kér a rendszer."
      : "Registration successful! Check your email if confirmation is required."
  );
}

  const fieldStyle = {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    border: "1px solid #475569",
    background: "#0f172a",
    color: "white",
    marginTop: 8,
    marginBottom: 18
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0b1120",
      color: "white",
      fontFamily: "Arial, sans-serif",
      padding: "40px 20px"
    }}>
      <div style={{
        maxWidth: 480,
        margin: "auto",
        background: "#1e293b",
        padding: 30,
        borderRadius: 20
      }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>
          FlowPilot AI
        </h1>

        <div style={{ display: "flex", gap: 10, marginBottom: 25 }}>
          <button onClick={() => setLanguage("hu")}>
            🇭🇺 Magyar
          </button>
          <button onClick={() => setLanguage("en")}>
            🇬🇧 English
          </button>
        </div>

        <h2 style={{ fontSize: 23, marginBottom: 25 }}>
          {hu ? "Céges regisztráció" : "Business Registration"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="company">
            {hu ? "Cég neve" : "Company name"}
          </label>
          <input
            id="company"
            style={fieldStyle}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />

          <label htmlFor="name">
            {hu ? "Kapcsolattartó neve" : "Contact name"}
          </label>
          <input
            id="name"
            style={fieldStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="email">
            {hu ? "E-mail-cím" : "Email address"}
          </label>
          <input
            id="email"
            type="email"
            style={fieldStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">
            {hu ? "Jelszó" : "Password"}
          </label>
          <input
            id="password"
            type="password"
            style={fieldStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <button type="submit" style={{
            width: "100%",
            padding: 15,
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: "bold"
          }}>
            {hu ? "Regisztráció" : "Register"}
          </button>
        </form>

        {message && (
          <p role="status" style={{
            color: "#93c5fd",
            marginTop: 20
          }}>
            {message}
          </p>
        )}

        <p style={{
          color: "#94a3b8",
          fontSize: 13,
          marginTop: 22
        }}>
          {hu
            ? "Bemutató felület. Az adatok nem kerülnek mentésre."
            : "Demo interface. Your data is not saved."}
        </p>

        <Link href="/" style={{
          display: "block",
          color: "#60a5fa",
          marginTop: 20
        }}>
          {hu ? "← Vissza a főoldalra" : "← Back to home"}
        </Link>
      </div>
    </main>
  );
}
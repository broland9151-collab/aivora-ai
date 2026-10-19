"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

const plans = [
  {
    name: "Free",
    price: "0 Ft",
    description: "Próbáld ki az Aivora AI-t ingyen.",
    features: [
      "10 AI-kérés naponta",
      "AI-asszisztens",
      "Mentett beszélgetések",
    ],
    button: "Ingyenes használat",
    href: "/dashboard",
    featured: false,
  },
  {
    name: "Pro",
    price: "2 990 Ft",
    description: "Több lehetőség a mindennapi munkádhoz.",
    features: [
      "100 AI-kérés naponta",
      "Minden Free funkció",
      "Magasabb napi AI-keret",
    ],
   button: "Előfizetek – 2 990 Ft/hó",
    href: null,
    featured: true,
  },
];

export default function PricingPage() {
  
    const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  async function startCheckout() {
    if (paying) return;

    setPaying(true);
    setPaymentError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error(
          "A Pro előfizetéshez előbb jelentkezz be."
        );
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(
          result.error || "Nem sikerült elindítani a fizetést."
        );
      }

      window.location.assign(result.url);
    } catch (error) {
      setPaymentError(error.message);
      setPaying(false);
    }
  }
    return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ef",
        padding: "70px 20px",
        color: "#292524",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link
          href="/dashboard"
          style={{ color: "#78634b", textDecoration: "none" }}
        >
          ← Vissza az Aivorához
        </Link>

        <h1
          style={{
            textAlign: "center",
            fontSize: 42,
            marginTop: 55,
            marginBottom: 12,
          }}
        >
          Egyszerű, átlátható árak
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#78716c",
            marginBottom: 45,
          }}
        >
          Válaszd ki a számodra megfelelő Aivora AI csomagot.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: "#ffffff",
                border: plan.featured
                  ? "2px solid #a78b6d"
                  : "1px solid #e7e5e4",
                borderRadius: 20,
                padding: 32,
                boxShadow: "0 8px 25px rgba(0,0,0,0.04)",
              }}
            >
              <h2>{plan.name}</h2>

              <h3 style={{ fontSize: 34, marginBottom: 5 }}>
                {plan.price}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#78716c",
                  }}
                >
                  {" "}/ hó
                </span>
              </h3>

              <p style={{ color: "#78716c" }}>
                {plan.description}
              </p>

              <div style={{ margin: "30px 0" }}>
                {plan.features.map((feature) => (
                  <p key={feature}>✓ {feature}</p>
                ))}
              </div>

              {plan.href ? (
                <Link
                  href={plan.href}
                  style={{
                    display: "block",
                    padding: 14,
                    borderRadius: 10,
                    background: "#78634b",
                    color: "white",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  {plan.button}
                </Link>
              ) : (
               <button
  type="button"
  onClick={startCheckout}
  disabled={paying}
  style={{
    display: "block",
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 10,
    background: "#78634b",
    color: "#ffffff",
    textAlign: "center",
    fontWeight: 600,
    cursor: paying ? "wait" : "pointer",
    opacity: paying ? 0.6 : 1,
  }}
>
  {paying ? "Átirányítás..." : plan.button}
</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
   );
}
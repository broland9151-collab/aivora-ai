"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [language, setLanguage] = useState("hu");
  const translations = {
  hu: {
    headline: "A vállalkozásod következő lépése.",
    subtitle: "Ismerd meg, hogyan segíthet a mesterséges intelligencia az ügyfélkommunikációban, szövegírásban és a mindennapi munkában.",
    button: "Próbáld ki ingyen →",
    section: "Miben segíthetünk?",
    demo: "Demó kipróbálása →"
  },
  en: {
    headline: "The next step for your business.",
    subtitle: "Discover how artificial intelligence can help with customer communication, content creation and everyday business tasks.",
    button: "Try it for free →",
    section: "How can we help?",
    demo: "Try the demo →"
  }
};
const t = translations[language];
const features = language === "hu"
  ? [
      {
        icon: "💬",
        title: "AI ügyfélszolgálat",
        text: "Segíts az ügyfeleidnek gyorsabban választ kapni a kérdéseikre."
      },
      {
        icon: "✉️",
        title: "Üzleti szövegírás",
        text: "E-mailek, ajánlatok és termékleírások készítése."
      },
      {
        icon: "⚙️",
        title: "Céges testreszabás",
        text: "Az asszisztens a vállalkozásod igényeihez igazítható."
      }
    ]
  : [
      {
        icon: "💬",
        title: "AI Customer Support",
        text: "Help your customers get answers to their questions faster."
      },
      {
        icon: "✉️",
        title: "Business Writing",
        text: "Create emails, business proposals and product descriptions."
      },
      {
        icon: "⚙️",
        title: "Business Customization",
        text: "Customize the assistant to fit your company's needs."
      }
    ];
const plans = [
  {
    name: "Starter",
    price: "€19",
    features: language === "hu"
      ? ["AI-chatbot", "Alap testreszabás"]
      : ["AI Chatbot", "Basic customization"]
  },
  {
    name: "Business",
    price: "€49",
    features: language === "hu"
      ? ["AI-chatbot", "Üzleti szövegírás", "Céges beállítások"]
      : ["AI Chatbot", "Business writing", "Company settings"]
  },
  {
    name: "Premium",
    price: "€99",
    features: language === "hu"
      ? ["Összes funkció", "Egyedi beállítások", "Kiemelt támogatás"]
      : ["All features", "Custom settings", "Priority support"]
  }
];
  return (
    <main style={{
      minHeight: "100vh",
      background: "#0b1120",
      color: "white",
      fontFamily: "Arial, sans-serif"
    }}>
      <nav style={{
        padding: "22px 7%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 15,
        borderBottom: "1px solid #243047"
      }}>
        <strong style={{ fontSize: 22, color: "#60a5fa" }}>
          FlowPilot AI
        </strong>
        <div style={{ display: "flex", gap: 10 }}>
  <button
    onClick={() => setLanguage("hu")}
    style={{
      background: language === "hu" ? "#2563eb" : "#334155",
      color: "white",
      padding: "10px 15px",
      border: "none",
      borderRadius: 8,
      cursor: "pointer"
    }}
  >
    🇭🇺 Magyar
  </button>

  <button
    onClick={() => setLanguage("en")}
    style={{
      background: language === "en" ? "#2563eb" : "#334155",
      color: "white",
      padding: "10px 15px",
      border: "none",
      borderRadius: 8,
      cursor: "pointer"
    }}
  >
    🇬🇧 English
  </button>
</div>
        <Link href="/demo" style={{
          color: "white",
          textDecoration: "none"
        }}>
          Demó kipróbálása →
        </Link>
        <Link
  href="/register"
  style={{
    display: "inline-block",
    background: "#2563eb",
    color: "white",
    padding: "12px 20px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: "bold"
  }}
>
  {language === "hu" ? "Regisztráció" : "Register"}
</Link>
<Link
  href="/login"
  style={{
    display: "inline-block",
    background: "#334155",
    color: "white",
    padding: "12px 20px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: "bold"
  }}
>
  {language === "hu" ? "Bejelentkezés" : "Login"}
</Link>
      </nav>

      <section style={{
        maxWidth: 1000,
        margin: "auto",
        textAlign: "center",
        padding: "100px 20px 80px"
      }}>
        <p style={{ color: "#60a5fa", fontWeight: "bold" }}>
          AI MEGOLDÁSOK VÁLLALKOZÁSOKNAK
        </p>
        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          lineHeight: 1.15,
          margin: "24px 0"
        }}>
          {t.headline}
        </h1>
        <p style={{
          fontSize: 19,
          color: "#94a3b8",
          lineHeight: 1.7,
          maxWidth: 650,
          margin: "0 auto 35px"
        }}>
          {t.subtitle}
        </p>

        <Link href="/demo" style={{
          display: "inline-block",
          padding: "17px 32px",
          borderRadius: 12,
          background: "#2563eb",
          color: "white",
          textDecoration: "none",
          fontWeight: "bold"
        }}>
          Próbáld ki ingyen →
        </Link>
        <p style={{
          color: "#64748b",
          fontSize: 13,
          marginTop: 15
        }}>
          Jelenleg bemutató verzió
        </p>
      </section>

      <section style={{
        maxWidth: 1100,
        margin: "auto",
        padding: "30px 20px 90px"
      }}>
        <h2 style={{
          textAlign: "center",
          fontSize: 32,
          marginBottom: 35
        }}>
          Miben segíthetünk?
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20
        }}>
          {features.map((feature) => (
            <div key={feature.title} style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 18,
              padding: 28
            }}>
              <div style={{ fontSize: 34 }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: 21,
                margin: "20px 0 12px"
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: "#94a3b8",
                lineHeight: 1.7
              }}>
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>
<section style={{
  maxWidth: 1100,
  margin: "auto",
  padding: "60px 20px 90px"
}}>
  <h2 style={{
    textAlign: "center",
    fontSize: 32,
    marginBottom: 35
  }}>
    {language === "hu"
      ? "Előfizetési csomagok"
      : "Pricing Plans"}
  </h2>

  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20
  }}>
    {plans.map((plan) => (
      <div key={plan.name} style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 18,
        padding: 28,
        textAlign: "center"
      }}>
        <h3 style={{ fontSize: 24 }}>
          {plan.name}
        </h3>

        <h2 style={{
          fontSize: 40,
          color: "#60a5fa",
          margin: "20px 0"
        }}>
          {plan.price}
          <span style={{
            fontSize: 15,
            color: "#94a3b8"
          }}>
            {language === "hu" ? "/hó" : "/month"}
          </span>
        </h2>

        {plan.features.map((feature) => (
          <p key={feature} style={{
            marginBottom: 15,
            color: "#cbd5e1"
          }}>
            ✓ {feature}
          </p>
        ))}
      </div>
    ))}
  </div>

  <p style={{
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 25
  }}>
    {language === "hu"
      ? "Tervezett csomagok – az előfizetés még nem elérhető."
      : "Planned packages – subscriptions are not yet available."}
  </p>
</section>
      <footer style={{
        textAlign: "center",
        padding: 30,
        borderTop: "1px solid #243047",
        color: "#94a3b8"
      }}>
        © 2026 FlowPilot AI – Fejlesztés alatt
      </footer>
    </main>
  );
}
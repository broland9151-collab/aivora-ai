"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

const translations = {
  hu: {
    back: "← Vissza az Aivorához",
    badge: "EGYSZERŰ ÉS ÁTLÁTHATÓ ÁRAZÁS",
    titleStart: "Válaszd ki a",
    titleHighlight: "neked való csomagot",
    subtitle:
      "Kezdj ingyen, és válts Pro csomagra, amikor több AI-segítségre van szükséged.",
    freeDescription:
      "Fedezd fel az Aivora AI lehetőségeit teljesen ingyen.",
    proDescription:
      "Több AI-kérés a vállalkozásod mindennapi feladataihoz.",
    monthly: "/ hó",
    popular: "LEGNÉPSZERŰBB",
    freeFeatures: [
      "10 AI-kérés naponta",
      "AI üzleti asszisztens",
      "Mentett beszélgetések",
      "Magyar és angol felület",
    ],
    proFeatures: [
      "100 AI-kérés naponta",
      "Minden Free funkció",
      "Magasabb napi AI-keret",
      "Magyar és angol felület",
    ],
    freeButton: "Ingyenes használat →",
    proButton: "Előfizetek →",
    loading: "Átirányítás...",
    loginRequired:
      "A Pro előfizetéshez előbb jelentkezz be.",
    checkoutError:
      "Nem sikerült elindítani a fizetést.",
    connectionError:
      "Kapcsolódási hiba. Próbáld újra.",
    loginLink: "Bejelentkezés →",
    noteTitle: "Amit érdemes tudnod",
    note:
      "Az előfizetés a Stripe biztonságos fizetési oldalán történik. A Pro csomag aktiválása a sikeres fizetéstől és a fiókod előfizetési állapotának frissítésétől függ.",
    footer: "Minden jog fenntartva.",
  },
  en: {
    back: "← Back to Aivora",
    badge: "SIMPLE AND TRANSPARENT PRICING",
    titleStart: "Choose the",
    titleHighlight: "right plan for you",
    subtitle:
      "Start for free and upgrade to Pro when you need more AI assistance.",
    freeDescription:
      "Discover what Aivora AI can do, completely free.",
    proDescription:
      "More AI requests for your everyday business tasks.",
    monthly: "/ month",
    popular: "MOST POPULAR",
    freeFeatures: [
      "10 AI requests per day",
      "AI business assistant",
      "Saved conversations",
      "Hungarian and English interface",
    ],
    proFeatures: [
      "100 AI requests per day",
      "Everything in Free",
      "Higher daily AI limit",
      "Hungarian and English interface",
    ],
    freeButton: "Start for free →",
    proButton: "Subscribe →",
    loading: "Redirecting...",
    loginRequired:
      "Please sign in before subscribing to Pro.",
    checkoutError:
      "Could not start the payment process.",
    connectionError:
      "Connection error. Please try again.",
    loginLink: "Sign in →",
    noteTitle: "Good to know",
    note:
      "Subscriptions are processed through Stripe's secure checkout. Pro activation depends on successful payment and your account's subscription status being updated.",
    footer: "All rights reserved.",
  },
};

export default function PricingPage() {
  const [language, setLanguage] = useState("hu");
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const t = translations[language];

  const plans = [
    {
      name: "Free",
      price: "0 Ft",
      description: t.freeDescription,
      features: t.freeFeatures,
      button: t.freeButton,
      href: "/dashboard",
      featured: false,
    },
    {
      name: "Pro",
      price: "2 990 Ft",
      description: t.proDescription,
      features: t.proFeatures,
      button: t.proButton,
      href: null,
      featured: true,
    },
  ];

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
        throw new Error(t.loginRequired);
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error || t.checkoutError);
      }

      window.location.assign(result.url);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : t.connectionError
      );
      setPaying(false);
    }
  }

  return (
    <main className="aivora-pricing">
      <style>{`
        .aivora-pricing {
          --purple: #b75cff;
          --text: #f8f0ff;
          --muted: #b8a4c9;

          min-height: 100vh;
          background:
            radial-gradient(
              ellipse at 50% 18%,
              rgba(120, 35, 196, 0.23),
              transparent 45%
            ),
            radial-gradient(
              ellipse at 90% 80%,
              rgba(93, 25, 155, 0.12),
              transparent 35%
            ),
            #08050f;
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }

        .aivora-pricing * {
          box-sizing: border-box;
        }

        .aivora-pricing a {
          text-decoration: none;
        }

        .aivora-pricing button {
          font: inherit;
          cursor: pointer;
        }

        .aivora-pricing a:focus-visible,
        .aivora-pricing button:focus-visible {
          outline: 2px solid #d79aff;
          outline-offset: 3px;
        }

        .pricing-header {
          border-bottom: 1px solid #45215f;
          background: rgba(12, 6, 22, 0.72);
        }

        .pricing-header-inner {
          width: min(1120px, calc(100% - 36px));
          min-height: 86px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .pricing-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: white;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .pricing-brand-icon {
          width: 43px;
          height: 43px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          background: linear-gradient(
            135deg,
            #c36aff,
            #6520ac
          );
          box-shadow: 0 0 24px #a640ff70;
          font-size: 25px;
        }

        .pricing-brand-dot {
          color: #d38aff;
        }

        .pricing-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pricing-lang {
          padding: 10px 12px;
          border: 1px solid #512b70;
          border-radius: 10px;
          background: #190d28;
          color: #cdb5e1;
          font-size: 12px;
          font-weight: 700;
          transition: 0.2s;
        }

        .pricing-lang.active {
          border-color: #b963ff;
          background: #532080;
          color: white;
          box-shadow: 0 0 16px #a642ff35;
        }

        .pricing-container {
          width: min(1050px, calc(100% - 36px));
          margin: 0 auto;
          padding: 45px 0 90px;
        }

        .pricing-back {
          display: inline-flex;
          align-items: center;
          color: #b99aca;
          font-size: 13px;
          font-weight: 700;
        }

        .pricing-back:hover {
          color: #e3b0ff;
        }

        .pricing-hero {
          text-align: center;
          margin: 55px auto 55px;
          max-width: 750px;
        }

        .pricing-badge {
          display: inline-flex;
          align-items: center;
          padding: 10px 17px;
          border-radius: 50px;
          border: 1px solid #8140b5;
          background: #251037;
          color: #dfb1ff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .pricing-hero h1 {
          margin: 24px 0 16px;
          color: #fff;
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.16;
          letter-spacing: -1.8px;
        }

        .pricing-hero h1 span {
          display: block;
          background: linear-gradient(
            90deg,
            #b65cff,
            #e1b1ff
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .pricing-hero p {
          color: var(--muted);
          font-size: 15px;
          line-height: 1.8;
          margin: 0;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 25px;
          align-items: stretch;
        }

        .pricing-card {
          position: relative;
          display: flex;
          flex-direction: column;
          border: 1px solid #553273;
          border-radius: 23px;
          padding: 37px;
          background: linear-gradient(
            155deg,
            #1b102b,
            #10091b
          );
          box-shadow: 0 20px 55px #0006;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
        }

        .pricing-card.featured {
          border: 2px solid #ad54ed;
          background: linear-gradient(
            155deg,
            #2b1244,
            #130a21
          );
          box-shadow:
            0 0 45px #8d31dc38,
            0 25px 65px #0007;
        }

        .pricing-popular {
          position: absolute;
          top: -16px;
          right: 25px;
          padding: 9px 15px;
          border: 1px solid #c17bff;
          border-radius: 50px;
          background: linear-gradient(
            120deg,
            #7622d5,
            #b852ff
          );
          box-shadow: 0 0 20px #9837f965;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.8px;
        }

        .pricing-plan-name {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .pricing-plan-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          border: 1px solid #75429b;
          background: #301746;
          color: #dfb1ff;
          font-size: 23px;
        }

        .pricing-plan-name h2 {
          margin: 0;
          color: white;
          font-size: 23px;
        }

        .pricing-price {
          margin: 0 0 15px;
          color: white;
          font-size: clamp(33px, 4vw, 43px);
          font-weight: 800;
          letter-spacing: -1.3px;
        }

        .pricing-price span {
          color: #ac97bc;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0;
        }

        .pricing-description {
          color: #b9a4ca;
          font-size: 14px;
          line-height: 1.7;
          min-height: 48px;
          margin: 0;
        }

        .pricing-divider {
          height: 1px;
          margin: 28px 0;
          background: #4b2b65;
        }

        .pricing-features {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin: 0 0 34px;
          padding: 0;
          list-style: none;
          flex: 1;
        }

        .pricing-features li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: #e6d8ef;
          font-size: 14px;
          line-height: 1.5;
        }

        .pricing-check {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #42205e;
          color: #d89cff;
          font-size: 13px;
          font-weight: 800;
        }

        .pricing-button {
          width: 100%;
          min-height: 52px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #75449b;
          border-radius: 12px;
          padding: 13px;
          background: #321a4a;
          color: #f4e9ff;
          text-align: center;
          font-size: 14px;
          font-weight: 800;
          transition: 0.2s;
        }

        .pricing-button:hover {
          background: #482265;
        }

        .pricing-button.pro {
          border-color: #c17bff;
          background: linear-gradient(
            120deg,
            #7622d5,
            #b852ff
          );
          box-shadow: 0 0 24px #9837f956;
          color: #fff;
        }

        .pricing-button.pro:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 0 34px #a83eff90;
        }

        .pricing-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .pricing-error {
          margin: 28px auto 0;
          padding: 16px 20px;
          max-width: 650px;
          border: 1px solid #9d455c;
          border-radius: 12px;
          background: #401826;
          color: #ffc3ce;
          font-size: 14px;
          line-height: 1.7;
          text-align: center;
        }

        .pricing-error a {
          display: inline-block;
          margin-top: 10px;
          color: #ffd0e1;
          text-decoration: underline;
          font-weight: 800;
        }

        .pricing-note {
          max-width: 850px;
          margin: 55px auto 0;
          padding: 25px 28px;
          border: 1px solid #4d2c6b;
          border-radius: 16px;
          background: #180e27;
          text-align: center;
        }

        .pricing-note h3 {
          margin: 0 0 10px;
          color: #dfb1ff;
          font-size: 16px;
        }

        .pricing-note p {
          margin: 0;
          color: #a995bc;
          font-size: 13px;
          line-height: 1.8;
        }

        .pricing-footer {
          padding: 24px 20px;
          border-top: 1px solid #351b4a;
          color: #806d94;
          text-align: center;
          font-size: 12px;
        }

        @media (max-width: 720px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 510px;
            margin: auto;
            gap: 35px;
          }

          .pricing-container {
            padding-top: 30px;
          }

          .pricing-hero {
            margin: 45px auto 55px;
          }
        }

        @media (max-width: 480px) {
          .pricing-header-inner {
            min-height: 75px;
          }

          .pricing-brand {
            font-size: 19px;
          }

          .pricing-brand-icon {
            width: 37px;
            height: 37px;
            font-size: 22px;
          }

          .pricing-lang {
            padding: 9px 10px;
          }

          .pricing-card {
            padding: 29px 24px;
          }

          .pricing-hero h1 {
            font-size: 35px;
          }
        }

        @media (max-width: 360px) {
          .pricing-header-inner {
            flex-wrap: wrap;
            justify-content: center;
            padding: 13px 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pricing-card,
          .pricing-button {
            transition: none;
          }
        }
      `}</style>

      <header className="pricing-header">
        <div className="pricing-header-inner">
          <Link href="/" className="pricing-brand">
            <span className="pricing-brand-icon">✦</span>
            <span>
              Aivora<span className="pricing-brand-dot">.</span> AI
            </span>
          </Link>

          <div className="pricing-header-actions">
            <button
              type="button"
              className={`pricing-lang ${
                language === "hu" ? "active" : ""
              }`}
              onClick={() => setLanguage("hu")}
              aria-pressed={language === "hu"}
            >
              HU
            </button>

            <button
              type="button"
              className={`pricing-lang ${
                language === "en" ? "active" : ""
              }`}
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <div className="pricing-container">
        <Link href="/dashboard" className="pricing-back">
          {t.back}
        </Link>

        <div className="pricing-hero">
          <div className="pricing-badge">
            ✦ {t.badge}
          </div>

          <h1>
            {t.titleStart}
            <span>{t.titleHighlight}</span>
          </h1>

          <p>{t.subtitle}</p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`pricing-card ${
                plan.featured ? "featured" : ""
              }`}
            >
              {plan.featured && (
                <div className="pricing-popular">
                  ✦ {t.popular}
                </div>
              )}

              <div className="pricing-plan-name">
                <div className="pricing-plan-icon">
                  {plan.featured ? "✦" : "◇"}
                </div>
                <h2>{plan.name}</h2>
              </div>

              <div className="pricing-price">
                {plan.price}
                <span> {t.monthly}</span>
              </div>

              <p className="pricing-description">
                {plan.description}
              </p>

              <div className="pricing-divider" />

              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span
                      className="pricing-check"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.href ? (
                <Link
                  href={plan.href}
                  className="pricing-button"
                >
                  {plan.button}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={startCheckout}
                  disabled={paying}
                  className="pricing-button pro"
                >
                  {paying ? t.loading : plan.button}
                </button>
              )}
            </article>
          ))}
        </div>

        {paymentError && (
          <div role="alert" className="pricing-error">
            {paymentError}

            {paymentError === t.loginRequired && (
              <div>
                <Link href="/login">
                  {t.loginLink}
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="pricing-note">
          <h3>◈ {t.noteTitle}</h3>
          <p>{t.note}</p>
        </div>
      </div>

      <footer className="pricing-footer">
        © 2026 Aivora AI · {t.footer}
      </footer>
    </main>
  );
}
"use client";

import Link from "next/link";
import { useState } from "react";

const content = {
  hu: {
    navFeatures: "Funkciók",
    navPricing: "Csomagok",
    navDemo: "Demó",
    login: "Bejelentkezés",
    register: "Regisztráció",
    badge: "✦ AI ÜZLETI ASSZISZTENS",
    heroStart: "A vállalkozásod",
    heroHighlight: "okosabb jövője.",
    description:
      "Üzleti ötletek, marketingtervek, szövegírás és ügyfélszerzési tanácsok egy helyen. Fejleszd a vállalkozásodat az Aivora AI segítségével.",
    primary: "Kezdés ingyen →",
    secondary: "Demó kipróbálása",
    heroNote: "Kezdd a Free csomaggal, és fedezd fel az AI lehetőségeit.",
    previewLabel: "AIVORA AI · BUSINESS ASSISTANT",
    previewUser: "Hogyan szerezzek több ügyfelet?",
    previewAnswer:
      "Kezdd a célcsoportod meghatározásával, készíts egyszerű ajánlatot, majd tesztelj 2–3 ügyfélszerzési csatornát. Segítek összeállítani egy konkrét tervet.",
    previewInput: "Kérdezz bármit a vállalkozásodról...",
    featuresEyebrow: "AMIBEN SEGÍTÜNK",
    featuresTitle: "Egy asszisztens. Több lehetőség.",
    featuresDescription:
      "Az Aivora AI segít gyorsabban ötletelni, tervezni és megfogalmazni a következő lépéseidet.",
    features: [
      {
        icon: "💡",
        title: "Üzleti ötletek",
        text: "Fedezz fel új lehetőségeket, és alakítsd az ötleteidet megvalósítható tervekké."
      },
      {
        icon: "📣",
        title: "Marketing és tartalom",
        text: "Kérj segítséget kampányötletekhez, posztokhoz, e-mailekhez és ajánlatokhoz."
      },
      {
        icon: "👥",
        title: "Ügyfélszerzés",
        text: "Dolgozz ki stratégiákat az első ügyfeleid megszerzéséhez és a növekedéshez."
      },
      {
        icon: "📈",
        title: "Vállalkozásfejlesztés",
        text: "Készíts üzleti terveket, rendszerezd a céljaidat, és találd meg a következő lépést."
      }
    ],
    stepsEyebrow: "EGYSZERŰ KEZDÉS",
    stepsTitle: "Három lépés, és indulhatsz.",
    steps: [
      {
        number: "01",
        title: "Hozz létre egy fiókot",
        text: "Regisztrálj, és lépj be az Aivora AI felületére."
      },
      {
        number: "02",
        title: "Írd le a célodat",
        text: "Tedd fel a kérdésedet, vagy válassz egy üzleti témát."
      },
      {
        number: "03",
        title: "Kapj ötleteket",
        text: "Használd az AI válaszait a tervezéshez és a következő döntéseidhez."
      }
    ],
    pricingEyebrow: "CSOMAGOK",
    pricingTitle: "Kezdj ingyen. Fejlődj tovább.",
    pricingDescription:
      "Válaszd a számodra megfelelő csomagot. A fizetős előfizetés jelenleg még nem érhető el éles fizetéssel.",
    free: "Free",
    freePrice: "0 Ft",
    pro: "Pro",
    proPrice: "2 990 Ft",
    month: "/hó",
    freeDescription: "Az első lépésekhez és az AI kipróbálásához.",
    proDescription: "Több AI-kérés aktív Pro-előfizetéssel.",
    freeFeatures: [
      "10 AI-kérés naponta",
      "Üzleti AI-asszisztens",
      "Beszélgetések mentése"
    ],
    proFeatures: [
      "100 AI-kérés naponta",
      "Üzleti AI-asszisztens",
      "Beszélgetések mentése"
    ],
    freeButton: "Ingyenes regisztráció",
    proButton: "Csomagok megtekintése",
    pricingNote:
      "A Pro-előfizetés éles fizetése még nincs aktiválva.",
    ctaTitle: "Készen állsz a következő lépésre?",
    ctaText:
      "Indítsd el az első beszélgetésedet, és fedezd fel, hogyan segíthet az Aivora AI.",
    ctaButton: "Aivora AI kipróbálása →",
    footerDescription:
      "AI üzleti asszisztens ötletekhez, tervezéshez és fejlődéshez.",
    footerStatus: "A szolgáltatás fejlesztés alatt áll.",
    rights: "Minden jog fenntartva."
  },

  en: {
    navFeatures: "Features",
    navPricing: "Pricing",
    navDemo: "Demo",
    login: "Login",
    register: "Sign up",
    badge: "✦ AI BUSINESS ASSISTANT",
    heroStart: "A smarter future",
    heroHighlight: "for your business.",
    description:
      "Business ideas, marketing plans, writing assistance and customer acquisition advice in one place. Grow your business with Aivora AI.",
    primary: "Get started free →",
    secondary: "Try the demo",
    heroNote: "Start with the Free plan and explore the possibilities of AI.",
    previewLabel: "AIVORA AI · BUSINESS ASSISTANT",
    previewUser: "How can I attract more customers?",
    previewAnswer:
      "Start by defining your target audience, creating a clear offer, and testing 2–3 customer acquisition channels. I can help you build a practical plan.",
    previewInput: "Ask anything about your business...",
    featuresEyebrow: "WHAT WE OFFER",
    featuresTitle: "One assistant. More possibilities.",
    featuresDescription:
      "Aivora AI helps you brainstorm, plan and clarify your next business steps.",
    features: [
      {
        icon: "💡",
        title: "Business ideas",
        text: "Discover opportunities and turn your ideas into practical plans."
      },
      {
        icon: "📣",
        title: "Marketing and content",
        text: "Get help with campaigns, social posts, emails and business offers."
      },
      {
        icon: "👥",
        title: "Customer acquisition",
        text: "Explore strategies for finding your first customers and growing your business."
      },
      {
        icon: "📈",
        title: "Business growth",
        text: "Create business plans, organize your goals and identify your next step."
      }
    ],
    stepsEyebrow: "GET STARTED",
    stepsTitle: "Three steps to get started.",
    steps: [
      {
        number: "01",
        title: "Create an account",
        text: "Sign up and access your Aivora AI dashboard."
      },
      {
        number: "02",
        title: "Describe your goal",
        text: "Ask a question or choose a business topic."
      },
      {
        number: "03",
        title: "Explore ideas",
        text: "Use AI-generated suggestions to plan your next steps."
      }
    ],
    pricingEyebrow: "PRICING",
    pricingTitle: "Start free. Grow further.",
    pricingDescription:
      "Choose the plan that fits your needs. Live payments for the paid subscription are not yet available.",
    free: "Free",
    freePrice: "0 Ft",
    pro: "Pro",
    proPrice: "2,990 Ft",
    month: "/month",
    freeDescription: "For getting started and exploring AI.",
    proDescription: "More AI requests with an active Pro subscription.",
    freeFeatures: [
      "10 AI requests per day",
      "AI business assistant",
      "Saved conversations"
    ],
    proFeatures: [
      "100 AI requests per day",
      "AI business assistant",
      "Saved conversations"
    ],
    freeButton: "Create a free account",
    proButton: "View pricing",
    pricingNote:
      "Live payments for Pro subscriptions are not yet enabled.",
    ctaTitle: "Ready for your next step?",
    ctaText:
      "Start your first conversation and discover how Aivora AI can help.",
    ctaButton: "Try Aivora AI →",
    footerDescription:
      "An AI business assistant for ideas, planning and growth.",
    footerStatus: "The service is under development.",
    rights: "All rights reserved."
  }
};

export default function Home() {
  const [language, setLanguage] = useState("hu");
  const t = content[language];

  return (
    <main className="home">
      <style>{`
        .home {
          --bg: #0b0d18;
          --panel: #171a2b;
          --panel-light: #202338;
          --border: #33364d;
          --text: #f5f2ff;
          --muted: #a8abc3;
          --purple: #a987f5;
          --red: #ef617d;

          min-height: 100vh;
          background:
            radial-gradient(
              circle at 75% 8%,
              rgba(123, 77, 209, 0.22),
              transparent 32%
            ),
            radial-gradient(
              circle at 8% 48%,
              rgba(239, 97, 125, 0.055),
              transparent 30%
            ),
            var(--bg);
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }

        .home * {
          box-sizing: border-box;
        }

        .home a {
          text-decoration: none;
        }

        .home button {
          font: inherit;
          cursor: pointer;
        }

        .home a:focus-visible,
        .home button:focus-visible {
          outline: 2px solid #c2a9ff;
          outline-offset: 4px;
        }

        .home-container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .home-nav {
          border-bottom: 1px solid #ffffff12;
          background: rgba(11, 13, 24, 0.85);
        }

        .home-nav-inner {
          min-height: 86px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          padding: 14px 0;
        }

        .home-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          flex-shrink: 0;
        }

        .home-brand-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: linear-gradient(
            135deg,
            #9b6af0,
            #6040a6
          );
          box-shadow: 0 8px 25px #8051df33;
          font-size: 25px;
        }

        .home-brand-name {
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .home-brand-name span {
          color: var(--red);
        }

        .home-nav-links,
        .home-nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .home-nav-links a {
          color: #b9bad0;
          font-size: 13px;
          font-weight: 600;
        }

        .home-nav-links a:hover {
          color: white;
        }

        .home-nav-actions {
          gap: 10px;
        }

        .home-lang {
          border: 1px solid #393b54;
          background: #1c1f32;
          color: #d5d0e9;
          border-radius: 9px;
          padding: 9px 11px;
          font-size: 12px;
        }

        .home-lang.active {
          background: #44316d;
          border-color: #9870eb;
          color: white;
        }

        .home-login {
          color: #e8e3f8;
          font-size: 13px;
          font-weight: 600;
          padding: 10px;
        }

        .home-signup {
          background: linear-gradient(
            120deg,
            #8259df,
            #a25bd4
          );
          color: white;
          padding: 12px 17px;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 700;
        }

        .home-hero {
          padding: 106px 0 88px;
          text-align: center;
        }

        .home-eyebrow {
          display: inline-flex;
          align-items: center;
          border: 1px solid #5d447d;
          background: #2b2142;
          color: #cdb5ff;
          border-radius: 50px;
          padding: 10px 17px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .home-hero h1 {
          max-width: 940px;
          margin: 28px auto 24px;
          font-size: clamp(39px, 6vw, 76px);
          line-height: 1.12;
          letter-spacing: -2.5px;
        }

        .home-gradient-text {
          display: block;
          background: linear-gradient(
            90deg,
            #bb9bff,
            #d7b2ff,
            #ed7897
          );
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .home-hero-description {
          max-width: 710px;
          margin: 0 auto;
          color: var(--muted);
          font-size: 17px;
          line-height: 1.8;
        }

        .home-hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 35px;
        }

        .home-primary {
          display: inline-block;
          padding: 16px 26px;
          border-radius: 12px;
          background: linear-gradient(
            120deg,
            #8259df,
            #aa5fda
          );
          color: white;
          font-size: 14px;
          font-weight: 800;
          box-shadow: 0 10px 35px #7c4dd52e;
          transition: transform .2s;
        }

        .home-primary:hover {
          transform: translateY(-2px);
        }

        .home-secondary {
          display: inline-block;
          padding: 15px 25px;
          border: 1px solid #4b4566;
          border-radius: 12px;
          background: #1b1c2e;
          color: #eee9ff;
          font-size: 14px;
          font-weight: 700;
        }

        .home-hero-note {
          margin-top: 20px;
          color: #898ca7;
          font-size: 12px;
        }

        .home-preview {
          max-width: 870px;
          margin: 65px auto 0;
          border: 1px solid #50426f;
          border-radius: 23px;
          overflow: hidden;
          background: #151827;
          text-align: left;
          box-shadow: 0 30px 90px #00000055;
        }

        .home-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 19px 23px;
          border-bottom: 1px solid #35344b;
          color: #d8cbff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .5px;
        }

        .home-preview-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #ee627f;
          box-shadow: 0 0 16px #ee627f55;
          flex-shrink: 0;
        }

        .home-preview-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 30px;
          min-height: 275px;
        }

        .home-preview-user,
        .home-preview-ai {
          padding: 15px 19px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.7;
        }

        .home-preview-user {
          align-self: flex-end;
          max-width: 75%;
          background: linear-gradient(
            120deg,
            #6849b6,
            #51358f
          );
          border: 1px solid #8561c8;
          color: white;
        }

        .home-preview-ai {
          align-self: flex-start;
          max-width: 84%;
          background: #23263a;
          border: 1px solid #373a53;
          color: #eeebfb;
        }

        .home-preview-input {
          margin: 0 22px 22px;
          border: 1px solid #3c3c56;
          border-radius: 12px;
          padding: 16px 18px;
          background: #1c2031;
          color: #858aa8;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .home-preview-arrow {
          color: #c09bff;
          font-weight: 800;
        }

        .home-section {
          padding: 90px 0;
        }

        .home-section-head {
          max-width: 700px;
          margin: 0 auto 43px;
          text-align: center;
        }

        .home-section-kicker {
          color: #c19eff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .home-section-head h2 {
          font-size: clamp(30px, 4vw, 44px);
          letter-spacing: -1.5px;
          line-height: 1.2;
          margin: 17px 0;
        }

        .home-section-head p {
          color: var(--muted);
          line-height: 1.8;
          font-size: 15px;
        }

        .home-feature-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .home-feature {
          background: linear-gradient(
            145deg,
            #1d2034,
            #171a2b
          );
          border: 1px solid #34364f;
          border-radius: 19px;
          padding: 30px;
          transition: border-color .2s, transform .2s;
        }

        .home-feature:hover {
          border-color: #8d68d8;
          transform: translateY(-3px);
        }

        .home-feature-icon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #32274e;
          font-size: 26px;
        }

        .home-feature h3 {
          font-size: 20px;
          margin: 24px 0 12px;
        }

        .home-feature p {
          color: var(--muted);
          line-height: 1.8;
          margin: 0;
          font-size: 14px;
        }

        .home-steps {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .home-step {
          border: 1px solid #34364f;
          border-radius: 19px;
          padding: 28px;
          background: #171a2b;
        }

        .home-step-number {
          color: #ef7694;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .home-step h3 {
          margin: 25px 0 12px;
          font-size: 19px;
        }

        .home-step p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .home-pricing-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 20px;
          max-width: 850px;
          margin: 0 auto;
        }

        .home-plan {
          border: 1px solid #3c3d57;
          border-radius: 21px;
          padding: 32px;
          background: #1a1d30;
        }

        .home-plan.featured {
          border-color: #916be0;
          background: linear-gradient(
            145deg,
            #27213f,
            #1b1d30
          );
          box-shadow: 0 10px 50px #7b4bcd1c;
        }

        .home-plan-label {
          font-size: 20px;
          font-weight: 800;
        }

        .home-plan-price {
          margin: 23px 0 15px;
          font-size: 39px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .home-plan-price small {
          color: #a6a4bf;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0;
        }

        .home-plan-description {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
          min-height: 44px;
        }

        .home-plan-list {
          list-style: none;
          padding: 0;
          margin: 28px 0;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .home-plan-list li {
          color: #dcd9ed;
          font-size: 14px;
        }

        .home-plan-list li::before {
          content: "✓";
          color: #bb9aff;
          margin-right: 11px;
          font-weight: 800;
        }

        .home-plan-button {
          display: block;
          text-align: center;
          padding: 15px;
          border: 1px solid #5a4b80;
          border-radius: 12px;
          color: white;
          font-size: 13px;
          font-weight: 700;
          background: #32294b;
        }

        .home-plan.featured .home-plan-button {
          background: linear-gradient(
            120deg,
            #8358df,
            #ad61d6
          );
          border-color: transparent;
        }

        .home-pricing-note {
          margin-top: 24px;
          text-align: center;
          color: #a7a5bf;
          font-size: 13px;
        }

        .home-cta {
          margin: 70px auto 95px;
          border: 1px solid #665083;
          border-radius: 25px;
          padding: 70px 30px;
          text-align: center;
          background:
            radial-gradient(
              circle at 50% 0%,
              #583a854d,
              transparent 70%
            ),
            #1c1b30;
        }

        .home-cta h2 {
          font-size: clamp(29px, 4vw, 43px);
          margin: 0 0 18px;
          letter-spacing: -1.3px;
        }

        .home-cta p {
          max-width: 580px;
          margin: 0 auto 28px;
          color: var(--muted);
          line-height: 1.8;
        }

        .home-footer {
          border-top: 1px solid #303147;
          padding: 35px 0;
        }

        .home-footer-inner {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .home-footer p {
          color: #9395ae;
          font-size: 12px;
          line-height: 1.8;
          margin: 10px 0;
        }

        .home-footer-links {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .home-footer-links a {
          color: #b7b5cc;
          font-size: 13px;
        }

        @media (max-width: 1050px) {
          .home-nav-inner {
            justify-content: center;
          }
        }

        @media (max-width: 700px) {
          .home-container {
            width: min(100% - 28px, 1180px);
          }

          .home-nav-inner {
            gap: 17px;
          }

          .home-nav-links {
            justify-content: center;
            gap: 14px;
          }

          .home-nav-actions {
            justify-content: center;
          }

          .home-hero {
            padding: 72px 0 55px;
          }

          .home-hero h1 {
            letter-spacing: -1.3px;
          }

          .home-hero-description {
            font-size: 15px;
          }

          .home-preview {
            margin-top: 42px;
          }

          .home-preview-body {
            padding: 18px;
            min-height: 230px;
          }

          .home-preview-user,
          .home-preview-ai {
            max-width: 95%;
            font-size: 12px;
          }

          .home-section {
            padding: 60px 0;
          }

          .home-feature-grid,
          .home-steps,
          .home-pricing-grid {
            grid-template-columns: 1fr;
          }

          .home-feature,
          .home-step,
          .home-plan {
            padding: 24px;
          }

          .home-cta {
            margin: 40px auto 65px;
            padding: 48px 22px;
          }
        }
      `}</style>

      <nav className="home-nav">
        <div className="home-container home-nav-inner">
          <Link href="/" className="home-brand">
            <div className="home-brand-icon">✦</div>
            <div className="home-brand-name">
              Aivora<span>.</span> AI
            </div>
          </Link>

          <div className="home-nav-links">
            <a href="#features">{t.navFeatures}</a>
            <a href="#pricing">{t.navPricing}</a>
            <Link href="/demo">{t.navDemo}</Link>
          </div>

          <div className="home-nav-actions">
            <button
              type="button"
              className={`home-lang ${
                language === "hu" ? "active" : ""
              }`}
              onClick={() => setLanguage("hu")}
              aria-pressed={language === "hu"}
            >
              🇭🇺 HU
            </button>

            <button
              type="button"
              className={`home-lang ${
                language === "en" ? "active" : ""
              }`}
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
            >
              🇬🇧 EN
            </button>

            <Link href="/login" className="home-login">
              {t.login}
            </Link>

            <Link href="/register" className="home-signup">
              {t.register}
            </Link>
          </div>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-container">
          <div className="home-eyebrow">{t.badge}</div>

          <h1>
            {t.heroStart}
            <span className="home-gradient-text">
              {t.heroHighlight}
            </span>
          </h1>

          <p className="home-hero-description">
            {t.description}
          </p>

          <div className="home-hero-actions">
            <Link href="/register" className="home-primary">
              {t.primary}
            </Link>

            <Link href="/demo" className="home-secondary">
              {t.secondary}
            </Link>
          </div>

          <p className="home-hero-note">{t.heroNote}</p>

          <div className="home-preview">
            <div className="home-preview-header">
              <span>✦ {t.previewLabel}</span>
              <span
                className="home-preview-dot"
                aria-hidden="true"
              />
            </div>

            <div className="home-preview-body">
              <div className="home-preview-user">
                {t.previewUser}
              </div>

              <div className="home-preview-ai">
                ✦ {t.previewAnswer}
              </div>
            </div>

            <div className="home-preview-input">
              <span>{t.previewInput}</span>
              <span className="home-preview-arrow">↑</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="home-section"
        id="features"
      >
        <div className="home-container">
          <div className="home-section-head">
            <div className="home-section-kicker">
              {t.featuresEyebrow}
            </div>

            <h2>{t.featuresTitle}</h2>
            <p>{t.featuresDescription}</p>
          </div>

          <div className="home-feature-grid">
            {t.features.map((feature) => (
              <div
                key={feature.title}
                className="home-feature"
              >
                <div className="home-feature-icon">
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container">
          <div className="home-section-head">
            <div className="home-section-kicker">
              {t.stepsEyebrow}
            </div>

            <h2>{t.stepsTitle}</h2>
          </div>

          <div className="home-steps">
            {t.steps.map((step) => (
              <div
                key={step.number}
                className="home-step"
              >
                <div className="home-step-number">
                  {step.number}
                </div>

                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="home-section"
        id="pricing"
      >
        <div className="home-container">
          <div className="home-section-head">
            <div className="home-section-kicker">
              {t.pricingEyebrow}
            </div>

            <h2>{t.pricingTitle}</h2>
            <p>{t.pricingDescription}</p>
          </div>

          <div className="home-pricing-grid">
            <div className="home-plan">
              <div className="home-plan-label">
                {t.free}
              </div>

              <div className="home-plan-price">
                {t.freePrice}
              </div>

              <p className="home-plan-description">
                {t.freeDescription}
              </p>

              <ul className="home-plan-list">
                {t.freeFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <Link
                href="/register"
                className="home-plan-button"
              >
                {t.freeButton}
              </Link>
            </div>

            <div className="home-plan featured">
              <div className="home-plan-label">
                ✦ {t.pro}
              </div>

              <div className="home-plan-price">
                {t.proPrice}
                <small>{t.month}</small>
              </div>

              <p className="home-plan-description">
                {t.proDescription}
              </p>

              <ul className="home-plan-list">
                {t.proFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <Link
                href="/pricing"
                className="home-plan-button"
              >
                {t.proButton}
              </Link>
            </div>
          </div>

          <p className="home-pricing-note">
            {t.pricingNote}
          </p>
        </div>
      </section>

      <section className="home-container">
        <div className="home-cta">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>

          <Link
            href="/register"
            className="home-primary"
          >
            {t.ctaButton}
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-container home-footer-inner">
          <div>
            <div className="home-brand-name">
              Aivora<span>.</span> AI
            </div>

            <p>{t.footerDescription}</p>
            <p>{t.footerStatus}</p>
            <p>© 2026 Aivora AI. {t.rights}</p>
          </div>

          <div className="home-footer-links">
            <Link href="/demo">{t.navDemo}</Link>
            <Link href="/pricing">{t.navPricing}</Link>
            <Link href="/login">{t.login}</Link>
            <Link href="/register">{t.register}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
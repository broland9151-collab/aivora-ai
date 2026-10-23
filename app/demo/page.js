"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const translations = {
  hu: {
    badge: "INTERAKTÍV DEMÓ",
    title: "Próbáld ki az",
    subtitle:
      "Ismerd meg, hogyan néz ki az Aivora AI beszélgetési felülete.",
    demo: "AI Chat – Demó",
    status: "Bemutató mód",
    welcome:
      "Szia! 👋 Üdvözöllek az Aivora AI demójában! Miben segíthetek?",
    reply:
      "Köszönöm a kérdésed! 💜 Ez jelenleg egy bemutató verzió, amely előre megírt válaszokat használ. A valódi AI-asszisztenst a bejelentkezés után érheted el.",
    placeholder: "Írd ide a kérdésed...",
    send: "Küldés →",
    note:
      "Ez egy interaktív bemutató, nem valódi AI-beszélgetés. Nem használ OpenAI API-t.",
    start: "Valódi AI használata →",
    home: "← Vissza a főoldalra",
    you: "Te",
    assistant: "Aivora AI",
    footer: "Minden jog fenntartva.",
  },
  en: {
    badge: "INTERACTIVE DEMO",
    title: "Try",
    subtitle:
      "Discover what the Aivora AI chat interface looks like.",
    demo: "AI Chat – Demo",
    status: "Demo mode",
    welcome:
      "Hi! 👋 Welcome to the Aivora AI demo! How can I help you?",
    reply:
      "Thanks for your question! 💜 This is currently a demonstration with predefined responses. You can access the real AI assistant after signing in.",
    placeholder: "Type your question...",
    send: "Send →",
    note:
      "This is an interactive demonstration, not a real AI conversation. It does not use the OpenAI API.",
    start: "Use the real AI →",
    home: "← Back to homepage",
    you: "You",
    assistant: "Aivora AI",
    footer: "All rights reserved.",
  },
};

export default function DemoPage() {
  const [language, setLanguage] = useState("hu");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const bottomRef = useRef(null);

  const t = translations[language];

  const visibleMessages =
    messages.length > 0
      ? messages
      : [
          {
            role: "assistant",
            text: t.welcome,
          },
        ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();

    const question = input.trim();

    if (!question) return;

    setMessages((previous) => [
      ...(previous.length > 0
        ? previous
        : [
            {
              role: "assistant",
              text: t.welcome,
            },
          ]),
      {
        role: "user",
        text: question,
      },
      {
        role: "assistant",
        text: t.reply,
      },
    ]);

    setInput("");
  }

  return (
    <main className="aivora-demo">
      <style>{`
        .aivora-demo {
          --purple: #b75cff;
          --text: #f8f0ff;
          --muted: #b8a4c9;

          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(
              ellipse at 50% 20%,
              rgba(120, 35, 196, 0.23),
              transparent 48%
            ),
            radial-gradient(
              ellipse at 90% 85%,
              rgba(93, 25, 155, 0.12),
              transparent 35%
            ),
            #08050f;
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }

        .aivora-demo * {
          box-sizing: border-box;
        }

        .aivora-demo a {
          text-decoration: none;
        }

        .aivora-demo button,
        .aivora-demo input {
          font: inherit;
        }

        .aivora-demo button {
          cursor: pointer;
        }

        .aivora-demo a:focus-visible,
        .aivora-demo button:focus-visible,
        .aivora-demo input:focus-visible {
          outline: 2px solid #d79aff;
          outline-offset: 3px;
        }

        .demo-header {
          border-bottom: 1px solid #45215f;
          background: rgba(12, 6, 22, 0.72);
        }

        .demo-header-inner {
          width: min(1120px, calc(100% - 36px));
          min-height: 86px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .demo-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: white;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .demo-brand-icon {
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

        .demo-brand-dot {
          color: #d38aff;
        }

        .demo-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .demo-lang {
          padding: 10px 12px;
          border: 1px solid #512b70;
          border-radius: 10px;
          background: #190d28;
          color: #cdb5e1;
          font-size: 12px;
          font-weight: 700;
          transition: 0.2s;
        }

        .demo-lang.active {
          border-color: #b963ff;
          background: #532080;
          color: white;
          box-shadow: 0 0 16px #a642ff35;
        }

        .demo-container {
          width: min(960px, calc(100% - 36px));
          margin: 0 auto;
          padding: 60px 0 80px;
          flex: 1;
        }

        .demo-hero {
          text-align: center;
          margin-bottom: 35px;
        }

        .demo-badge {
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

        .demo-hero h1 {
          margin: 23px 0 13px;
          font-size: clamp(33px, 5vw, 48px);
          line-height: 1.2;
          letter-spacing: -1.6px;
        }

        .demo-hero h1 span {
          background: linear-gradient(
            90deg,
            #b65cff,
            #e1b1ff
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .demo-hero p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .demo-chat {
          overflow: hidden;
          border: 1px solid #8041ad;
          border-radius: 23px;
          background: linear-gradient(
            150deg,
            #1c0f2c,
            #10091b
          );
          box-shadow:
            0 0 45px #8d31dc27,
            0 25px 80px #0007;
        }

        .demo-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 21px 25px;
          border-bottom: 1px solid #492665;
          background: #201032;
        }

        .demo-chat-heading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .demo-chat-symbol {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(
            135deg,
            #a44cff,
            #5e239c
          );
          color: white;
          font-size: 23px;
          box-shadow: 0 0 18px #9d3af955;
        }

        .demo-chat-heading h2 {
          margin: 0 0 5px;
          color: #fff;
          font-size: 17px;
        }

        .demo-chat-heading p {
          margin: 0;
          color: #bba3cc;
          font-size: 12px;
        }

        .demo-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border: 1px solid #71409b;
          border-radius: 50px;
          background: #301748;
          color: #dbb1ff;
          font-size: 11px;
          font-weight: 700;
        }

        .demo-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #c07bff;
          box-shadow: 0 0 9px #ba6aff;
        }

        .demo-messages {
          height: 385px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 19px;
          padding: 26px;
          scrollbar-color: #6d348f #180e27;
        }

        .demo-message {
          display: flex;
          gap: 11px;
          max-width: 85%;
          align-items: flex-start;
        }

        .demo-message.assistant {
          align-self: flex-start;
        }

        .demo-message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .demo-avatar {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #532178;
          color: #e8c6ff;
          font-size: 17px;
          font-weight: 800;
        }

        .demo-message.user .demo-avatar {
          background: #39244f;
          color: #d9c0ea;
          font-size: 12px;
        }

        .demo-message-content {
          min-width: 0;
        }

        .demo-message-name {
          margin: 0 0 7px;
          color: #b9a1cc;
          font-size: 11px;
          font-weight: 700;
        }

        .demo-message.user .demo-message-name {
          text-align: right;
        }

        .demo-bubble {
          padding: 15px 17px;
          border: 1px solid #4d2b68;
          border-radius: 4px 15px 15px 15px;
          background: #29183a;
          color: #f3e9fa;
          font-size: 14px;
          line-height: 1.7;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }

        .demo-message.user .demo-bubble {
          border-color: #9950d7;
          border-radius: 15px 4px 15px 15px;
          background: linear-gradient(
            120deg,
            #6821ad,
            #9236d2
          );
          color: #fff;
        }

        .demo-compose {
          padding: 20px 25px 23px;
          border-top: 1px solid #492665;
          background: #1a0d29;
        }

        .demo-form {
          display: flex;
          align-items: stretch;
          gap: 12px;
        }

        .demo-input {
          flex: 1;
          min-width: 0;
          min-height: 51px;
          padding: 14px 16px;
          border: 1px solid #573477;
          border-radius: 12px;
          background: #10091c;
          color: #fff;
          font-size: 14px;
        }

        .demo-input::placeholder {
          color: #88739b;
        }

        .demo-input:focus {
          border-color: #bc67ff;
          box-shadow: 0 0 0 3px #a443ff20;
          outline: none;
        }

        .demo-send {
          min-width: 125px;
          padding: 12px 20px;
          border: 1px solid #c17bff;
          border-radius: 12px;
          background: linear-gradient(
            120deg,
            #7622d5,
            #b852ff
          );
          box-shadow: 0 0 24px #9837f956;
          color: white;
          font-size: 14px;
          font-weight: 800;
          transition: 0.2s;
        }

        .demo-send:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 34px #a83eff90;
        }

        .demo-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .demo-note {
          margin: 13px 0 0;
          color: #9983aa;
          text-align: center;
          font-size: 11px;
          line-height: 1.6;
        }

        .demo-bottom {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 30px;
        }

        .demo-start {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          min-height: 47px;
          padding: 13px 21px;
          border: 1px solid #b86cff;
          border-radius: 12px;
          background: #391953;
          color: #f3dfff;
          font-size: 13px;
          font-weight: 800;
        }

        .demo-start:hover {
          background: #532378;
        }

        .demo-home {
          color: #b99aca;
          font-size: 13px;
          font-weight: 700;
        }

        .demo-home:hover {
          color: #e3b0ff;
        }

        .demo-footer {
          padding: 24px 20px;
          border-top: 1px solid #351b4a;
          color: #806d94;
          text-align: center;
          font-size: 12px;
        }

        @media (max-width: 600px) {
          .demo-header-inner {
            min-height: 75px;
          }

          .demo-brand {
            font-size: 19px;
          }

          .demo-brand-icon {
            width: 37px;
            height: 37px;
            font-size: 22px;
          }

          .demo-lang {
            padding: 9px 10px;
          }

          .demo-container {
            padding-top: 45px;
          }

          .demo-chat-header {
            padding: 18px;
          }

          .demo-messages {
            height: 360px;
            padding: 19px 15px;
          }

          .demo-message {
            max-width: 95%;
          }

          .demo-compose {
            padding: 15px;
          }

          .demo-form {
            flex-direction: column;
          }

          .demo-send {
            width: 100%;
            min-height: 49px;
          }

          .demo-status {
            font-size: 10px;
            padding: 8px;
          }
        }

        @media (max-width: 360px) {
          .demo-header-inner {
            flex-wrap: wrap;
            justify-content: center;
            padding: 13px 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .demo-send {
            transition: none;
          }
        }
      `}</style>

      <header className="demo-header">
        <div className="demo-header-inner">
          <Link href="/" className="demo-brand">
            <span className="demo-brand-icon">✦</span>
            <span>
              Aivora<span className="demo-brand-dot">.</span> AI
            </span>
          </Link>

          <div className="demo-header-actions">
            <button
              type="button"
              className={`demo-lang ${
                language === "hu" ? "active" : ""
              }`}
              onClick={() => setLanguage("hu")}
              aria-pressed={language === "hu"}
            >
              HU
            </button>

            <button
              type="button"
              className={`demo-lang ${
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

      <div className="demo-container">
        <div className="demo-hero">
          <div className="demo-badge">
            ✦ {t.badge}
          </div>

          <h1>
            {t.title} <span>Aivora AI-t</span>
          </h1>

          <p>{t.subtitle}</p>
        </div>

        <section className="demo-chat">
          <div className="demo-chat-header">
            <div className="demo-chat-heading">
              <div className="demo-chat-symbol">✦</div>

              <div>
                <h2>{t.demo}</h2>
                <p>Aivora AI</p>
              </div>
            </div>

            <div className="demo-status">
              <span
                className="demo-status-dot"
                aria-hidden="true"
              />
              {t.status}
            </div>
          </div>

          <div
            className="demo-messages"
            aria-label={t.demo}
            role="log"
          >
            {visibleMessages.map((message, index) => (
              <div
                key={index}
                className={`demo-message ${message.role}`}
              >
                <div
                  className="demo-avatar"
                  aria-hidden="true"
                >
                  {message.role === "user" ? "U" : "✦"}
                </div>

                <div className="demo-message-content">
                  <p className="demo-message-name">
                    {message.role === "user"
                      ? t.you
                      : t.assistant}
                  </p>

                  <div className="demo-bubble">
                    {message.text}
                  </div>
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          <div className="demo-compose">
            <form
              className="demo-form"
              onSubmit={sendMessage}
            >
              <input
                className="demo-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                aria-label={t.placeholder}
                maxLength={2000}
              />

              <button
                type="submit"
                className="demo-send"
                disabled={!input.trim()}
              >
                {t.send}
              </button>
            </form>

            <p className="demo-note">
              ◈ {t.note}
            </p>
          </div>
        </section>

        <div className="demo-bottom">
          <Link href="/dashboard" className="demo-start">
            {t.start}
          </Link>

          <Link href="/" className="demo-home">
            {t.home}
          </Link>
        </div>
      </div>

      <footer className="demo-footer">
        © 2026 Aivora AI · {t.footer}
      </footer>
    </main>
  );
}
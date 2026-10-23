
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
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);

  const hu = language === "hu";

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setMessage("");

    if (password.length < 8) {
      setMessageType("error");
      setMessage(
        hu
          ? "A jelszónak legalább 8 karakteresnek kell lennie."
          : "Password must be at least 8 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            company: company.trim(),
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        setMessageType("error");
        setMessage(
          hu
            ? `A regisztráció nem sikerült: ${error.message}`
            : `Registration failed: ${error.message}`
        );
        return;
      }

      setPassword("");
      setMessageType("success");
      setMessage(
        data.session
          ? hu
            ? "Sikeres regisztráció! Már bejelentkeztél. Megnyithatod a dashboardot."
            : "Registration successful! You're signed in. You can open your dashboard."
          : hu
          ? "A regisztrációs kérelmet elküldtük. Ha e-mailes megerősítés szükséges, ellenőrizd a postafiókodat."
          : "Your registration request was submitted. If email confirmation is required, check your inbox."
      );
    } catch {
      setMessageType("error");
      setMessage(
        hu
          ? "Kapcsolódási hiba. Próbáld újra."
          : "Connection error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="aivora-register">
      <style>{`
        .aivora-register {
          --bg: #08050f;
          --text: #f8f0ff;
          --muted: #b8a4c9;
          --purple: #b75cff;

          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(
              ellipse at 50% 18%,
              rgba(120, 35, 196, 0.24),
              transparent 46%
            ),
            radial-gradient(
              ellipse at 90% 85%,
              rgba(93, 25, 155, 0.12),
              transparent 35%
            ),
            var(--bg);
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }

        .aivora-register * {
          box-sizing: border-box;
        }

        .aivora-register a {
          text-decoration: none;
        }

        .aivora-register button,
        .aivora-register input {
          font: inherit;
        }

        .aivora-register button {
          cursor: pointer;
        }

        .aivora-register a:focus-visible,
        .aivora-register button:focus-visible,
        .aivora-register input:focus-visible {
          outline: 2px solid #d79aff;
          outline-offset: 3px;
        }

        .register-header {
          width: 100%;
          min-height: 86px;
          border-bottom: 1px solid #45215f;
          background: rgba(12, 6, 22, 0.72);
        }

        .register-header-inner {
          width: min(1120px, calc(100% - 36px));
          min-height: 86px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .register-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .register-brand-icon {
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

        .register-brand-dot {
          color: #d38aff;
        }

        .register-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .register-lang {
          padding: 10px 12px;
          border: 1px solid #512b70;
          border-radius: 10px;
          background: #190d28;
          color: #cdb5e1;
          font-size: 12px;
          font-weight: 700;
          transition: 0.2s;
        }

        .register-lang.active {
          border-color: #b963ff;
          background: #532080;
          color: white;
          box-shadow: 0 0 16px #a642ff35;
        }

        .register-center {
          width: 100%;
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 70px 20px 85px;
        }

        .register-content {
          width: 100%;
          max-width: 510px;
        }

        .register-top {
          text-align: center;
          margin-bottom: 30px;
        }

        .register-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 17px;
          border-radius: 50px;
          border: 1px solid #8140b5;
          background: #251037;
          color: #dfb1ff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .register-top h1 {
          margin: 23px 0 12px;
          color: #fff;
          font-size: clamp(31px, 5vw, 43px);
          line-height: 1.18;
          letter-spacing: -1.6px;
        }

        .register-top h1 span {
          background: linear-gradient(
            90deg,
            #b65cff,
            #e1b1ff
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .register-top p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.8;
          margin: 0;
        }

        .register-card {
          border: 1px solid #8041ad;
          border-radius: 23px;
          padding: 35px;
          background: linear-gradient(
            150deg,
            #201031,
            #11091d
          );
          box-shadow:
            0 0 45px #8d31dc27,
            0 25px 80px #0007;
        }

        .register-card-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .register-card-symbol {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          border: 1px solid #8547b9;
          background: #34154f;
          color: #e6bdff;
          font-size: 23px;
        }

        .register-card-heading h2 {
          margin: 0;
          font-size: 20px;
          letter-spacing: -0.5px;
        }

        .register-card-heading p {
          margin: 5px 0 0;
          color: #ad97bf;
          font-size: 12px;
        }

        .register-field {
          margin-bottom: 19px;
        }

        .register-field label {
          display: block;
          margin-bottom: 10px;
          color: #e9d9f4;
          font-size: 13px;
          font-weight: 700;
        }

        .register-input {
          width: 100%;
          min-height: 51px;
          padding: 14px 15px;
          border: 1px solid #573477;
          border-radius: 12px;
          background: #10091c;
          color: #fff;
          font-size: 14px;
          transition: 0.2s;
        }

        .register-input::placeholder {
          color: #806d94;
        }

        .register-input:hover {
          border-color: #8650ad;
        }

        .register-input:focus {
          border-color: #bc67ff;
          box-shadow: 0 0 0 3px #a443ff20;
          outline: none;
        }

        .register-password-wrap {
          position: relative;
        }

        .register-password-wrap .register-input {
          padding-right: 95px;
        }

        .register-password-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          border-radius: 8px;
          padding: 9px 10px;
          background: transparent;
          color: #d3a8ef;
          font-size: 12px;
          font-weight: 700;
        }

        .register-password-toggle:hover {
          background: #301644;
        }

        .register-hint {
          margin: 9px 0 0;
          color: #a58db8;
          font-size: 12px;
        }

        .register-submit {
          width: 100%;
          min-height: 52px;
          margin-top: 12px;
          border: 1px solid #c17bff;
          border-radius: 12px;
          background: linear-gradient(
            120deg,
            #7622d5,
            #b852ff
          );
          box-shadow: 0 0 24px #9837f956;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          transition: 0.2s;
        }

        .register-submit:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 0 34px #a83eff90;
        }

        .register-submit:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .register-message {
          margin-top: 19px;
          padding: 13px 15px;
          border-radius: 11px;
          font-size: 13px;
          line-height: 1.6;
        }

        .register-message.error {
          border: 1px solid #9d455c;
          background: #401826;
          color: #ffc3ce;
        }

        .register-message.success {
          border: 1px solid #48866a;
          background: #123527;
          color: #b5f3cf;
        }

        .register-message a {
          color: inherit;
          text-decoration: underline;
          font-weight: 800;
        }

        .register-login {
          margin: 27px 0 0;
          padding-top: 23px;
          border-top: 1px solid #45255f;
          text-align: center;
          color: #bca8ce;
          font-size: 13px;
        }

        .register-login a {
          color: #d991ff;
          font-weight: 800;
        }

        .register-login a:hover {
          color: #f0c9ff;
        }

        .register-back {
          display: block;
          margin-top: 29px;
          text-align: center;
          color: #b99aca;
          font-size: 13px;
          font-weight: 700;
        }

        .register-back:hover {
          color: #e3b0ff;
        }

        .register-security {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 25px;
          color: #9c85b0;
          font-size: 12px;
          text-align: center;
        }

        .register-footer {
          padding: 24px 20px;
          border-top: 1px solid #351b4a;
          color: #806d94;
          text-align: center;
          font-size: 12px;
        }

        @media (max-width: 600px) {
          .register-header-inner {
            min-height: 75px;
          }

          .register-header {
            min-height: 75px;
          }

          .register-brand {
            font-size: 19px;
          }

          .register-brand-icon {
            width: 37px;
            height: 37px;
            font-size: 22px;
          }

          .register-lang {
            padding: 9px 10px;
          }

          .register-center {
            padding: 55px 15px 65px;
          }

          .register-card {
            padding: 25px 21px;
            border-radius: 19px;
          }

          .register-top h1 {
            font-size: 34px;
          }
        }

        @media (max-width: 360px) {
          .register-header-inner {
            flex-wrap: wrap;
            justify-content: center;
            padding: 13px 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .register-submit {
            transition: none;
          }
        }
      `}</style>

      <header className="register-header">
        <div className="register-header-inner">
          <Link href="/" className="register-brand">
            <span className="register-brand-icon">✦</span>
            <span>
              Aivora<span className="register-brand-dot">.</span> AI
            </span>
          </Link>

          <div className="register-header-actions">
            <button
              type="button"
              className={`register-lang ${
                language === "hu" ? "active" : ""
              }`}
              onClick={() => setLanguage("hu")}
              aria-pressed={language === "hu"}
            >
              HU
            </button>

            <button
              type="button"
              className={`register-lang ${
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

      <section className="register-center">
        <div className="register-content">
          <div className="register-top">
            <div className="register-badge">
              ✦ {hu ? "KEZDJ INGYEN" : "START FOR FREE"}
            </div>

            <h1>
              {hu ? "Csatlakozz az" : "Join"}{" "}
              <span>Aivora AI</span>
            </h1>

            <p>
              {hu
                ? "Hozd létre a fiókodat, és fedezd fel az AI üzleti asszisztensedet."
                : "Create your account and discover your AI business assistant."}
            </p>
          </div>

          <div className="register-card">
            <div className="register-card-heading">
              <div className="register-card-symbol">✦</div>
              <div>
                <h2>
                  {hu ? "Fiók létrehozása" : "Create an account"}
                </h2>
                <p>
                  {hu
                    ? "Add meg az adataidat"
                    : "Enter your details"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="register-field">
                <label htmlFor="company">
                  {hu ? "Cég neve" : "Company name"}
                </label>

                <input
                  id="company"
                  name="company"
                  type="text"
                  className="register-input"
                  placeholder={
                    hu ? "Vállalkozásod neve" : "Your company name"
                  }
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="name">
                  {hu ? "Kapcsolattartó neve" : "Contact name"}
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  className="register-input"
                  placeholder={
                    hu ? "Teljes neved" : "Your full name"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="email">
                  {hu ? "E-mail-cím" : "Email address"}
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  className="register-input"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="password">
                  {hu ? "Jelszó" : "Password"}
                </label>

                <div className="register-password-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="register-input"
                    placeholder={
                      hu
                        ? "Hozz létre egy jelszót"
                        : "Create a password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? hu
                          ? "Jelszó elrejtése"
                          : "Hide password"
                        : hu
                        ? "Jelszó megjelenítése"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword
                      ? hu
                        ? "Elrejtés"
                        : "Hide"
                      : hu
                      ? "Mutatás"
                      : "Show"}
                  </button>
                </div>

                <p className="register-hint">
                  {hu
                    ? "Legalább 8 karakter."
                    : "At least 8 characters."}
                </p>
              </div>

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading
                  ? hu
                    ? "Regisztráció folyamatban..."
                    : "Creating account..."
                  : hu
                  ? "Ingyenes regisztráció →"
                  : "Create free account →"}
              </button>
            </form>

            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`register-message ${messageType}`}
              >
                {message}

                {messageType === "success" && (
                  <div style={{ marginTop: 12 }}>
                    <Link href="/login">
                      {hu
                        ? "Tovább a bejelentkezéshez →"
                        : "Continue to login →"}
                    </Link>
                  </div>
                )}
              </div>
            )}

            <p className="register-login">
              {hu ? "Már van fiókod?" : "Already have an account?"}{" "}
              <Link href="/login">
                {hu ? "Bejelentkezés" : "Sign in"}
              </Link>
            </p>
          </div>

          <Link href="/" className="register-back">
            {hu
              ? "← Vissza a főoldalra"
              : "← Back to homepage"}
          </Link>

          <div className="register-security">
            <span aria-hidden="true">◈</span>
            <span>
              {hu
                ? "Biztonságos regisztráció Supabase segítségével"
                : "Secure registration powered by Supabase"}
            </span>
          </div>
        </div>
      </section>

      <footer className="register-footer">
        © 2026 Aivora AI ·{" "}
        {hu ? "Minden jog fenntartva." : "All rights reserved."}
      </footer>
    </main>
  );
}
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
  const [showPassword, setShowPassword] = useState(false);

  const hu = language === "hu";

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setLoading(true);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
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
      } else {
        setMessage(
          hu
            ? "Nem sikerült létrehozni a munkamenetet. Próbáld újra."
            : "Could not start a session. Please try again."
        );
      }
    } catch {
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
    <main className="aivora-login">
      <style>{`
        .aivora-login {
          --bg: #08050f;
          --panel: #160b25;
          --border: #542c77;
          --purple: #b75cff;
          --text: #f8f0ff;
          --muted: #b8a4c9;

          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(
              ellipse at 50% 25%,
              rgba(120, 35, 196, 0.23),
              transparent 48%
            ),
            radial-gradient(
              ellipse at 90% 85%,
              rgba(93, 25, 155, 0.12),
              transparent 35%
            ),
            var(--bg);
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .aivora-login * {
          box-sizing: border-box;
        }

        .aivora-login a {
          text-decoration: none;
        }

        .aivora-login button,
        .aivora-login input {
          font: inherit;
        }

        .aivora-login button {
          cursor: pointer;
        }

        .aivora-login a:focus-visible,
        .aivora-login button:focus-visible,
        .aivora-login input:focus-visible {
          outline: 2px solid #d79aff;
          outline-offset: 3px;
        }

        .login-header {
          width: 100%;
          min-height: 86px;
          border-bottom: 1px solid #45215f;
          background: rgba(12, 6, 22, 0.72);
        }

        .login-header-inner {
          width: min(1120px, calc(100% - 36px));
          min-height: 86px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .login-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .login-brand-icon {
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

        .login-brand-dot {
          color: #d38aff;
        }

        .login-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .login-lang {
          padding: 10px 12px;
          border: 1px solid #512b70;
          border-radius: 10px;
          background: #190d28;
          color: #cdb5e1;
          font-size: 12px;
          font-weight: 700;
          transition: 0.2s;
        }

        .login-lang.active {
          border-color: #b963ff;
          background: #532080;
          color: white;
          box-shadow: 0 0 16px #a642ff35;
        }

        .login-center {
          width: 100%;
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 75px 20px 85px;
        }

        .login-content {
          width: 100%;
          max-width: 465px;
        }

        .login-top {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-badge {
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

        .login-top h1 {
          margin: 23px 0 12px;
          color: #fff;
          font-size: clamp(31px, 5vw, 43px);
          line-height: 1.18;
          letter-spacing: -1.6px;
        }

        .login-top h1 span {
          background: linear-gradient(
            90deg,
            #b65cff,
            #e1b1ff
          );
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .login-top p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.8;
          margin: 0;
        }

        .login-card {
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

        .login-card-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .login-card-symbol {
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

        .login-card-heading h2 {
          margin: 0;
          font-size: 20px;
          letter-spacing: -0.5px;
        }

        .login-card-heading p {
          margin: 5px 0 0;
          color: #ad97bf;
          font-size: 12px;
        }

        .login-field {
          margin-bottom: 21px;
        }

        .login-field label {
          display: block;
          margin-bottom: 10px;
          color: #e9d9f4;
          font-size: 13px;
          font-weight: 700;
        }

        .login-input {
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

        .login-input::placeholder {
          color: #806d94;
        }

        .login-input:hover {
          border-color: #8650ad;
        }

        .login-input:focus {
          border-color: #bc67ff;
          box-shadow: 0 0 0 3px #a443ff20;
          outline: none;
        }

        .login-password-wrap {
          position: relative;
        }

        .login-password-wrap .login-input {
          padding-right: 90px;
        }

        .login-password-toggle {
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

        .login-password-toggle:hover {
          background: #301644;
        }

        .login-submit {
          width: 100%;
          min-height: 52px;
          margin-top: 8px;
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

        .login-submit:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 0 34px #a83eff90;
        }

        .login-submit:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .login-message {
          margin-top: 19px;
          padding: 13px 15px;
          border: 1px solid #9d455c;
          border-radius: 11px;
          background: #401826;
          color: #ffc3ce;
          font-size: 13px;
          line-height: 1.6;
        }

        .login-register {
          margin: 27px 0 0;
          padding-top: 23px;
          border-top: 1px solid #45255f;
          text-align: center;
          color: #bca8ce;
          font-size: 13px;
        }

        .login-register a {
          color: #d991ff;
          font-weight: 800;
        }

        .login-register a:hover {
          color: #f0c9ff;
        }

        .login-back {
          display: block;
          margin-top: 29px;
          text-align: center;
          color: #b99aca;
          font-size: 13px;
          font-weight: 700;
        }

        .login-back:hover {
          color: #e3b0ff;
        }

        .login-security {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 25px;
          color: #9c85b0;
          font-size: 12px;
          text-align: center;
        }

        .login-footer {
          padding: 24px 20px;
          border-top: 1px solid #351b4a;
          color: #806d94;
          text-align: center;
          font-size: 12px;
        }

        @media (max-width: 600px) {
          .login-header-inner {
            min-height: 75px;
          }

          .login-header {
            min-height: 75px;
          }

          .login-brand {
            font-size: 19px;
          }

          .login-brand-icon {
            width: 37px;
            height: 37px;
            font-size: 22px;
          }

          .login-lang {
            padding: 9px 10px;
          }

          .login-center {
            padding: 55px 15px 65px;
          }

          .login-card {
            padding: 25px 21px;
            border-radius: 19px;
          }

          .login-top h1 {
            font-size: 34px;
          }
        }

        @media (max-width: 360px) {
          .login-header-inner {
            flex-wrap: wrap;
            justify-content: center;
            padding: 13px 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-submit {
            transition: none;
          }
        }
      `}</style>

      <header className="login-header">
        <div className="login-header-inner">
          <Link href="/" className="login-brand">
            <span className="login-brand-icon">✦</span>
            <span>
              Aivora<span className="login-brand-dot">.</span> AI
            </span>
          </Link>

          <div className="login-header-actions">
            <button
              type="button"
              className={`login-lang ${
                language === "hu" ? "active" : ""
              }`}
              onClick={() => setLanguage("hu")}
              aria-pressed={language === "hu"}
            >
              HU
            </button>

            <button
              type="button"
              className={`login-lang ${
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

      <section className="login-center">
        <div className="login-content">
          <div className="login-top">
            <div className="login-badge">
              ✦ {hu ? "ÜDV ÚJRA" : "WELCOME BACK"}
            </div>

            <h1>
              {hu ? "Üdv újra az" : "Welcome back to"}{" "}
              <span>Aivora AI</span>
            </h1>

            <p>
              {hu
                ? "Jelentkezz be, és folytasd a vállalkozásod fejlesztését."
                : "Sign in and continue growing your business."}
            </p>
          </div>

          <div className="login-card">
            <div className="login-card-heading">
              <div className="login-card-symbol">✦</div>
              <div>
                <h2>{hu ? "Bejelentkezés" : "Sign in"}</h2>
                <p>
                  {hu
                    ? "Lépj be a fiókodba"
                    : "Access your account"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">
                  {hu ? "E-mail-cím" : "Email address"}
                </label>

                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="password">
                  {hu ? "Jelszó" : "Password"}
                </label>

                <div className="login-password-wrap">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    placeholder={
                      hu ? "Add meg a jelszavad" : "Enter your password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
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
              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading
                  ? hu
                    ? "Bejelentkezés..."
                    : "Signing in..."
                  : hu
                  ? "Bejelentkezés →"
                  : "Sign in →"}
              </button>
            </form>

            {message && (
              <p role="alert" className="login-message">
                {message}
              </p>
            )}

            <p className="login-register">
              {hu ? "Még nincs fiókod?" : "No account yet?"}{" "}
              <Link href="/register">
                {hu ? "Regisztráció" : "Create an account"}
              </Link>
            </p>
          </div>

          <Link href="/" className="login-back">
            {hu
              ? "← Vissza a főoldalra"
              : "← Back to homepage"}
          </Link>

          <div className="login-security">
            <span aria-hidden="true">◈</span>
            <span>
              {hu
                ? "Biztonságos bejelentkezés Supabase segítségével"
                : "Secure login powered by Supabase"}
            </span>
          </div>
        </div>
      </section>

      <footer className="login-footer">
        © 2026 Aivora AI ·{" "}
        {hu ? "Minden jog fenntartva." : "All rights reserved."}
      </footer>
    </main>
  );
}
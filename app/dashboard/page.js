"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const welcomeMessage = {
  role: "assistant",
  text: "Szia! 👋 Az Aivora üzleti asszisztense vagyok. Miben segíthetek ma?",
};

const suggestions = [
  ["💡", "Üzleti ötletek", "Adj 5 megvalósítható üzleti ötletet kezdő vállalkozóknak."],
  ["📣", "Marketingterv", "Készíts egy 30 napos marketingtervet a vállalkozásomhoz."],
  ["👥", "Ügyfélszerzés", "Hogyan szerezzem meg az első 10 ügyfelemet?"],
  ["📈", "Vállalkozásfejlesztés", "Adj gyakorlati ötleteket a vállalkozásom fejlesztésére."],
];

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState("free");
  const [dailyLimit, setDailyLimit] = useState(10);
  const [usedToday, setUsedToday] = useState(null);
  const [remaining, setRemaining] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([welcomeMessage]);

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const { data, error: authError } = await supabase.auth.getUser();

        if (!active) return;

        if (authError || !data.user) {
          router.replace("/login");
          return;
        }

        setUser(data.user);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (token) {
          try {
            const response = await fetch("/api/subscription", {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
              throw new Error("Csomagadatok lekérése sikertelen.");
            }

            const subscription = await response.json();

            if (!active) return;

            setPlan(subscription.plan);
            setDailyLimit(subscription.dailyLimit);
            setUsedToday(subscription.usedToday);
            setRemaining(subscription.remaining);
          } catch (err) {
            console.error("Előfizetés lekérési hiba:", err);
          }
        }

        const { data: chats, error: chatError } = await supabase
          .from("conversations")
          .select("id, title, created_at")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false });

        if (!active) return;

        if (chatError) {
          console.error(chatError);
          setError("Nem sikerült betölteni a beszélgetéseket.");
        } else {
          setConversations(chats || []);
          if (chats?.length) setActiveId(chats[0].id);
        }
      } catch (err) {
        console.error("Dashboard betöltési hiba:", err);
        if (active) setError("Nem sikerült betölteni az oldalt.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!activeId) {
      setMessages([welcomeMessage]);
      return;
    }

    let active = true;

    async function loadMessages() {
      const { data, error: historyError } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .limit(200);

      if (!active) return;

      if (historyError) {
        console.error(historyError);
        setError("Nem sikerült betölteni az üzeneteket.");
      } else {
        setMessages(
          data?.length
            ? data.map((item) => ({
                id: item.id,
                role: item.role,
                text: item.content,
              }))
            : [welcomeMessage]
        );
      }
    }

    loadMessages();

    return () => {
      active = false;
    };
  }, [activeId]);

  async function createConversation() {
    if (!user || creating || sending) return;

    setCreating(true);
    setError("");

    try {
      const { data, error: createError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: "Új beszélgetés",
        })
        .select("id, title, created_at")
        .single();

      if (createError) throw createError;

      setConversations((previous) => [data, ...previous]);
      setActiveId(data.id);
      setMessages([welcomeMessage]);
      setMessage("");
      setMobileMenuOpen(false);
    } catch (err) {
      console.error(err);
      setError("Nem sikerült új beszélgetést létrehozni.");
    } finally {
      setCreating(false);
    }
  }

  function selectConversation(id) {
    if (sending || creating || id === activeId) return;

    setError("");
    setMessage("");
    setActiveId(id);
    setMobileMenuOpen(false);
  }

  async function sendMessage(e, directText = null) {
    e?.preventDefault?.();

    const text = (directText ?? message).trim();

    if (
      !text ||
      sending ||
      creating ||
      !user ||
      text.length > 2000
    ) {
      return;
    }

    setSending(true);
    setError("");

    let conversationId = activeId;

    try {
      if (!conversationId) {
        const { data: newChat, error: createError } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title: "Új beszélgetés",
          })
          .select("id, title, created_at")
          .single();

        if (createError) throw createError;

        conversationId = newChat.id;

        setConversations((previous) => [
          newChat,
          ...previous,
        ]);

        setActiveId(newChat.id);
        setMobileMenuOpen(false);
      }

      const { data: saved, error: saveError } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          role: "user",
          content: text,
        })
        .select("id")
        .single();

      if (saveError) throw saveError;

      setMessages((previous) => [
        ...previous.filter((item) => item.id !== "welcome"),
        {
          id: saved.id,
          role: "user",
          text,
        },
      ]);

      setMessage("");

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (
        sessionError ||
        !sessionData.session?.access_token
      ) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
        }),
      });

      const result = await response.json();

      if (typeof result.remaining === "number") {
        setRemaining(result.remaining);

        if (response.ok) {
          setUsedToday(
            Math.max(0, dailyLimit - result.remaining)
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          result.error || "Nem sikerült választ kérni."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: result.reply || "Nem érkezett válasz.",
        },
      ]);

      const current = conversations.find(
        (chat) => chat.id === conversationId
      );

      if (!current || current.title === "Új beszélgetés") {
        const newTitle = text.slice(0, 55);

        const { error: titleError } = await supabase
          .from("conversations")
          .update({ title: newTitle })
          .eq("id", conversationId)
          .eq("user_id", user.id);

        if (!titleError) {
          setConversations((previous) =>
            previous.map((chat) =>
              chat.id === conversationId
                ? { ...chat, title: newTitle }
                : chat
            )
          );
        }
      }
    } catch (err) {
      console.error("Chat hiba:", err);
      setError(
        err.message || "Ismeretlen hiba történt."
      );
    } finally {
      setSending(false);
    }
  }

  async function renameConversation(id) {
    if (!user || sending || creating) return;

    const title = editingTitle.trim();

    if (!title || title.length > 100) {
      setError("A cím 1–100 karakter hosszú lehet.");
      return;
    }

    setError("");

    const { data, error: renameError } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (renameError || !data) {
      console.error(renameError);
      setError("Nem sikerült átnevezni a beszélgetést.");
      return;
    }

    setConversations((previous) =>
      previous.map((chat) =>
        chat.id === id ? { ...chat, title } : chat
      )
    );

    setEditingId(null);
    setEditingTitle("");
  }

  async function deleteConversation(id) {
    if (!user || sending || creating) return;

    setError("");

    const { data, error: deleteError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (deleteError || !data) {
      console.error(deleteError);
      setError("Nem sikerült törölni a beszélgetést.");
      return;
    }

    const updated = conversations.filter(
      (chat) => chat.id !== id
    );

    setConversations(updated);

    if (activeId === id) {
      setActiveId(updated[0]?.id || null);
      setMessages([welcomeMessage]);
    }

    setDeletingId(null);
    setEditingId(null);
  }

  async function openBillingPortal() {
    if (openingPortal) return;

    setOpeningPortal(true);
    setError("");

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (
        sessionError ||
        !data.session?.access_token
      ) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(
          result.error ||
          "Nem sikerült megnyitni az előfizetéskezelőt."
        );
      }

      window.location.assign(result.url);
    } catch (err) {
      setError(
        err.message || "Ismeretlen hiba történt."
      );
    } finally {
      setOpeningPortal(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const currentChat = conversations.find(
    (chat) => chat.id === activeId
  );

  const usagePercent =
    usedToday === null || !dailyLimit
      ? 0
      : Math.min(
          100,
          Math.max(0, (usedToday / dailyLimit) * 100)
        );

  const showWelcome =
    messages.length === 0 ||
    (messages.length === 1 &&
      messages[0].role === "assistant");

  if (loading) {
    return (
      <main className="av-loading">
        ✦ Aivora AI betöltése...
        <style>{`
          .av-loading {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #0b0d18;
            color: white;
            font: 600 16px Arial, sans-serif;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="av-app">
      <style>{`
        .av-app {
          --av-bg: #0b0d18;
          --av-panel: #151827;
          --av-border: #303349;
          --av-text: #f4f1ff;
          --av-muted: #a1a4bc;
          --av-purple: #a681f5;
          --av-red: #ef5c78;
          min-height: 100vh;
          background:
            radial-gradient(circle at 82% 0%,
              rgba(114,68,191,.17),transparent 38%),
            radial-gradient(circle at 0% 100%,
              rgba(214,69,107,.06),transparent 35%),
            var(--av-bg);
          color: var(--av-text);
          font-family: Arial, Helvetica, sans-serif;
          padding: 22px;
          box-sizing: border-box;
        }
        .av-app * { box-sizing: border-box; }
        .av-app button,
        .av-app textarea,
        .av-app input { font: inherit; }
        .av-app button {
          cursor: pointer;
          transition: background .2s, transform .2s;
        }
        .av-app button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
        .av-app button:focus-visible,
        .av-app a:focus-visible,
        .av-app textarea:focus-visible,
        .av-app input:focus-visible {
          outline: 2px solid #bb9cff;
          outline-offset: 3px;
        }
        .av-shell { max-width: 1650px; margin: 0 auto; }
        .av-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 6px 4px 26px;
        }
        .av-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .av-brand-icon {
          width: 51px;
          height: 51px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: linear-gradient(135deg,#9568ec,#5c3a9d);
          color: white;
          font-size: 29px;
          box-shadow: 0 8px 30px #6f45c344;
        }
        .av-brand-name {
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -1.2px;
        }
        .av-brand-name span { color: var(--av-red); }
        .av-subtitle {
          margin-top: 4px;
          font-size: 12px;
          color: var(--av-muted);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .av-top-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .av-email {
          color: var(--av-muted);
          font-size: 13px;
          overflow-wrap: anywhere;
        }
        .av-logout {
          border: 1px solid #554052;
          background: #251b2b;
          color: #ffc4ce;
          padding: 11px 17px;
          border-radius: 11px;
          font-weight: 600;
        }
        .av-logout:hover { background: #382237; }
        .av-mobile-toggle {
          display: none;
          border: 1px solid var(--av-border);
          background: #202337;
          color: white;
          border-radius: 12px;
          padding: 13px;
          margin-bottom: 14px;
          font-weight: 700;
        }
        .av-layout {
          display: grid;
          grid-template-columns: 300px minmax(0,1fr);
          gap: 20px;
          align-items: stretch;
        }
        .av-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: rgba(21,24,39,.96);
          border: 1px solid var(--av-border);
          border-radius: 22px;
          padding: 19px;
          min-width: 0;
        }
        .av-plan-card {
          background: linear-gradient(145deg,#25203e,#1b2033);
          border: 1px solid #463b69;
          border-radius: 17px;
          padding: 18px;
        }
        .av-plan-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 22px;
        }
        .av-plan-head strong { font-size: 16px; }
        .av-pill {
          padding: 6px 11px;
          border-radius: 20px;
          background: #513783;
          color: #e6d8ff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .6px;
        }
          .av-muted {
          color: #ac9bbb;
          font-size: 13px;
          line-height: 1.6;
        }

        .av-count {
          font-size: 35px;
          font-weight: 800;
          margin-top: 9px;
          color: #fff;
        }

        .av-count small {
          font-size: 16px;
          font-weight: 400;
          color: #a99abc;
        }

        .av-progress {
          height: 8px;
          margin-top: 15px;
          background: #302044;
          border-radius: 20px;
          overflow: hidden;
        }

        .av-progress > div {
          height: 100%;
          border-radius: 20px;
          background: linear-gradient(90deg, #913dff, #e09cff);
          box-shadow: 0 0 18px #b14dff;
        }

        .av-remaining {
          font-size: 12px;
          color: #bca9ce;
          margin: 12px 0 0;
        }

        .av-upgrade,
        .av-portal,
        .av-new {
          display: block;
          width: 100%;
          border: 1px solid #a14bfa;
          border-radius: 14px;
          padding: 14px;
          color: #fff;
          text-align: center;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          background: linear-gradient(120deg, #7524d5, #b34bfa);
          box-shadow: 0 0 22px #8e36ed35;
        }

        .av-upgrade,
        .av-portal {
          margin-top: 19px;
        }

        .av-new:hover,
        .av-upgrade:hover,
        .av-portal:hover {
          filter: brightness(1.16);
          box-shadow: 0 0 28px #9f48fa65;
        }

        .av-list-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 3px 0;
          font-size: 13px;
          font-weight: 700;
          color: #e9d8ff;
        }

        .av-list-label span:last-child {
          color: #9b82b6;
        }

        .av-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
          overflow-y: auto;
          max-height: 460px;
        }

        .av-conversation {
          padding: 9px;
          border: 1px solid #38224f;
          border-radius: 13px;
          background: #130c21;
          min-width: 0;
        }

        .av-conversation.active {
          border-color: #a24bff;
          background: #241036;
          box-shadow: inset 3px 0 #b55aff;
        }

        .av-chat-row {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .av-chat-title {
          flex: 1;
          min-width: 0;
          padding: 9px 5px;
          border: 0;
          background: transparent;
          color: #eee2ff;
          text-align: left;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .av-icon-button {
          flex-shrink: 0;
          padding: 7px 9px;
          border: 1px solid #51316a;
          border-radius: 8px;
          background: #261537;
          color: #d6b4f4;
        }

        .av-icon-button:hover {
          background: #43215d;
        }

        .av-edit-input {
          width: 100%;
          padding: 11px;
          border: 1px solid #9852ed;
          border-radius: 9px;
          background: #0c0715;
          color: #fff;
        }

        .av-small-actions {
          display: flex;
          gap: 8px;
          margin-top: 9px;
        }

        .av-small-actions button {
          padding: 9px 11px;
          border: 1px solid #66427e;
          border-radius: 9px;
          background: #321d48;
          color: #fff;
          font-size: 12px;
        }

        .av-small-actions .av-danger {
          background: #4b1934;
          border-color: #a83d68;
          color: #ffbdd5;
        }

        .av-error {
          padding: 12px;
          border: 1px solid #b3457d;
          border-radius: 11px;
          background: #3a122d;
          color: #ffd4e6;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .av-chat {
          position: relative;
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 700px;
          overflow: hidden;
          border: 1px solid #492267;
          border-radius: 25px;
          background: linear-gradient(145deg, #11091e, #090610);
          box-shadow: 0 0 55px #7e27d018;
        }

        .av-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 23px 27px;
          border-bottom: 1px solid #38204f;
          background: #110a1d;
        }

        .av-chat-header h2 {
          margin: 0 0 9px;
          color: #fff;
          font-size: 19px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .av-online {
          color: #b99bd6;
          font-size: 12px;
        }

        .av-online::before {
          content: "";
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 8px;
          border-radius: 50%;
          background: #bc65ff;
          box-shadow: 0 0 12px #bc65ff;
        }

        .av-header-decoration {
          width: 12px;
          height: 12px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #bd5aff;
          box-shadow: 0 0 18px #b54dff;
        }

        .av-message-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
          min-height: 390px;
          max-height: 680px;
          padding: 28px;
          overflow-y: auto;
        }

        .av-empty {
          width: 100%;
          max-width: 740px;
          margin: auto;
          padding: 30px 0;
          text-align: center;
        }

        .av-empty-logo {
          display: grid;
          place-items: center;
          width: 94px;
          height: 94px;
          margin: 0 auto 25px;
          border: 1px solid #a354ff;
          border-radius: 28px;
          background: radial-gradient(circle, #512182, #170b29);
          color: #edcfff;
          font-size: 49px;
          box-shadow:
            0 0 25px #a343ff55,
            0 0 75px #872bff25;
        }

        .av-empty h2 {
          margin: 0 0 14px;
          color: #fff;
          font-size: clamp(25px, 3vw, 37px);
          letter-spacing: -1px;
        }

        .av-empty p {
          max-width: 470px;
          margin: 0 auto 30px;
          color: #b2a0c7;
          font-size: 14px;
          line-height: 1.7;
        }

        .av-suggestions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
          text-align: left;
        }

        .av-suggestion {
          min-height: 90px;
          padding: 19px;
          border: 1px solid #69318d;
          border-radius: 17px;
          background: linear-gradient(145deg, #20102f, #130a20);
          color: #f5eaff;
          font-size: 13px;
          font-weight: 700;
          text-align: left;
          box-shadow: inset 0 1px #ffffff08;
        }

        .av-suggestion:hover {
          transform: translateY(-3px);
          border-color: #bd65ff;
          background: #301546;
          box-shadow: 0 0 25px #a83fff35;
        }

        .av-suggestion span {
          margin-right: 10px;
          font-size: 21px;
        }

        .av-bubble {
          max-width: 85%;
          padding: 17px 20px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.75;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .av-bubble.user {
          align-self: flex-end;
          border: 1px solid #bc68ff;
          border-bottom-right-radius: 5px;
          background: linear-gradient(135deg, #6725b3, #421477);
          color: #fff;
          box-shadow: 0 0 20px #9b42ff25;
        }

        .av-bubble.assistant {
          align-self: flex-start;
          border: 1px solid #4a2867;
          border-bottom-left-radius: 5px;
          background: #1a0e29;
          color: #f1e8ff;
        }

        .av-thinking {
          color: #d1a2ff;
          font-size: 13px;
          animation: av-pulse 1.5s ease-in-out infinite;
        }

        @keyframes av-pulse {
          50% { opacity: .4; }
        }

        .av-compose-wrap {
          padding: 20px 25px 23px;
          border-top: 1px solid #38204f;
          background: #0e0818;
        }

        .av-compose {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          padding: 10px;
          border: 1px solid #8240b4;
          border-radius: 19px;
          background: #170d26;
          box-shadow: 0 0 20px #9d3aff16;
        }

        .av-compose:focus-within {
          border-color: #c178ff;
          box-shadow: 0 0 25px #b14cff40;
        }

        .av-compose textarea {
          flex: 1;
          min-width: 0;
          width: 100%;
          min-height: 52px;
          max-height: 180px;
          resize: vertical;
          padding: 13px 10px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #fff;
          font-size: 14px;
        }

        .av-compose textarea::placeholder {
          color: #9e87b7;
        }

        .av-send {
          width: 49px;
          height: 49px;
          flex-shrink: 0;
          border: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, #9638ef, #c66cff);
          color: #fff;
          font-size: 24px;
          font-weight: 800;
          box-shadow: 0 0 20px #a63eff65;
        }

        .av-send:hover:not(:disabled) {
          filter: brightness(1.18);
        }

        .av-footnote {
          margin-top: 12px;
          color: #89759e;
          font-size: 11px;
          text-align: center;
        }

        /* NEONLILA ALAPMEGJELENÉS */
        .av-app {
          --av-bg: #08050f;
          --av-panel: #110a1c;
          --av-border: #482463;
          --av-text: #f8efff;
          --av-muted: #ac9bbb;
          --av-purple: #ba64ff;
          --av-red: #d78cff;
          background:
            radial-gradient(circle at 85% 5%, #6924b02a, transparent 36%),
            radial-gradient(circle at 5% 90%, #a034ef12, transparent 40%),
            #08050f;
          color: #f8efff;
        }

        .av-brand-icon {
          background: linear-gradient(135deg, #ad4bff, #49138a);
          box-shadow: 0 0 26px #9f42ff65;
        }

        .av-brand-name span {
          color: #d28aff;
        }

        .av-logout {
          border-color: #6b358f;
          background: #1c0f2b;
          color: #eacfff;
        }

        .av-logout:hover {
          background: #35184c;
        }

        .av-sidebar {
          border-color: #482463;
          background: #100a1a;
          box-shadow: 0 0 35px #7f2cbb12;
        }

        .av-plan-card {
          border-color: #683595;
          background: linear-gradient(145deg, #29143e, #140c23);
        }

        .av-pill {
          background: #59238b;
          color: #f3d9ff;
        }

        /* TABLET */
        @media (max-width: 900px) {
          .av-layout {
            grid-template-columns: 260px minmax(0, 1fr);
          }

          .av-sidebar {
            padding: 14px;
          }

          .av-message-list {
            padding: 20px;
          }
        }

        /* MOBIL */
        @media (max-width: 720px) {
          .av-app {
            padding: 12px;
          }

          .av-topbar {
            padding: 7px 2px 16px;
            gap: 10px;
          }

          .av-brand {
            gap: 9px;
          }

          .av-brand-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            font-size: 24px;
          }

          .av-brand-name {
            font-size: 22px;
          }

          .av-subtitle {
            font-size: 9px;
            letter-spacing: .6px;
          }

          .av-email {
            display: none;
          }

          .av-logout {
            padding: 10px;
            font-size: 11px;
          }

          .av-mobile-toggle {
            display: block;
            width: 100%;
            margin-bottom: 13px;
            padding: 13px;
            border: 1px solid #71399b;
            border-radius: 13px;
            background: #1d0e2e;
            color: #eacfff;
            font-weight: 700;
          }

          .av-layout {
            display: block;
          }

          .av-mobile-backdrop {
            position: fixed;
            inset: 0;
            z-index: 99;
            border: 0;
            background: #05020ac9;
            backdrop-filter: blur(5px);
          }

          .av-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 100;
            display: flex;
            width: min(86vw, 340px);
            padding: 18px;
            border-radius: 0 22px 22px 0;
            overflow-y: auto;
            transform: translateX(-110%);
            visibility: hidden;
            transition: transform .28s ease, visibility .28s;
            box-shadow: 15px 0 65px #0009;
          }

          .av-sidebar.mobile-open {
            transform: translateX(0);
            visibility: visible;
          }

          .av-sidebar-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 6px;
          }

          .av-sidebar-close {
            padding: 9px 12px;
            border: 1px solid #7740a1;
            border-radius: 10px;
            background: #29133e;
            color: #fff;
          }

          .av-chat {
            min-height: calc(100dvh - 165px);
            border-radius: 18px;
          }

          .av-chat-header {
            padding: 17px;
          }

          .av-chat-header h2 {
            font-size: 17px;
          }

          .av-message-list {
            min-height: 310px;
            padding: 17px 13px;
          }

          .av-empty {
            padding: 16px 0;
          }

          .av-empty-logo {
            width: 70px;
            height: 70px;
            margin-bottom: 20px;
            border-radius: 22px;
            font-size: 37px;
          }

          .av-empty h2 {
            font-size: 24px;
          }

          .av-empty p {
            margin-bottom: 22px;
            font-size: 13px;
          }

          .av-suggestions {
            gap: 9px;
          }

          .av-suggestion {
            min-height: 82px;
            padding: 13px;
            font-size: 12px;
            line-height: 1.5;
          }

          .av-suggestion span {
            display: block;
            margin: 0 0 7px;
          }

          .av-bubble {
            max-width: 94%;
            padding: 13px 15px;
            font-size: 13px;
          }

          .av-compose-wrap {
            padding: 12px;
          }

          .av-compose {
            gap: 6px;
            padding: 7px;
          }

          .av-compose textarea {
            min-height: 48px;
            padding: 12px 8px;
            font-size: 16px;
          }

          .av-send {
            width: 45px;
            height: 45px;
          }
        }

        @media (min-width: 721px) {
          .av-mobile-backdrop,
          .av-sidebar-head {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .av-app *,
          .av-app *::before,
          .av-app *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="av-shell">
        <header className="av-topbar">
          <div className="av-brand">
            <div className="av-brand-icon">✦</div>

            <div>
              <div className="av-brand-name">
                Aivora<span>.</span> AI
              </div>

              <div className="av-subtitle">
                Your Intelligent Assistant
              </div>
            </div>
          </div>

          <div className="av-top-actions">
            <span className="av-email" title={user?.email}>
              {user?.email}
            </span>

            <button
              type="button"
              className="av-logout"
              onClick={logout}
            >
              Kijelentkezés ↗
            </button>
          </div>
        </header>

        <button
          type="button"
          className="av-mobile-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="av-sidebar"
        >
          ☰ Beszélgetések
        </button>

        {mobileMenuOpen && (
          <button
            type="button"
            className="av-mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Mobilmenü bezárása"
          />
        )}

        <div className="av-layout">
          <aside
            id="av-sidebar"
            className={`av-sidebar ${
              mobileMenuOpen ? "mobile-open" : ""
            }`}
          >
            <div className="av-sidebar-head">
              <strong>✦ Aivora AI</strong>

              <button
                type="button"
                className="av-sidebar-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Menü bezárása"
              >
                ✕
              </button>
            </div>

            <div className="av-plan-card">
              <div className="av-plan-head">
                <strong>✦ Aivora AI</strong>

                <span className="av-pill">
                  {plan === "pro" ? "PRO" : "FREE"}
                </span>
              </div>

              <div className="av-muted">
                Mai AI-kérések
              </div>

              <div className="av-count">
                {usedToday === null ? "…" : usedToday}
                <small> / {dailyLimit}</small>
              </div>

              <div
                className="av-progress"
                role="progressbar"
                aria-label="Mai AI-kérések"
                aria-valuenow={usedToday ?? 0}
                aria-valuemin={0}
                aria-valuemax={dailyLimit}
              >
                <div style={{ width: `${usagePercent}%` }} />
              </div>

              <p className="av-remaining">
                {remaining === null
                  ? "Keret betöltése..."
                  : `Még ${remaining} AI-kérésed maradt ma.`}
              </p>

              {plan !== "pro" ? (
                <a className="av-upgrade" href="/pricing">
                  ✦ Pro-ra váltás – 2 990 Ft/hó
                </a>
              ) : (
                <button
                  type="button"
                  className="av-portal"
                  onClick={openBillingPortal}
                  disabled={openingPortal}
                >
                  {openingPortal
                    ? "Megnyitás..."
                    : "Előfizetés kezelése"}
                </button>
              )}
            </div>

            <button
              type="button"
              className="av-new"
              onClick={createConversation}
              disabled={creating || sending}
            >
              {creating
                ? "Létrehozás..."
                : "+ Új beszélgetés"}
            </button>

            <div className="av-list-label">
              <span>Beszélgetések</span>
              <span>{conversations.length}</span>
            </div>

            {error && (
              <div className="av-error" role="alert">
                {error}
              </div>
            )}

            {conversations.length === 0 && (
              <p className="av-muted">
                Még nincs beszélgetésed.
              </p>
            )}

            <div className="av-list">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  className={`av-conversation ${
                    activeId === chat.id ? "active" : ""
                  }`}
                >
                  {editingId === chat.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        renameConversation(chat.id);
                      }}
                    >
                      <input
                        className="av-edit-input"
                        value={editingTitle}
                        maxLength={100}
                        onChange={(e) =>
                          setEditingTitle(e.target.value)
                        }
                        autoFocus
                      />

                      <div className="av-small-actions">
                        <button type="submit">
                          Mentés
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                        >
                          Mégse
                        </button>
                      </div>
                    </form>
                  ) : deletingId === chat.id ? (
                    <div>
                      <p className="av-muted">
                        Biztosan törlöd? Az üzenetek
                        is törlődnek!
                      </p>

                      <div className="av-small-actions">
                        <button
                          type="button"
                          className="av-danger"
                          onClick={() =>
                            deleteConversation(chat.id)
                          }
                        >
                          Igen, törlés
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                        >
                          Mégse
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="av-chat-row">
                      <button
                        type="button"
                        className="av-chat-title"
                        onClick={() =>
                          selectConversation(chat.id)
                        }
                        disabled={sending || creating}
                      >
                        ◇ {chat.title}
                      </button>

                      <button
                        type="button"
                        className="av-icon-button"
                        title="Átnevezés"
                        aria-label="Beszélgetés átnevezése"
                        disabled={sending || creating}
                        onClick={() => {
                          setEditingId(chat.id);
                          setEditingTitle(chat.title);
                          setDeletingId(null);
                        }}
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        className="av-icon-button"
                        title="Törlés"
                        aria-label="Beszélgetés törlése"
                        disabled={sending || creating}
                        onClick={() => {
                          setDeletingId(chat.id);
                          setEditingId(null);
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          <section className="av-chat">
            <div className="av-chat-header">
              <div>
                <h2>
                  {currentChat?.title || "Új beszélgetés"}
                </h2>

                <div className="av-online">
                  Aivora AI · Üzleti asszisztens
                </div>
              </div>

              <div
                className="av-header-decoration"
                aria-hidden="true"
              />
            </div>

            <div
              className="av-message-list"
              role="log"
              aria-label="AI beszélgetés"
            >
              {showWelcome && (
                <div className="av-empty">
                  <div className="av-empty-logo">✦</div>

                  <h2>Miben segíthetek ma?</h2>

                  <p>
                    Váltsd az ötleteidet valódi
                    eredményekké az Aivora AI
                    segítségével.
                  </p>

                  <div className="av-suggestions">
                    {suggestions.map(
                      ([symbol, title, prompt]) => (
                        <button
                          key={title}
                          type="button"
                          className="av-suggestion"
                          disabled={sending || creating}
                          onClick={() =>
                            sendMessage(null, prompt)
                          }
                        >
                          <span>{symbol}</span>
                          {title}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {messages
                .filter(
                  (item) =>
                    !(
                      messages.length === 1 &&
                      item.role === "assistant"
                    )
                )
                .map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`av-bubble ${
                      item.role === "user"
                        ? "user"
                        : "assistant"
                    }`}
                  >
                    {item.text}
                  </div>
                ))}

              {sending && (
                <div className="av-thinking">
                  ✦ Aivora gondolkodik...
                </div>
              )}
            </div>

            <div className="av-compose-wrap">
              <form
                className="av-compose"
                onSubmit={sendMessage}
              >
                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Kérdezz bármit az Aivorától..."
                  maxLength={2000}
                  rows={2}
                  disabled={sending || creating}
                  aria-label="Üzenet szövege"
                />

                <button
                  type="submit"
                  className="av-send"
                  title="Üzenet küldése"
                  aria-label="Üzenet küldése"
                  disabled={
                    sending ||
                    creating ||
                    !message.trim()
                  }
                >
                  {sending ? "…" : "↑"}
                </button>
              </form>

              {error && (
                <div
                  className="av-error"
                  role="alert"
                  style={{ marginTop: 12 }}
                >
                  {error}
                </div>
              )}

              <div className="av-footnote">
                Aivora AI · A válaszokat ellenőrizd
                fontos üzleti döntések előtt.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
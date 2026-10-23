"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const welcomeMessage = {
  role: "assistant",
  text: "Szia! 👋 Az Aivora üzleti asszisztense vagyok. Miben segíthetek ma?"
};

const suggestions = [
  ["💡", "Üzleti ötletek", "Adj 5 megvalósítható üzleti ötletet kezdő vállalkozóknak."],
  ["📣", "Marketingterv", "Készíts egy 30 napos marketingtervet a vállalkozásomhoz."],
  ["👥", "Ügyfélszerzés", "Hogyan szerezzem meg az első 10 ügyfelemet?"],
  ["📈", "Vállalkozásfejlesztés", "Adj gyakorlati ötleteket a vállalkozásom fejlesztésére."]
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
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (!active) return;

        if (authError || !data.user) {
          router.replace("/login");
          return;
        }

        setUser(data.user);

        const { data: sessionData } =
          await supabase.auth.getSession();

        const token = sessionData.session?.access_token;

        if (token) {
          try {
            const response = await fetch("/api/subscription", {
              headers: {
                Authorization: `Bearer ${token}`
              }
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

        const { data: chats, error: chatError } =
          await supabase
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

          if (chats?.length) {
            setActiveId(chats[0].id);
          }
        }
      } catch (err) {
        console.error("Dashboard betöltési hiba:", err);
        if (active) {
          setError("Nem sikerült betölteni az oldalt.");
        }
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
      const { data, error: historyError } =
        await supabase
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
                text: item.content
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
      const { data, error: createError } =
        await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title: "Új beszélgetés"
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

    if (!activeId) {
      setError("Először hozz létre egy új beszélgetést.");
      return;
    }

    const conversationId = activeId;

    setSending(true);
    setError("");

    try {
      const { data: saved, error: saveError } =
        await supabase
          .from("chat_messages")
          .insert({
            user_id: user.id,
            conversation_id: conversationId,
            role: "user",
            content: text
          })
          .select("id")
          .single();

      if (saveError) throw saveError;

      setMessages((previous) => [
        ...previous.filter((item) => item.id !== "welcome"),
        {
          id: saved.id,
          role: "user",
          text
        }
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
          Authorization:
            `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId
        })
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
          text: result.reply || "Nem érkezett válasz."
        }
      ]);

      const current = conversations.find(
        (chat) => chat.id === conversationId
      );

      if (current?.title === "Új beszélgetés") {
        const newTitle = text.slice(0, 55);

        const { error: titleError } =
          await supabase
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

    const { data, error: renameError } =
      await supabase
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

    const { data, error: deleteError } =
      await supabase
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

      const response = await fetch(
        "/api/billing/portal",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${data.session.access_token}`
          }
        }
      );

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
    (
      messages.length === 1 &&
      messages[0].role === "assistant"
    );

  if (loading) {
    return (
      <main className="av-loading">
        <span>✦ Aivora AI betöltése...</span>
        <style>{`
          .av-loading {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #0b0d18;
            color: #ffffff;
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
          --av-panel-light: #1c2032;
          --av-border: #303349;
          --av-text: #f4f1ff;
          --av-muted: #a1a4bc;
          --av-purple: #a681f5;
          --av-red: #ef5c78;
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 82% 0%,
              rgba(114, 68, 191, .17),
              transparent 38%
            ),
            radial-gradient(
              circle at 0% 100%,
              rgba(214, 69, 107, .06),
              transparent 35%
            ),
            var(--av-bg);
          color: var(--av-text);
          font-family: Arial, Helvetica, sans-serif;
          padding: 22px;
          box-sizing: border-box;
        }

        .av-app * {
          box-sizing: border-box;
        }

        .av-app button,
        .av-app textarea,
        .av-app input {
          font: inherit;
        }

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

        .av-shell {
          max-width: 1650px;
          margin: 0 auto;
        }

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
          background: linear-gradient(
            135deg,
            #9568ec,
            #5c3a9d
          );
          color: white;
          font-size: 29px;
          box-shadow: 0 8px 30px #6f45c344;
        }

        .av-brand-name {
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -1.2px;
        }

        .av-brand-name span {
          color: var(--av-red);
        }

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

        .av-logout:hover {
          background: #382237;
        }

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
          grid-template-columns:
            300px minmax(0, 1fr);
          gap: 20px;
          align-items: stretch;
        }

        .av-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: rgba(21, 24, 39, .96);
          border: 1px solid var(--av-border);
          border-radius: 22px;
          padding: 19px;
          min-width: 0;
        }

        .av-plan-card {
          background: linear-gradient(
            145deg,
            #25203e,
            #1b2033
          );
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

        .av-plan-head strong {
          font-size: 16px;
        }

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
          color: var(--av-muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .av-count {
          font-size: 34px;
          font-weight: 800;
          margin-top: 7px;
        }

        .av-count small {
          font-size: 17px;
          color: #a9a6bf;
          font-weight: 500;
        }

        .av-progress {
          height: 8px;
          background: #3a3551;
          border-radius: 20px;
          overflow: hidden;
          margin-top: 13px;
        }

        .av-progress > div {
          height: 100%;
          border-radius: 20px;
          background: linear-gradient(
            90deg,
            #8963eb,
            #e06398
          );
          transition: width .3s ease;
        }

        .av-remaining {
          font-size: 12px;
          color: #c0bdd2;
          margin: 12px 0 0;
        }

        .av-upgrade,
        .av-portal {
          display: block;
          width: 100%;
          margin-top: 20px;
          padding: 13px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(
            120deg,
            #8156df,
            #a45cd5
          );
          color: white;
          text-align: center;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .av-new {
          width: 100%;
          border: 1px solid #8b67d7;
          border-radius: 13px;
          padding: 15px;
          color: white;
          background: linear-gradient(
            135deg,
            #7550d1,
            #543597
          );
          font-weight: 700;
        }

        .av-new:hover {
          background: #8259dc;
        }

        .av-list-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #e5e0f8;
          font-size: 13px;
          font-weight: 700;
          padding: 9px 3px 0;
        }

        .av-list-label span:last-child {
          color: #a5a0bc;
          font-size: 12px;
        }

        .av-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          max-height: 480px;
        }

        .av-conversation {
          border: 1px solid #303349;
          background: #1c2030;
          border-radius: 12px;
          padding: 9px;
          min-width: 0;
        }

        .av-conversation.active {
          border-color: #8264c7;
          background: #29233e;
          box-shadow: inset 3px 0 #d55e87;
        }

        .av-chat-row {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .av-chat-title {
          flex: 1;
          min-width: 0;
          text-align: left;
          border: 0;
          background: transparent;
          color: #e6e3f6;
          font-size: 13px;
          padding: 7px 4px;
          overflow-wrap: anywhere;
        }

        .av-icon-button {
          flex-shrink: 0;
          border: 0;
          border-radius: 7px;
          background: #32344a;
          color: #c5c2d8;
          padding: 6px 8px;
          font-size: 14px;
        }

        .av-icon-button:hover {
          background: #48445f;
        }

        .av-edit-input {
          width: 100%;
          background: #111526;
          color: white;
          border: 1px solid #8767c7;
          border-radius: 8px;
          padding: 10px;
        }

        .av-small-actions {
          display: flex;
          gap: 8px;
          margin-top: 9px;
        }

        .av-small-actions button {
          border: 1px solid #4d4b68;
          background: #34314d;
          color: white;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 12px;
        }

        .av-small-actions .av-danger {
          background: #4b2534;
          border-color: #8f3c53;
          color: #ffb7c5;
        }

        .av-error {
          padding: 12px;
          border: 1px solid #9a405a;
          background: #421e30;
          color: #ffd2da;
          border-radius: 10px;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .av-chat {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 690px;
          background: rgba(21, 24, 39, .96);
          border: 1px solid var(--av-border);
          border-radius: 22px;
          overflow: hidden;
        }

        .av-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 23px 26px;
          border-bottom: 1px solid var(--av-border);
          gap: 14px;
        }

        .av-chat-header h2 {
          margin: 0 0 9px;
          font-size: 19px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .av-online {
          color: #b6a2ec;
          font-size: 12px;
        }

        .av-online::before {
          content: "";
          display: inline-block;
          width: 7px;
          height: 7px;
          margin-right: 8px;
          border-radius: 50%;
          background: #ad87f1;
        }

        .av-header-decoration {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ee5b76;
          box-shadow: 0 0 17px #ee5b7655;
          flex-shrink: 0;
        }

        .av-message-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          flex: 1;
          min-height: 390px;
          max-height: 680px;
          overflow-y: auto;
          padding: 26px;
        }

        .av-empty {
          width: 100%;
          max-width: 700px;
          margin: auto;
          padding: 35px 0;
          text-align: center;
        }

        .av-empty-logo {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          margin: 0 auto 22px;
          border: 1px solid #654a9d;
          border-radius: 23px;
          background: linear-gradient(
            145deg,
            #42326c,
            #251e41
          );
          color: #d4bdff;
          font-size: 42px;
          box-shadow: 0 10px 45px #6c46b82c;
        }

        .av-empty h2 {
          font-size: clamp(23px, 3vw, 32px);
          letter-spacing: -1px;
          margin: 0 0 12px;
        }

        .av-empty p {
          color: #a7a9c1;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 auto 30px;
          max-width: 470px;
        }

        .av-suggestions {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 12px;
          text-align: left;
        }

        .av-suggestion {
          border: 1px solid #3c3b57;
          background: #222538;
          border-radius: 14px;
          padding: 18px;
          color: #ebe7f9;
          font-weight: 600;
          font-size: 13px;
          text-align: left;
        }

        .av-suggestion:hover {
          border-color: #a079ee;
          background: #2c2947;
          transform: translateY(-2px);
        }

        .av-suggestion span {
          margin-right: 9px;
          font-size: 18px;
        }

        .av-bubble {
          max-width: 85%;
          padding: 16px 19px;
          border-radius: 16px;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          font-size: 14px;
        }

        .av-bubble.user {
          align-self: flex-end;
          background: linear-gradient(
            120deg,
            #6849b6,
            #50348f
          );
          border: 1px solid #8a64d0;
          border-bottom-right-radius: 5px;
          color: white;
        }

        .av-bubble.assistant {
          align-self: flex-start;
          background: #202438;
          border: 1px solid #343850;
          border-bottom-left-radius: 5px;
          color: #f1f0fb;
        }

        .av-thinking {
          color: #b7a3eb;
          font-size: 13px;
        }

        .av-compose-wrap {
          padding: 18px 25px 24px;
          border-top: 1px solid var(--av-border);
        }

        .av-compose {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          background: #1c2032;
          border: 1px solid #3d3b59;
          border-radius: 17px;
          padding: 10px;
        }

        .av-compose:focus-within {
          border-color: #9b77f0;
        }

        .av-compose textarea {
          flex: 1;
          min-width: 0;
          width: 100%;
          resize: vertical;
          min-height: 52px;
          max-height: 180px;
          border: 0;
          outline: 0;
          background: transparent;
          color: white;
          padding: 13px 10px;
          font-size: 14px;
        }

        .av-compose textarea::placeholder {
          color: #8c91ab;
        }

        .av-send {
          width: 49px;
          height: 49px;
          flex-shrink: 0;
          border: 0;
          border-radius: 13px;
          color: white;
          background: linear-gradient(
            135deg,
            #9972f1,
            #d55b91
          );
          font-size: 23px;
          font-weight: 800;
        }

        .av-footnote {
          font-size: 11px;
          color: #8589a4;
          text-align: center;
          margin-top: 11px;
        }

        @media (max-width: 900px) {
          .av-layout {
            grid-template-columns:
              260px minmax(0, 1fr);
          }

          .av-sidebar {
            padding: 14px;
          }

          .av-message-list {
            padding: 20px;
          }
        }

        @media (max-width: 720px) {
          .av-app {
            padding: 12px;
          }

          .av-topbar {
            padding: 8px 3px 17px;
          }

          .av-brand-name {
            font-size: 23px;
          }

          .av-email {
            display: none;
          }

          .av-mobile-toggle {
            display: block;
            width: 100%;
          }

          .av-layout {
            display: block;
          }

          .av-sidebar {
            display: none;
            margin-bottom: 14px;
          }

          .av-sidebar.mobile-open {
            display: flex;
          }

          .av-chat {
            min-height: calc(100vh - 190px);
          }

          .av-chat-header {
            padding: 18px;
          }

          .av-message-list {
            padding: 18px 14px;
            min-height: 300px;
          }

          .av-compose-wrap {
            padding: 12px;
          }

          .av-suggestions {
            gap: 8px;
          }

          .av-suggestion {
            padding: 12px;
            font-size: 12px;
          }

          .av-bubble {
            max-width: 94%;
          }
        }
      `}</style>

      <div className="av-shell">
        <header className="av-topbar">
          <div className="av-brand">
            <div className="av-brand-icon">
              ✦
            </div>

            <div>
              <div className="av-brand-name">
                Aivora<span>.</span> AI
              </div>

              <div className="av-subtitle">
                Business Assistant
              </div>
            </div>
          </div>

          <div className="av-top-actions">
            <span
              className="av-email"
              title={user?.email}
            >
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
          onClick={() =>
            setMobileMenuOpen((open) => !open)
          }
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen
            ? "✕ Menü bezárása"
            : "☰ Beszélgetések"}
        </button>

        <div className="av-layout">
          <aside
            className={`av-sidebar ${
              mobileMenuOpen ? "mobile-open" : ""
            }`}
          >
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
                {usedToday === null
                  ? "…"
                  : usedToday}

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
                <div
                  style={{
                    width: `${usagePercent}%`
                  }}
                />
              </div>

              <p className="av-remaining">
                {remaining === null
                  ? "Keret betöltése..."
                  : `Még ${remaining} AI-kérésed maradt ma.`}
              </p>

              {plan !== "pro" ? (
                <a
                  className="av-upgrade"
                  href="/pricing"
                >
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
              <div
                className="av-error"
                role="alert"
              >
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
                    activeId === chat.id
                      ? "active"
                      : ""
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
                          setEditingTitle(
                            e.target.value
                          )
                        }
                        autoFocus
                      />

                      <div className="av-small-actions">
                        <button type="submit">
                          Mentés
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingId(null)
                          }
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
                            deleteConversation(
                              chat.id
                            )
                          }
                        >
                          Igen, törlés
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeletingId(null)
                          }
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
                          selectConversation(
                            chat.id
                          )
                        }
                        disabled={
                          sending || creating
                        }
                      >
                        ◇ {chat.title}
                      </button>

                      <button
                        type="button"
                        className="av-icon-button"
                        title="Átnevezés"
                        aria-label="Beszélgetés átnevezése"
                        disabled={
                          sending || creating
                        }
                        onClick={() => {
                          setEditingId(chat.id);
                          setEditingTitle(
                            chat.title
                          );
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
                        disabled={
                          sending || creating
                        }
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
                  {currentChat?.title ||
                    "Új beszélgetés"}
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
                  <div className="av-empty-logo">
                    ✦
                  </div>

                  <h2>
                    Miben segíthetek ma?
                  </h2>

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
                          disabled={
                            sending ||
                            creating ||
                            !activeId
                          }
                          onClick={() =>
                            sendMessage(
                              null,
                              prompt
                            )
                          }
                        >
                          <span>
                            {symbol}
                          </span>

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
                  placeholder="Írd ide a kérdésed..."
                  maxLength={2000}
                  rows={2}
                  disabled={
                    sending || !activeId
                  }
                  aria-label="Üzenet szövege"
                />

                <button
                  type="submit"
                  className="av-send"
                  title="Üzenet küldése"
                  aria-label="Üzenet küldése"
                  disabled={
                    sending ||
                    !activeId ||
                    !message.trim()
                  }
                >
                  {sending ? "…" : "↑"}
                </button>
              </form>

              <div className="av-footnote">
                Aivora AI · A válaszok ellenőrzése
                fontos üzleti döntések előtt.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
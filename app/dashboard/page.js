"use client";

import "../warm-minimal.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const welcomeMessage = {
  role: "assistant",
  text: "Szia! 👋 A Aivora üzleti asszisztense vagyok. Miben segíthetek ma?"
};

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(null);
  const [plan, setPlan] = useState("free");
const [dailyLimit, setDailyLimit] = useState(10);
const [usedToday, setUsedToday] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [editingId, setEditingId] = useState(null);
const [editingTitle, setEditingTitle] = useState("");
const [deletingId, setDeletingId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([welcomeMessage]);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
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

const accessToken =
  sessionData.session?.access_token;

if (accessToken) {
  try {
    const response = await fetch("/api/subscription", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Nem sikerült lekérni a csomagadatokat.");
    }

    const subscription = await response.json();

    if (!active) return;

    setPlan(subscription.plan);
    setDailyLimit(subscription.dailyLimit);
    setUsedToday(subscription.usedToday);
    setRemaining(subscription.remaining);
  } catch (error) {
    console.error("Csomagadatok betöltési hibája:", error);
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
        console.error("Beszélgetéslista hiba:", chatError);
        setError("Nem sikerült betölteni a beszélgetéseket.");
      } else {
        setConversations(chats || []);

        if (chats?.length) {
          setActiveId(chats[0].id);
        }
      }

      setLoading(false);
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
        console.error("Üzenetbetöltési hiba:", historyError);
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
    } catch (err) {
      console.error("Beszélgetés létrehozási hiba:", err);
      setError("Nem sikerült új beszélgetést létrehozni.");
    } finally {
      setCreating(false);
    }
  }

  async function selectConversation(id) {
    if (sending || creating || id === activeId) return;

    setError("");
    setMessage("");
    setActiveId(id);
  }

  async function sendMessage(e, directText = null) {
  e?.preventDefault?.();

  const text = (directText ?? message).trim();

    if (!text || sending || creating || !user ||
        text.length > 2000) return;

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
        { id: saved.id, role: "user", text }
      ]);

      setMessage("");

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session?.access_token) {
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

      // Az első üzenetből beszélgetéscím készítése
      const current = conversations.find(
        (chat) => chat.id === conversationId
      );

      if (current?.title === "Új beszélgetés") {
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
      setError(err.message || "Ismeretlen hiba történt.");
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
    console.error("Átnevezési hiba:", renameError);
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
    console.error("Törlési hiba:", deleteError);
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
  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const buttonStyle = {
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold"
  };

  if (loading) {
    return (
      <main style={{
        minHeight: "100vh",
        background: "#0b1120",
        color: "white",
        padding: 40
      }}>
        Fiók ellenőrzése...
      </main>
    );
  }

  return (
    <main className="warm-dashboard" style={{
      minHeight: "100vh",
      background: "#F6F3EE",
      color: "#292524",
      fontFamily: "Arial, sans-serif",
      padding: 16
    }}>
      <div
  style={{
    maxWidth: 1800,
    width: "100%",
    margin: "0 auto"
  }}
>
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24
        }}>
          <div>
            <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 14
  }}
>
  <div
    style={{
      width: 48,
      height: 48,
      background: "#292524",
      color: "#ffffff",
      borderRadius: 15,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 26
    }}
  >
    ✦
  </div>

  <h1
    style={{
      color: "#292524",
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: "-1px",
      margin: 0
    }}
  >
    Aivora
  </h1>
</div>
            <p style={{ color: "#94a3b8" }}>
              Business Assistant
            </p>
          </div>

          <button
            onClick={logout}
            style={{ ...buttonStyle, background: "#dc2626" }}
          >
            Kijelentkezés
          </button>
        </header>
<button
  type="button"
  className="aivora-mobile-menu-button"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  aria-expanded={mobileMenuOpen}
>
  {mobileMenuOpen ? "✕ Menü bezárása" : "☰ Beszélgetések"}
</button>
        <p style={{ color: "#cbd5e1" }}>
          Bejelentkezve: {user?.email}
        </p>

        <div
  style={{
    display: "grid",
    gridTemplateColumns: "minmax(0, 300px) minmax(0, 1fr)",
    gap: 20,
    marginTop: 20,
    alignItems: "stretch"
  }}
>
          <aside
          className={`aivora-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}
 
  style={{
    background: "#EAE5DC",
    padding: 20,
    borderRadius: 16,
    width: 300,
    flexShrink: 0,
    boxSizing: "border-box"
  }}
>
  <div
  style={{
    background: "#ffffff",
    border: "1px solid #e7dfd2",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12
    }}
  >
    <strong>Aivora AI</strong>
    <span
      style={{
        background: "#f0e9db",
        padding: "5px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600
      }}
    >
      {plan === "pro" ? "Pro" : "Free"}
    </span>
  </div>

  <div style={{ fontSize: 13, color: "#777" }}>
    Mai AI-kérések
  </div>

  <div style={{ marginTop: 6, fontWeight: 700 }}>
    {usedToday === null
      ? "Betöltés..."
      : `${usedToday} / ${dailyLimit}`}
  </div>

  <div
    style={{
      height: 7,
      background: "#eee8de",
      borderRadius: 20,
      overflow: "hidden",
      marginTop: 10
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${
          usedToday === null
            ? 0
            : Math.min(100, (usedToday / dailyLimit) * 100)
        }%`,
        background: "#8c785d",
        borderRadius: 20
      }}
    />
  </div>

  <div
    style={{
      fontSize: 12,
      color: "#777",
      marginTop: 10
    }}
  >
    {remaining === null
      ? "Keret betöltése..."
      : `Még ${remaining} AI-kérésed maradt ma.`}
  </div>
  {plan !== "pro" && (
  <a
    href="/pricing"
    style={{
      display: "block",
      marginTop: 16,
      padding: "12px",
      background: "#78634b",
      color: "#ffffff",
      borderRadius: 10,
      textAlign: "center",
      textDecoration: "none",
      fontWeight: 600,
      fontSize: 13,
    }}
  >
    Pro-ra váltás – 2 990 Ft/hó
  </a>
)}
</div>
            <button
              onClick={createConversation}
              disabled={creating || sending}
              style={{
                ...buttonStyle,
                width: "100%",
                background: "#292524"
              }}
            >
              {creating ? "Létrehozás..." : "+ Új beszélgetés"}
            </button>

            <h3 style={{ marginTop: 25 }}>
              Beszélgetések
            </h3>

            {conversations.length === 0 && (
              <p style={{ color: "#94a3b8" }}>
                Még nincs beszélgetésed.
              </p>
            )}

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
            

            {error && (
              <p role="alert" style={{ color: "#fca5a5" }}>
                {error}
              </p>
            )}
{conversations.map((chat) => (
  <div
    key={chat.id}
    style={{
      padding: 10,
      borderRadius: 10,
      background: activeId === chat.id
  ? "#E8E2D9"
  : "#FFFFFF",
border: activeId === chat.id
  ? "2px solid #A8A29E"
  : "1px solid #DDD6CC",
color: "#292524",
marginBottom: 8
    }}
  >
    {editingId === chat.id ? (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          renameConversation(chat.id);
        }}
      >
        <input
          value={editingTitle}
          onChange={(e) =>
            setEditingTitle(e.target.value)
          }
          maxLength={100}
          autoFocus
          style={{
            width: "100%",
            padding: 9,
            boxSizing: "border-box",
            borderRadius: 7,
            border: "1px solid #64748b",
            background: "#1e293b",
            color: "white"
          }}
        />

        <div style={{
          display: "flex",
          gap: 8,
          marginTop: 8
        }}>
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
        <p style={{ fontSize: 13 }}>
          Biztosan törlöd? Az üzenetek is törlődnek!
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => deleteConversation(chat.id)}
            style={{ color: "#dc2626" }}
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
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <button
          type="button"
          onClick={() => selectConversation(chat.id)}
          disabled={sending || creating}
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: "left",
            background: "transparent",
            border: "none",
            color: "#292524",
            cursor: "pointer",
            overflowWrap: "anywhere"
          }}
        >
          {chat.title}
        </button>

        <button
          type="button"
          title="Átnevezés"
          disabled={sending || creating}
          onClick={() => {
            setEditingId(chat.id);
            setEditingTitle(chat.title);
            setDeletingId(null);
          }}
        >
          ✏️
        </button>

        <button
          type="button"
          title="Törlés"
          disabled={sending || creating}
          onClick={() => {
            setDeletingId(chat.id);
            setEditingId(null);
          }}
        >
          🗑️
        </button>
      </div>
    )}
  </div>
))}
  </div>
        </aside>

        <section 
          className="aivora-chat"
  style={{
          background: "#1e293b",
          padding: 20,
          borderRadius: 16,
          minWidth: 0
        }}>
          <h2>
            {conversations.find(
              (chat) => chat.id === activeId
            )?.title || "Új beszélgetés"}
          </h2>

          <p style={{ color: "#93c5fd" }}>
            Aivora AI • Üzleti asszisztens
</p>
          <div
            role="log"
            aria-label="AI beszélgetés"
            style={{
              minHeight: 280,
              maxHeight: 650,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: "20px 0"
            }}
          >
          {(
  messages.length === 0 ||
  (
    messages.length === 1 &&
    messages[0].role === "assistant"
  )
) && (
  <div
    style={{
      textAlign: "center",
      padding: "55px 20px",
      maxWidth: 650,
      margin: "0 auto"
    }}
  >
    <div style={{ fontSize: 38, marginBottom: 14 }}>
      ✦
    </div>

    <h2
      style={{
        fontSize: 30,
        fontWeight: 700,
        color: "#292524",
        marginBottom: 12
      }}
    >
      Miben segíthetek ma?
    </h2>

    <p
      style={{
        color: "#78716c",
        fontSize: 15,
        marginBottom: 30
      }}
    >
      Tervezd meg és fejleszd a vállalkozásodat
      az Aivorával.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(2, minmax(0, 1fr))",
        gap: 12,
        textAlign: "left"
      }}
    >
     {[
  [
    "💡",
    "Üzleti ötletek",
    "Adj 5 megvalósítható üzleti ötletet kezdő vállalkozóknak."
  ],
  [
    "📣",
    "Marketingterv",
    "Készíts egy 30 napos marketingtervet a vállalkozásomhoz."
  ],
  [
    "👥",
    "Ügyfélszerzés",
    "Hogyan szerezzem meg az első 10 ügyfelemet?"
  ],
  [
    "📈",
    "Vállalkozásfejlesztés",
    "Adj gyakorlati ötleteket a vállalkozásom fejlesztésére."
  ]
].map(([emoji, title, prompt]) => (
  <button
    key={title}
    type="button"
    onClick={() => sendMessage(null, prompt)}
    style={{
      background: "#ffffff",
      border: "1px solid #e8e4de",
      borderRadius: 14,
      padding: 18,
      color: "#292524",
      fontWeight: 600,
      fontSize: 14,
      textAlign: "left",
      cursor: "pointer",
      fontFamily: "inherit",
      transition: "all 0.2s ease"
    }}
  >
    <span style={{ marginRight: 8 }}>
      {emoji}
    </span>
    {title}
  </button>
))}
       
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
                style={{
                  alignSelf: item.role === "user"
                    ? "flex-end"
                    : "flex-start",
                  padding: 14,
                  borderRadius: 12,
                  background: item.role === "user"
                    ? "#E8E2D9"
                    : "#FFFFFF",
                    color: "#292524",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere"
                }}
              >
                {item.text}
              </div>
            ))}

            {sending && <p>Aivora gondolkodik...</p>}
          </div>
            <form
  onSubmit={sendMessage}
 style={{
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: 8,
  background: "#ffffff",
  border: "1px solid #e5e1da",
  borderRadius: 20,
  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
  boxSizing: "border-box"
}}
>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Írd ide a kérdésed..."
                maxLength={2000}
                rows={2}
                disabled={sending || !activeId}
                style={{
                 flex: 1,
minWidth: 0,
width: "auto",
                  padding: 14,
                  borderRadius: 10,
                  border: "1px solid #475569",
                  background: "#0f172a",
                  color: "white",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
              />

            <button
  type="submit"
  disabled={sending || !activeId || !message.trim()}
  title="Üzenet küldése"
  aria-label="Üzenet küldése"
  style={{
    width: 46,
    height: 46,
    minWidth: 46,
    flexShrink: 0,
    border: "none",
    borderRadius: 14,
    background: "#292524",
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    cursor: sending ? "wait" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0
  }}
>
  {sending ? "…" : "↑"}
</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
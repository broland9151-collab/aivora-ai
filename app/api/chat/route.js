import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const DEMO_MODE = process.env.DEMO_MODE === "true";

export async function GET() {
  return Response.json({
    success: true,
    message: "Aivora AI szerver működik!"
  });
}

export async function POST(request) {
  try {
    // 1. Bejelentkezés ellenőrzése
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Bejelentkezés szükséges." },
        { status: 401 }
      );
    }

    const token = authorization.slice(7);

    // Vercel környezeti változók
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // JAVÍTVA: a Vercelben használt változónév
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const openaiKey = process.env.OPENAI_API_KEY;

    if (!url || !publicKey || !secretKey) {
      console.error("Hiányzó Supabase beállítás:", {
        urlMissing: !url,
        publicKeyMissing: !publicKey,
        secretKeyMissing: !secretKey
      });

      return Response.json(
        { error: "Szerverbeállítási hiba." },
        { status: 500 }
      );
    }

    const authClient = createClient(url, publicKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data, error: authError } =
      await authClient.auth.getUser(token);

    if (authError || !data.user) {
      return Response.json(
        { error: "Érvénytelen bejelentkezés." },
        { status: 401 }
      );
    }

    const userId = data.user.id;

    // 2. Üzenet ellenőrzése
    const body = await request.json().catch(() => null);

    const message = body?.message;
    const conversationId = body?.conversation_id;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 2000
    ) {
      return Response.json(
        { error: "Érvénytelen üzenet." },
        { status: 400 }
      );
    }

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (
      typeof conversationId !== "string" ||
      !uuidPattern.test(conversationId)
    ) {
      return Response.json(
        { error: "Érvénytelen beszélgetésazonosító." },
        { status: 400 }
      );
    }

    // 3. Szerveroldali Supabase kliens
    const admin = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // 4. Beszélgetés tulajdonosának ellenőrzése
    const {
      data: conversation,
      error: conversationError
    } = await admin
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (conversationError) {
      console.error(
        "Beszélgetés ellenőrzési hiba:",
        conversationError
      );

      return Response.json(
        { error: "Nem sikerült ellenőrizni a beszélgetést." },
        { status: 500 }
      );
    }

    if (!conversation) {
      return Response.json(
        { error: "A beszélgetés nem található." },
        { status: 404 }
      );
    }

    // 5. DEMO mód
    if (DEMO_MODE) {
      const demoReply =
        "🚀 Aivora AI DEMO válasz\n\n" +
        "A kérdésed: " + message.trim() + "\n\n" +
        "Üzleti tipp: Határozd meg a célközönségedet, " +
        "készíts egy egyszerű ajánlatot, és " +
        "teszteld a Facebook vagy TikTok marketinget.\n\n" +
        "Ez egy tesztválasz, nem valódi AI.";

      const { error: saveError } = await admin
        .from("chat_messages")
        .insert({
          user_id: userId,
          conversation_id: conversationId,
          role: "assistant",
          content: demoReply
        });

      if (saveError) {
        console.error(
          "DEMO-válasz mentési hiba:",
          saveError
        );

        return Response.json(
          { error: "Az AI-választ nem sikerült elmenteni." },
          { status: 500 }
        );
      }

      return Response.json({
        reply: demoReply,
        demo: true
      });
    }

    // 6. OpenAI API-kulcs ellenőrzése
    if (!openaiKey) {
      console.error("Hiányzik az OPENAI_API_KEY.");

      return Response.json(
        { error: "Hiányzik az OpenAI API-kulcs." },
        { status: 500 }
      );
    }

    // 7. Napi AI-keret ellenőrzése
    const {
      data: quotaData,
      error: quotaError
    } = await admin.rpc(
      "consume_combined_ai_quota",
      { p_user_id: userId }
    );

    if (
      quotaError ||
      !Array.isArray(quotaData) ||
      quotaData.length !== 1
    ) {
      console.error(
        "Keretellenőrzési hiba:",
        quotaError
      );

      return Response.json(
        { error: "Nem sikerült ellenőrizni a napi keretet." },
        { status: 500 }
      );
    }

    const quota = quotaData[0];

    if (!quota.allowed) {
      const globalLimit = quota.reason === "global_limit";

      return Response.json(
        {
          error: globalLimit
            ? "Az Aivora AI elérte a mai közös AI-kéréskeretet. Próbáld újra holnap!"
            : "Elérted a napi AI-kéréses limitedet. Próbáld újra holnap!",
          remaining: 0,
          reason: quota.reason
        },
        { status: 429 }
      );
    }

    // 8. Beszélgetési memória
    const {
      data: history,
      error: historyError
    } = await admin
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", userId)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(20);

    if (historyError) {
      console.error(
        "Memória betöltési hiba:",
        historyError
      );

      return Response.json(
        {
          error: "Nem sikerült betölteni a beszélgetés előzményeit."
        },
        { status: 500 }
      );
    }

    const previousMessages = [...(history || [])]
      .reverse()
      .filter(
        (item) =>
          ["user", "assistant"].includes(item.role) &&
          typeof item.content === "string"
      )
      .map((item) => ({
        role: item.role,
        content: item.content
      }));

    const messages = [
      ...previousMessages,
      {
        role: "user",
        content: message.trim()
      }
    ];

    // 9. OpenAI-válasz generálása
    const openai = new OpenAI({
      apiKey: openaiKey
    });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "Te az Aivora AI magyar nyelvű üzleti " +
        "asszisztense vagy. Segíts marketingben, " +
        "ügyfélszerzésben és vállalkozástervezésben. " +
        "Válaszolj érthetően és gyakorlatiasan.",
      input: messages,
      max_output_tokens: 350,
      store: false
    });

    const aiReply = response.output_text;

    if (!aiReply) {
      console.error("Az OpenAI üres választ adott.");

      return Response.json(
        { error: "Az AI nem adott választ." },
        { status: 502 }
      );
    }

    // 10. AI-válasz mentése
    const { error: saveError } = await admin
      .from("chat_messages")
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        role: "assistant",
        content: aiReply
      });

    if (saveError) {
      console.error(
        "AI-válasz mentési hiba:",
        saveError
      );

      return Response.json(
        { error: "Az AI-választ nem sikerült elmenteni." },
        { status: 500 }
      );
    }

   const { data: dailyLimit, error: limitError } =
  await admin.rpc("get_ai_daily_limit", {
    p_user_id: userId
  });

if (limitError) {
  console.error("Napi limit lekérdezési hiba:", limitError);
}

return Response.json({
  reply: aiReply,
  remaining: Math.max(
    0,
    (dailyLimit ?? 10) - quota.used_count
  )
});
 

  } catch (error) {
    console.error("AIVORA RÉSZLETES HIBA:", error);

    console.error("HIBA ADATOK:", {
      name: error?.name,
      status: error?.status,
      code: error?.code,
      type: error?.type
    });

    return Response.json(
      {
        error: "Nem sikerült választ kérni az AI-tól.",
        errorCode:
          error?.status || error?.code || "unknown"
      },
      { status: 500 }
    );
  }
}
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  try {
    const token = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return Response.json(
        { error: "Nincs bejelentkezve." },
        { status: 401 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const { data: authData, error: authError } =
      await admin.auth.getUser(token);

    if (authError || !authData.user) {
      return Response.json(
        { error: "Érvénytelen bejelentkezés." },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    const { data: subscription, error: subError } =
      await admin
        .from("user_subscriptions")
        .select("plan, status")
        .eq("user_id", userId)
        .maybeSingle();

    if (subError) throw subError;

    const isPro =
      subscription?.plan === "pro" &&
      subscription?.status === "active";

    const plan = isPro ? "pro" : "free";
    const dailyLimit = isPro ? 100 : 10;

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const { data: usage, error: usageError } =
      await admin
        .from("ai_usage")
        .select("request_count")
        .eq("user_id", userId)
        .eq("usage_date", today)
        .maybeSingle();

    if (usageError) throw usageError;

    const usedToday = usage?.request_count ?? 0;

    return Response.json({
      plan,
      dailyLimit,
      usedToday,
      remaining: Math.max(
        0,
        dailyLimit - usedToday
      )
    });
  } catch (error) {
    console.error("Subscription API hiba:", error);

    return Response.json(
      { error: "Nem sikerült lekérni a csomagadatokat." },
      { status: 500 }
    );
  }
}
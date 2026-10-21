import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!stripeKey || !supabaseUrl || !serviceKey) {
      return Response.json(
        { error: "Hiányzó szerverbeállítás." },
        { status: 500 }
      );
    }

    const origin = new URL(request.url).origin;

    const stripe = new Stripe(stripeKey);
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return Response.json(
        { error: "Bejelentkezés szükséges." },
        { status: 401 }
      );
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return Response.json(
        { error: "Érvénytelen bejelentkezés." },
        { status: 401 }
      );
    }

    const { data: subscription, error: subscriptionError } =
      await supabase
        .from("user_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", authData.user.id)
        .maybeSingle();

    if (subscriptionError) {
      throw subscriptionError;
    }

    if (!subscription?.stripe_customer_id) {
      return Response.json(
        { error: "Nem található Stripe-előfizetés." },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe Portal hiba:", error);

    return Response.json(
      { error: "Nem sikerült megnyitni az előfizetéskezelőt." },
      { status: 500 }
    );
  }
}
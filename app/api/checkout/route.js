import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!stripeKey?.startsWith("sk_test_") || !priceId) {
      return Response.json(
        { error: "Hiányzó vagy nem teszt Stripe-beállítás." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      return Response.json(
        { error: "Jelentkezz be az előfizetéshez." },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return Response.json(
        { error: "Érvénytelen bejelentkezés." },
        { status: 401 }
      );
    }

    const stripe = new Stripe(stripeKey);

    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: data.user.id,
      customer_email: data.user.email || undefined,
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancel`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout hiba:", error.message);

    return Response.json(
      { error: "Nem sikerült elindítani a tesztfizetést." },
      { status: 500 }
    );
  }
}
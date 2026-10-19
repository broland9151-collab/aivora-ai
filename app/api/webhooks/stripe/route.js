import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey?.startsWith("sk_test_") || !webhookSecret) {
    return Response.json(
      { error: "Hiányzó Stripe-beállítás." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeKey);
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "Hiányzó Stripe aláírás." },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    );
  } catch {
    return Response.json(
      { error: "Érvénytelen Stripe aláírás." },
      { status: 400 }
    );
  }

  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    // Az előfizetés állapotának szinkronizálása
    async function syncSubscription(subscription) {
      const subscriptionId = subscription.id;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

      const { data: existing, error: lookupError } =
        await admin
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

      if (lookupError) throw lookupError;

      if (!existing) {
        console.log(
          "Még nem társított előfizetés:",
          subscriptionId
        );
        return;
      }

      const active = subscription.status === "active";

      const { error } = await admin
        .from("user_subscriptions")
        .update({
          plan: active ? "pro" : "free",
          status: active ? "active" : "inactive",
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", existing.user_id)
        .eq("stripe_subscription_id", subscriptionId);

      if (error) throw error;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (
        session.mode === "subscription" &&
        session.client_reference_id &&
        session.subscription
      ) {
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        const active = subscription.status === "active";

        const { error } = await admin
          .from("user_subscriptions")
          .upsert(
            {
              user_id: session.client_reference_id,
              plan: active ? "pro" : "free",
              status: active ? "active" : "inactive",
              stripe_customer_id:
                typeof session.customer === "string"
                  ? session.customer
                  : session.customer?.id,
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (error) throw error;
      }
    }

    if (
      [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.paid",
        "invoice.payment_failed",
      ].includes(event.type)
    ) {
      let subscriptionId;

      if (event.type.startsWith("customer.subscription.")) {
        subscriptionId = event.data.object.id;
      } else {
        const invoice = event.data.object;
        subscriptionId =
          invoice.parent?.subscription_details?.subscription ??
          invoice.subscription;
      }

      if (typeof subscriptionId === "string") {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        await syncSubscription(subscription);
      }
    }

    console.log("Stripe esemény feldolgozva:", event.type);

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook hiba:", error);

    return Response.json(
      { error: "Webhook feldolgozási hiba." },
      { status: 500 }
    );
  }
}
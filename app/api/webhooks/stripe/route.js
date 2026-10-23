 import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";


export async function POST(request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey?.startsWith("sk_test_") || !webhookSecret) {
    console.error("Hiányzó Stripe tesztbeállítás.");

    return Response.json(
      { error: "Stripe-beállítási hiba." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "Hiányzó Stripe aláírás." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeKey);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Érvénytelen webhook aláírás:", error.message);

    return Response.json(
      { error: "Érvénytelen Stripe aláírás." },
      { status: 400 }
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Hiányzó Supabase szerverbeállítás.");
    }

    const admin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    function getId(value) {
      if (typeof value === "string") return value;
      return value?.id || null;
    }

    function isActive(subscription) {
      return subscription.status === "active";
    }

    async function updateSubscription(subscription) {
      const subscriptionId = subscription.id;
      const customerId = getId(subscription.customer);

      const { data: existing, error: lookupError } =
        await admin
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

      if (lookupError) throw lookupError;

      if (!existing) {
        console.log(
          "Még nem társított Stripe-előfizetés:",
          subscriptionId
        );
        return;
      }

      const active = isActive(subscription);

      const { error: updateError } = await admin
        .from("user_subscriptions")
        .update({
          plan: active ? "pro" : "free",
          status: active ? "active" : "inactive",
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", existing.user_id)
        .eq("stripe_subscription_id", subscriptionId);

      if (updateError) throw updateError;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (
        session.mode === "subscription" &&
        session.client_reference_id &&
        session.subscription
      ) {
        const userId = session.client_reference_id;
        const subscriptionId = getId(session.subscription);

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        const customerId = getId(subscription.customer);

        if (
          getId(session.customer) &&
          getId(session.customer) !== customerId
        ) {
          throw new Error("Stripe ügyfélazonosító eltérés.");
        }

        const active = isActive(subscription);

        const { data: current, error: currentError } =
          await admin
            .from("user_subscriptions")
            .select("stripe_subscription_id")
            .eq("user_id", userId)
            .maybeSingle();

        if (currentError) throw currentError;

        if (
          current?.stripe_subscription_id &&
          current.stripe_subscription_id !== subscriptionId
        ) {
          const oldSubscription =
            await stripe.subscriptions.retrieve(
              current.stripe_subscription_id
            );

          if (
            ["active", "trialing", "past_due"].includes(
              oldSubscription.status
            )
          ) {
            console.error(
              "Több előfizetés ugyanahhoz a felhasználóhoz:",
              userId
            );

            throw new Error(
              "Meglévő előfizetés miatt manuális ellenőrzés szükséges."
            );
          }
        }

        const { error: saveError } = await admin
          .from("user_subscriptions")
          .upsert(
            {
              user_id: userId,
              plan: active ? "pro" : "free",
              status: active ? "active" : "inactive",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (saveError) throw saveError;
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;

      // A törölt előfizetés adatait közvetlenül
      // a hitelesített Stripe eseményből kezeljük.
      if (event.type === "customer.subscription.deleted") {
        await updateSubscription({
          ...subscription,
          status: "canceled",
        });
      } else {
        // A legfrissebb állapotot kérjük le a Stripe-tól.
        const latest = await stripe.subscriptions.retrieve(
          subscription.id
        );

        await updateSubscription(latest);
      }
    }

    if (
      event.type === "invoice.paid" ||
      event.type === "invoice.payment_failed"
    ) {
      const invoice = event.data.object;

      const subscriptionId = getId(
        invoice.parent?.subscription_details?.subscription ??
        invoice.subscription
      );

      if (subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        await updateSubscription(subscription);
      }
    }

    console.log("Stripe webhook feldolgozva:", event.type);

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook feldolgozási hiba:", error);

    return Response.json(
      { error: "Webhook feldolgozási hiba." },
      { status: 500 }
    );
  }
}
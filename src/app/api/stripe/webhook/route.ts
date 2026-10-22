import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId || "premium";
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          await supabaseAdmin
            .from("subscriptions")
            .upsert(
              {
                user_id: userId,
                plan: planId,
                status: subscription.status,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                current_period_end: new Date(
                  (subscription.current_period_end as number) * 1000
                ).toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("subscriptions")
          .upsert(
            {
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_end: new Date(
                (subscription.current_period_end as number) * 1000
              ).toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "stripe_subscription_id" }
          );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
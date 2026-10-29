import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          await query(
            `INSERT INTO subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (user_id) DO UPDATE SET
               plan = EXCLUDED.plan,
               status = EXCLUDED.status,
               stripe_customer_id = EXCLUDED.stripe_customer_id,
               stripe_subscription_id = EXCLUDED.stripe_subscription_id,
               current_period_end = EXCLUDED.current_period_end,
               updated_at = EXCLUDED.updated_at`,
            [
              userId,
              planId,
              subscription.status,
              customerId,
              subscriptionId,
              new Date((subscription as any).current_period_end * 1000).toISOString(),
              new Date().toISOString(),
            ],
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await query(
          `INSERT INTO subscriptions (stripe_subscription_id, status, current_period_end, updated_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (stripe_subscription_id) DO UPDATE SET
             status = EXCLUDED.status,
             current_period_end = EXCLUDED.current_period_end,
             updated_at = EXCLUDED.updated_at`,
          [
            subscription.id,
            subscription.status,
            new Date((subscription as any).current_period_end * 1000).toISOString(),
            new Date().toISOString(),
          ],
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await query(
          `UPDATE subscriptions SET status = $1, updated_at = $2 WHERE stripe_subscription_id = $3`,
          ["canceled", new Date().toISOString(), subscription.id],
        );
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { stripe, getPlan, getStripePriceId } from "@/lib/stripe";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { planId, userId } = await req.json();

    if (!planId || !userId) {
      return NextResponse.json(
        { error: "planId and userId are required" },
        { status: 400 }
      );
    }

    const plan = getPlan(planId as any);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (planId === "free") {
      // Downgrade to free immediately
      await query(
        `INSERT INTO subscriptions (user_id, plan, status, current_period_end, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE SET
           plan = EXCLUDED.plan,
           status = EXCLUDED.status,
           current_period_end = EXCLUDED.current_period_end,
           updated_at = EXCLUDED.updated_at`,
        [userId, "free", "active", null, new Date().toISOString()]
      );
      return NextResponse.json({ success: true, plan: "free" });
    }

    const priceId = getStripePriceId(planId as any);
    if (!priceId || priceId.includes("placeholder")) {
      // Dev mode: simulate premium activation without Stripe
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
          "premium",
          "active",
          `dev_customer_${userId}`,
          `dev_sub_${userId}`,
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          new Date().toISOString(),
        ]
      );
      return NextResponse.json({
        success: true,
        plan: "premium",
        devMode: true,
        message: "Stripe not configured. Premium activated in dev mode.",
      });
    }

    // Get or create Stripe customer
    const profileRes = await query(
      `SELECT email, display_name FROM profiles WHERE id = $1`,
      [userId]
    );
    const profile = profileRes.rows[0] || {};

    let customerId: string | undefined = undefined;
    const subRes = await query(
      `SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    if (subRes.rows[0]?.stripe_customer_id) {
      customerId = subRes.rows[0].stripe_customer_id;
    } else if (profile.email) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.display_name || undefined,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : profile?.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: { userId, planId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { stripe, getPlan, getStripePriceId } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

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
      await supabaseAdmin
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            plan: "free",
            status: "active",
            current_period_end: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      return NextResponse.json({ success: true, plan: "free" });
    }

    const priceId = getStripePriceId(planId as any);
    if (!priceId || priceId.includes("placeholder")) {
      // Dev mode: simulate premium activation without Stripe
      await supabaseAdmin
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            plan: "premium",
            status: "active",
            stripe_customer_id: `dev_customer_${userId}`,
            stripe_subscription_id: `dev_sub_${userId}`,
            current_period_end: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      return NextResponse.json({
        success: true,
        plan: "premium",
        devMode: true,
        message: "Stripe not configured. Premium activated in dev mode.",
      });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, display_name")
      .eq("id", userId)
      .single();

    let customerId: string | null = null;
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (sub?.stripe_customer_id) {
      customerId = sub.stripe_customer_id;
    } else if (profile?.email) {
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
/**
 * Unified payment helpers for Vitala.
 *
 * Supports Stripe (cards) and M-Pesa (mobile money, Kenya).
 * In dev mode without Stripe credentials, premium is granted immediately.
 */

import { supabaseAdmin } from "@/lib/supabase";

export interface PaymentResult {
  success: boolean;
  plan: "free" | "premium";
  devMode?: boolean;
  message?: string;
  url?: string;
}

export async function activatePremium(
  userId: string,
  provider: "stripe" | "mpesa",
  referenceId: string
): Promise<PaymentResult> {
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan: "premium",
        status: "active",
        stripe_customer_id: provider === "stripe" ? referenceId : null,
        stripe_subscription_id: referenceId,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  return {
    success: true,
    plan: "premium",
    devMode: true,
    message: `Premium activated via ${provider}`,
  };
}

export async function getUserPlan(userId: string) {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .single();

  return data;
}

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString()}`;
}
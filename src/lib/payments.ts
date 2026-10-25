/**
 * Unified payment helpers for Vitala.
 *
 * Supports Stripe (cards) and M-Pesa (mobile money, Kenya).
 * In dev mode without Stripe credentials, premium is granted immediately.
 */

import { query } from "@/lib/db";

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

  await query(
    `INSERT INTO subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
     VALUES ($1, 'premium', 'active', $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE SET
       plan = EXCLUDED.plan,
       status = EXCLUDED.status,
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       stripe_subscription_id = EXCLUDED.stripe_subscription_id,
       current_period_end = EXCLUDED.current_period_end,
       updated_at = EXCLUDED.updated_at`,
    [
      userId,
      provider === "stripe" ? referenceId : null,
      referenceId,
      periodEnd,
      new Date().toISOString(),
    ]
  );

  return {
    success: true,
    plan: "premium",
    devMode: true,
    message: `Premium activated via ${provider}`,
  };
}

export async function getUserPlan(userId: string) {
  const res = await query(
    "SELECT plan, status, current_period_end FROM subscriptions WHERE user_id = $1",
    [userId]
  );

  return res.rows[0];
}

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString()}`;
}

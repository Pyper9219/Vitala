import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-09-30.endive",
      typescript: true,
    });
  }
  return stripeInstance;
}

export const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "kes",
    interval: "month",
    description: "Basic meal and workout planning.",
    features: [
      "Personalized meal plans",
      "Basic workout planner",
      "Shopping list",
      "Progress tracking",
    ],
    limits: { mealPlans: 3, workouts: 5, aiMessages: 10 },
  },
  {
    id: "premium",
    name: "Premium",
    price: 499,
    currency: "kes",
    interval: "month",
    description: "Unlimited plans, AI assistant, and WhatsApp reminders.",
    features: [
      "Unlimited meal plans",
      "Unlimited workouts",
      "AI wellness assistant",
      "WhatsApp & SMS reminders",
      "Priority support",
    ],
    limits: { mealPlans: -1, workouts: -1, aiMessages: -1 },
  },
] as const;

export type PlanId = (typeof SUBSCRIPTION_PLANS)[number]["id"];

export function getPlan(planId: PlanId) {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId);
}

export function getStripePriceId(planId: PlanId): string | null {
  // In production, map to actual Stripe price IDs from environment
  const priceIdMap: Record<PlanId, string> = {
    free: "",
    premium: process.env.STRIPE_PREMIUM_PRICE_ID || "price_premium_placeholder",
  };
  return priceIdMap[planId] || null;
}

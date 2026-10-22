"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, RefreshCw, ShieldAlert } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "KES 0",
    description: "Basic meal and workout planning.",
    features: [
      "Personalized meal plans (up to 3)",
      "Basic workout planner",
      "Shopping list",
      "Progress tracking",
    ],
    cta: "Choose Free",
  },
  {
    id: "premium",
    name: "Premium",
    price: "KES 499/mo",
    description: "Unlimited plans, AI assistant, and WhatsApp reminders.",
    features: [
      "Unlimited meal plans",
      "Unlimited workouts",
      "AI wellness assistant",
      "WhatsApp & SMS reminders",
      "Priority support",
    ],
    cta: "Upgrade to Premium",
  },
] as const;

export default function SubscriptionPage() {
  const supabase = createBrowserClient();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    setSubscription(data);
    setLoading(false);
  }

  async function handleUpgrade(planId: string) {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId: subscription?.user_id }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        await loadSubscription();
      } else {
        alert(data.error || "Upgrade failed");
      }
    } catch {
      alert("Upgrade failed. Please try again.");
    } finally {
      setUpgrading(false);
    }
  }

  async function openPortal() {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: subscription?.user_id }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  const currentPlan = PLANS.find((p) => p.id === subscription?.plan) || PLANS[0];
  const isPremium = subscription?.plan === "premium";
  const isActive = subscription?.status === "active";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Crown className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Subscription</h1>
        </div>

        {/* Current plan card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold">{currentPlan.name}</h2>
              <p className="text-muted-foreground">{currentPlan.description}</p>
              <p className="text-lg font-medium mt-2">{currentPlan.price}</p>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className="mt-3 inline-block"
              >
                {isActive ? "Active" : subscription?.status || "Inactive"}
              </Badge>
              {isPremium && subscription?.stripe_customer_id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={openPortal}
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Manage billing
                </Button>
              )}
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="text-sm space-y-2">
                {currentPlan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <ShieldAlert className="h-3 w-3 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Plan selector */}
        <h2 className="text-lg font-semibold mb-4">Choose a plan</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {PLANS.map((plan) => {
            const selected = plan.id === currentPlan.id;
            return (
              <Card
                key={plan.id}
                className={`rounded-2xl p-6 transition-all ${
                  selected
                    ? "border-2 border-primary ring-1 ring-primary bg-primary/5"
                    : "border border-input hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <span className="text-2xl font-bold">{plan.price}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {selected ? (
                  <div className="text-sm text-muted-foreground text-center mb-4">
                    You are on this plan
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading}
                  >
                    {upgrading ? "Processing..." : plan.cta}
                  </Button>
                )}
                {!selected && (
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Upgrade to unlock premium features
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* M-Pesa note */}
        <Card className="mt-8 border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Paying with M-Pesa?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              If you're in Kenya and prefer to pay via M-Pesa, contact support
              or use the M-Pesa PayBill option at checkout. Your Premium
              access will be activated once payment is confirmed.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              <RefreshCw className="mr-2 h-4 w-4" /> Check payment status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
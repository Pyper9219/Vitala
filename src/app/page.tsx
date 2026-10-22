"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Mail, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Logo } from "@/components/logo";
import { LogoMark } from "@/components/logo";

const features = [
  {
    icon: Smartphone,
    title: "Personalized plans",
    desc: "Meal ideas, workouts, and shopping lists tailored to your diet, budget, and equipment.",
  },
  {
    icon: Shield,
    title: "Track your progress",
    desc: "Check off habits, log meals and workouts, and see weekly trends without guilt.",
  },
  {
    icon: Mail,
    title: "Timely reminders",
    desc: "Get nudges via in-app, WhatsApp, or SMS so you never miss a meal or workout.",
  },
];

const stats = [
  { label: "Meal plans generated", value: "10k+" },
  { label: "Workouts logged", value: "5k+" },
  { label: "Active users", value: "2k+" },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormDataEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-12 sm:py-20 lg:pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-6">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </span>
                New: AI-powered weekly planners
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Build healthier habits,{" "}
                <span className="text-primary">one day at a time.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Get personalized meal plans, realistic workouts, practical shopping lists, and timely
                reminders—all organized around your lifestyle, budget, and equipment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="button w-full sm:w-auto">
                  Get started free
                </Link>
                <Link href="#how-it-works" className="button variant-outline w-full sm:w-auto">
                  How it works
                </Link>
              </div>
              <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" /> No credit card required
                <Check className="h-4 w-4 text-primary" /> Cancel anytime
                <Check className="h-4 w-4 text-primary" /> Built for Kenya & beyond
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="how-it-works" className="border-y px-4 py-12 sm:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                How it works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tell us about yourself, get a plan that fits, and track what matters.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border bg-card p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="rounded-lg bg-primary/10 p-3 text-primary mb-4">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 py-12 sm:py-16 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                    {s.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="rounded-xl bg-primary p-8 sm:p-12 text-primary-foreground text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to feel better?</h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands building healthier habits with personalized plans and reminders.
              </p>
              <Link href="/signup" className="button w-full sm:w-auto">
                Start for free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Newsletter capture modal (inline, simple) */}
      <div className="fixed bottom-6 right-6 z-50">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-80">
          <div className="rounded-xl border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <LogoMark className="h-5 w-5 text-primary" />
              <span className="font-bold">Vitala</span>
            </div>
            <h3 className="font-semibold mb-2">Get wellness tips weekly</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for meal ideas, workout tips, and reminders.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button type="submit" disabled={submitting} size="sm" className="w-auto">
                  {submitting ? "Saving…" : "Subscribe"}
                </Button>
              </div>
              {submitted && (
                <p className="text-xs text-primary font-medium">Thanks for subscribing!</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

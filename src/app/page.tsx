"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Sparkles, Heart, Star } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Plans",
    desc: "Smart meal & workout plans that adapt to your goals, budget, and preferences.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Heart,
    title: "Track Everything",
    desc: "Log meals, workouts, mood, and sleep. See weekly trends without the guilt.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Sparkles,
    title: "Smart Reminders",
    desc: "WhatsApp & SMS nudges so you never skip a meal or workout again.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Heart,
    title: "Built for You",
    desc: "Personalized to your dietary needs, equipment, and fitness level.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "Lightning Fast",
    desc: "Generate a full week of meals and workouts in seconds with AI.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Star,
    title: "Kenya-First",
    desc: "Local foods, KES pricing, M-Pesa payments. Built for East Africa.",
    color: "from-green-500 to-emerald-500",
  },
];

const stats = [
  { value: "10k+", label: "Meal plans generated" },
  { value: "5k+", label: "Workouts logged" },
  { value: "2k+", label: "Active users" },
  { value: "98%", label: "User satisfaction" },
];

const testimonials = [
  {
    name: "Wanjiku M.",
    role: "Nairobi",
    text: "Vitala helped me lose 8kg in 3 months. The meal plans use foods I actually enjoy!",
  },
  {
    name: "James O.",
    role: "Mombasa",
    text: "The WhatsApp reminders are a game-changer. I havent missed a workout in weeks.",
  },
  {
    name: "Amina H.",
    role: "Kisumu",
    text: "Finally an app that understands Kenyan food and budget. Love it!",
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden gradient-hero">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-float" />
          <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-36">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-8 animate-fade-in-up">
                <Sparkles className="h-4 w-4" /> New: AI-powered weekly planners
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100">
                Build healthier habits, <span className="gradient-text">one day at a time.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                Get personalized meal plans, realistic workouts, practical shopping lists, and
                timely reminders — all organized around your lifestyle, budget, and equipment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                <Link href="/signup" className="button text-base px-8 py-3.5">
                  Get started free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="#how-it-works" className="button variant-outline text-base px-8 py-3.5">
                  How it works
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground animate-fade-in-up delay-400">
                {["No credit card required", "Cancel anytime", "Built for Kenya & beyond"].map(
                  (t) => (
                    <span key={t} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" /> {t}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-card/50">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1">
                    {s.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="how-it-works" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Everything you need to thrive
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tell us about yourself, get a plan that fits, and track what matters.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border bg-card p-6 card-hover hover:border-emerald-200 transition-all"
                >
                  <div
                    className={`inline-flex rounded-xl bg-gradient-to-br ${f.color} p-3 text-white mb-4 shadow-lg`}
                  >
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by thousands</h2>
              <p className="text-muted-foreground">See what our users are saying</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="rounded-2xl bg-card border p-6 card-hover">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-4">
            <div className="relative rounded-3xl gradient-primary p-10 sm:p-16 text-center text-white overflow-hidden">
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to feel better?</h2>
                <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
                  Join thousands building healthier habits with personalized plans and reminders.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-700 px-8 py-3.5 font-semibold hover:bg-white/90 transition-all hover:-translate-y-0.5 shadow-xl"
                >
                  Start for free <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Signup failed");
      }
      router.push("/onboarding");
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="relative text-white max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Start your wellness journey</h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Join thousands building healthier habits with personalized meal plans, workouts, and
            reminders.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["W", "J", "A"].map((l, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm font-bold backdrop-blur-sm"
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70">2,000+ users already onboard</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl">
              <span className="text-emerald-600">Vital</span>a
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-muted-foreground mb-8">Start your free wellness journey today</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl gradient-primary py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

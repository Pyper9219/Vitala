"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Sign in failed");
      }
      await router.push("/dashboard");
    } catch (err: any) {
      setLoading(false);
      setError(err.name === "AbortError" ? "Request timed out." : err.message);
      return;
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="relative text-white max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Welcome back to Vitala</h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Your personalized wellness journey continues. Pick up right where you left off.
          </p>
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
          <h1 className="text-2xl font-bold mb-1">Sign in to your account</h1>
          <p className="text-muted-foreground mb-8">Enter your credentials to continue</p>
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
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent transition-all"
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
                "Signing in..."
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-emerald-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

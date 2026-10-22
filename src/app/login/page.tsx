"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
  const router = useRouter();

  async function handleSubmit(e: FormDataEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard");
  }

  async function handleSignInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md p-8">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to your Vitala account
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-9"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-2">
              <ArrowRight className="h-3 w-3" /> {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleSignInWithGoogle}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.25 1-.82 1.79-1.57 2.25"
            />
            <path fill="#34A853" d="M7.11 21.76c0-.39.03-.78.09-1.16H3.46c-.18 1.07.48 2.01 1.31 2.59 1.57.87 3.51 1.38 5.72 1.38 4.21 0 7.35-2.72 8.32-6.54H16c-.12 1.3-1.04 2.34-2.43 2.67v-2.57h2.39c-.15.5-.45.87-.85 1.16z" />
            <path fill="#FBBC04" d="M12 5.38c1.71 0 3.21.42 4.45 1.16l1.3-1.44C15.65 3.31 13.09 2 12 2c-3.42 0-6.19 2.2-6.81 5.25H2.19C2.83 10.92 6 15.16 10.35 16.44l2.26-2.26H12c-.45 0-.85-.09-1.26-.26v-2.65h2.39c-.25.43-.38.91-.38 1.45z" />
            <path fill="#EA4335" d="M12 21.38c-3.57 0-6.47-1.5-8.22-4.05C2.25 15.75 2 14.43 2 12s.25-3.75.78-5.25H5.96c-.32 1.3-.03 2.64.78 3.68.61.78 1.51 1.26 2.5 1.26s1.89-.48 2.5-1.26c.81-1.04 1.1-2.38.78-3.68h2.14c1.04 2.24 3.27 4.05 6.16 4.05 2.93 0 5.24-1.59 6.44-4.05h2.1c-.36 2.08-1.39 3.96-2.92 5.28-1.54 1.32-3.56 2.07-5.89 2.07z" />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}

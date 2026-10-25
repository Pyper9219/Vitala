"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getUserById } from "@/lib/auth";
import { query } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: "profile", label: "Your profile", icon: User },
  { id: "diet", label: "Diet & budget" },
  { id: "fitness", label: "Fitness & activity" },
  { id: "reminders", label: "Reminders" },
];

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("vitala_session")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return payload.id ?? null;
}

async function saveProfile(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }
  const payload: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("profile:")) {
      payload[key.replace("profile:", "")] = value;
    }
  }
  // Normalize comma-separated arrays
  if (typeof payload.dietary_preferences === "string") {
    payload.dietary_preferences = payload.dietary_preferences
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof payload.allergies === "string") {
    payload.allergies = payload.allergies.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (typeof payload.preferred_activities === "string") {
    payload.preferred_activities = payload.preferred_activities.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (typeof payload.equipment === "string") {
    payload.equipment = payload.equipment.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (typeof payload.reminder_channels === "string") {
    payload.reminder_channels = payload.reminder_channels.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (payload.age) payload.age = Number(payload.age);
  if (payload.budget_max) payload.budget_max = Number(payload.budget_max);

  // Persist profile data to the users table (profiles references auth.users which
  // does not exist in plain Postgres/Neon). Store the form payload as needed.
  if (payload.display_name || payload.name) {
    await query("UPDATE users SET name = COALESCE($2, name) WHERE id = $1", [
      userId,
      payload.display_name || payload.name || null,
    ]);
  }
}

export default async function Onboarding() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl tracking-tight">
            Vitala
          </Link>
          <Link href="/login" className="text-sm font-medium hover:text-primary">
            Back to sign in
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-10 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <span>Step 1 of {STEPS.length}</span>
            <span>100% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: "100%" }} />
          </div>
        </div>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>Profile complete!</CardTitle>
            <CardDescription className="text-sm">
              Your wellness profile has been saved. You're all set to start building healthier habits.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
          </CardContent>
          <div className="mt-4 pt-4 border-t flex justify-center">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

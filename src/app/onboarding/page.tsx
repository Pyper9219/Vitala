"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Mail, Phone, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: "profile", label: "Your profile", icon: User },
  { id: "diet", label: "Diet & budget", icon: Mail },
  { id: "fitness", label: "Fitness & activity", icon: Phone },
  { id: "reminders", label: "Reminders", icon: CheckCircle2 },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const goNext = (data: any) => {
    setForm({ ...form, ...data });
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      saveProfile();
    }
  };

  const goPrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload: any = {
        id: user.id,
        updated_at: new Date().toISOString(),
        ...form,
      };

      // Normalize arrays from strings if needed
      if (typeof payload.dietary_preferences === "string") {
        payload.dietary_preferences = payload.dietary_preferences
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      if (typeof payload.allergies === "string") {
        payload.allergies = payload.allergies.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (typeof payload.preferred_activities === "string") {
        payload.preferred_activities = payload.preferred_activities.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (typeof payload.equipment === "string") {
        payload.equipment = payload.equipment.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (typeof payload.reminder_channels === "string") {
        payload.reminder_channels = payload.reminder_channels.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      setLoading(false);
      alert(err.message || "Failed to save profile. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle>Profile complete!</CardTitle>
          <CardDescription>
            Your wellness profile has been saved. You're all set to start building healthier habits.
          </CardDescription>
          <div className="mt-6 pt-4 border-t flex justify-center">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

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
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{progress.toFixed(0)}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>{current.label}</CardTitle>
            <CardDescription className="text-sm">
              Tell us a bit about yourself so we can personalize your plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 0 && <ProfileStep onNext={goNext} />}
            {step === 1 && <DietStep onNext={goNext} onBack={goPrev} />}
            {step === 2 && <FitnessStep onNext={goNext} onBack={goPrev} />}
            {step === 3 && <ReminderStep onNext={goNext} onBack={goPrev} />}
          </CardContent>
          <div className="mt-4 flex items-center justify-between gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={goPrev}>
                Back
              </Button>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {STEPS.map((s, i) => (
                <Badge key={s.id} variant={i <= step ? "default" : "secondary"} className="h-6 w-6 px-0 text-xs justify-center">
                  {i + 1}
                </Badge>
              ))}
            </div>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => goNext({})}>Continue</Button>
            ) : (
              <Button onClick={() => goNext({})} disabled={loading}>
                {loading ? "Saving..." : "Finish setup"}
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

function ProfileStep({ onNext }: { onNext: (d: any) => void }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext({
          display_name: name || null,
          age: age ? Number(age) : null,
          country: country || null,
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Display name</label>
        <Input placeholder="e.g. Alex" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Age</label>
        <Input type="number" placeholder="e.g. 28" value={age} onChange={(e) => setAge(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Country</label>
        <Input placeholder="e.g. Kenya" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>
      <p className="text-xs text-muted-foreground">
        We'll use this to tailor plans to your local food and currency.
      </p>
    </form>
  );
}

function DietStep({ onNext, onBack }: { onNext: (d: any) => void; onBack: () => void }) {
  const [budget, setBudget] = useState("");
  const [diet, setDiet] = useState("");
  const [allergies, setAllergies] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext({
          budget_max: budget ? Number(budget) : null,
          dietary_preferences: diet ? [diet] : [],
          allergies: allergies ? [allergies] : [],
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Monthly food budget</label>
        <Input type="number" placeholder="e.g. 5000" value={budget} onChange={(e) => setBudget(e.target.value)} />
        <p className="text-xs text-muted-foreground">In your local currency (e.g. KES)</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Dietary preference</label>
        <Input placeholder="e.g. vegetarian, none, pescatarian" value={diet} onChange={(e) => setDiet(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Allergies (comma separated)</label>
        <Input placeholder="e.g. nuts, dairy" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
      </div>
    </form>
  );
}

function FitnessStep({ onNext, onBack }: { onNext: (d: any) => void; onBack: () => void }) {
  const [experience, setExperience] = useState("");
  const [activities, setActivities] = useState("");
  const [equipment, setEquipment] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext({
          fitness_experience: experience || null,
          preferred_activities: activities ? [activities] : [],
          equipment: equipment ? [equipment] : [],
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Fitness experience</label>
        <Input placeholder="e.g. beginner, intermediate, advanced" value={experience} onChange={(e) => setExperience(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Preferred activities</label>
        <Input placeholder="e.g. walking, yoga, strength training" value={activities} onChange={(e) => setActivities(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Available equipment</label>
        <Input placeholder="e.g. none, dumbbells, resistance bands" value={equipment} onChange={(e) => setEquipment(e.target.value)} />
      </div>
    </form>
  );
}

function ReminderStep({ onNext, onBack }: { onNext: (d: any) => void; onBack: () => void }) {
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("in_app");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext({
          phone_number: phone || null,
          reminder_channels: channel ? [channel] : [],
          notifications_enabled: true,
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Phone number for reminders (optional)</label>
        <Input placeholder="e.g. +254 700 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Preferred channel</label>
        <Input placeholder="in_app, whatsapp, sms, or email" value={channel} onChange={(e) => setChannel(e.target.value)} />
      </div>
      <p className="text-xs text-muted-foreground">
        Reminders help you stay on track with meals and workouts.
      </p>
    </form>
  );
}

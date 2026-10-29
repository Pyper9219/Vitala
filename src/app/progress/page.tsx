"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, CheckCircle2, Activity, Moon, TrendingUp, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProgressEntry {
  id: string;
  user_id: string;
  entry_date: string;
  meals_completed: number;
  workouts_completed: number;
  energy_level: number;
  mood: string | null;
  sleep_hours: number | null;
  notes: string | null;
  created_at: string;
}

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("vitala_session")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return payload.id ?? null;
}

async function getProgressEntries(userId: string): Promise<ProgressEntry[]> {
  const res = await query(
    `SELECT id, user_id, entry_date, meals_completed, workouts_completed,
            energy_level, mood, sleep_hours, notes, created_at
     FROM progress_entries
     WHERE user_id = $1
     ORDER BY entry_date DESC
     LIMIT 30`,
    [userId],
  );
  return res.rows as ProgressEntry[];
}

interface AddEntryInput {
  entry_date: string;
  meals_completed: number;
  workouts_completed: number;
  energy_level: number;
  mood: string;
  sleep_hours: number | null;
  notes: string;
}

export async function addEntry(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const entryDate = formData.get("entry_date") as string;
  const mealsCompleted = Number(formData.get("meals_completed")) || 0;
  const workoutsCompleted = Number(formData.get("workouts_completed")) || 0;
  const energyLevel = Number(formData.get("energy_level")) || 3;
  const mood = (formData.get("mood") as string) || "";
  const sleepHoursRaw = formData.get("sleep_hours") as string;
  const sleepHours = sleepHoursRaw ? Number(sleepHoursRaw) : null;
  const notes = (formData.get("notes") as string) || "";

  await query(
    `INSERT INTO progress_entries
       (user_id, entry_date, meals_completed, workouts_completed,
        energy_level, mood, sleep_hours, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, entryDate, mealsCompleted, workoutsCompleted, energyLevel, mood, sleepHours, notes],
  );
}

export default async function ProgressPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const entries = await getProgressEntries(userId);

  const latest = entries[0];
  const avgEnergy =
    entries.length > 0
      ? Math.round(
          (entries.reduce((acc, e) => acc + (Number(e.energy_level) || 0), 0) / entries.length) *
            10,
        ) / 10
      : 0;
  const totalMeals = entries.reduce((acc, e) => acc + (Number(e.meals_completed) || 0), 0);
  const totalWorkouts = entries.reduce((acc, e) => acc + (Number(e.workouts_completed) || 0), 0);

  const MOODS = ["😊 Great", "😐 Okay", "😔 Low", "😴 Tired", "🔥 Energized"];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Progress</h1>
            <p className="text-muted-foreground mt-2">
              Track your habits and see how you're doing.
            </p>
          </div>
          <form action={addEntry}>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" /> Log today
            </Button>
          </form>
        </div>

        {/* Overview stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Days tracked</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{entries.length}</div>
              <div className="text-xs text-muted-foreground">
                {entries.length > 0 ? "This period" : "No data yet"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Avg energy</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{avgEnergy}/5</div>
              <div className="text-xs text-muted-foreground">Across {entries.length} entries</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Meals logged</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{totalMeals}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Workouts logged</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{totalWorkouts}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Log today form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Log today's progress</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={addEntry} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <input
                      type="date"
                      name="entry_date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meals completed</label>
                      <input
                        type="number"
                        name="meals_completed"
                        min="0"
                        defaultValue={0}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Workouts completed</label>
                      <input
                        type="number"
                        name="workouts_completed"
                        min="0"
                        defaultValue={0}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Energy level (1-5)</label>
                      <input
                        type="number"
                        name="energy_level"
                        min="1"
                        max="5"
                        defaultValue={3}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sleep (hours)</label>
                      <input
                        type="number"
                        name="sleep_hours"
                        min="0"
                        step="0.5"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mood</label>
                    <div className="flex gap-2 flex-wrap">
                      {MOODS.map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          name="mood"
                          value={mood}
                          className={`px-3 py-2 rounded-md text-sm border transition-colors ${"bg-background border-input hover:bg-muted"}`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      name="notes"
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="How did today feel?..."
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Save entry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent entries */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent entries</CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p>No entries yet. Log your first day.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.slice(0, 10).map((entry) => (
                      <div key={entry.id} className="p-3 rounded-lg border bg-background">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-medium">
                            {new Date(entry.entry_date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <Badge variant="outline">{entry.energy_level}/5</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.meals_completed} meals • {entry.workouts_completed} workouts
                        </div>
                        {entry.mood && <div className="text-xs mt-1">{entry.mood}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

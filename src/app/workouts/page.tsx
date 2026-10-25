"use server";

import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Activity, CheckCircle2, Trash2, Calendar, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { redirect } from "next/navigation";

interface Workout {
  id: string;
  title: string;
  category: string;
  instructions?: string;
  duration_minutes?: number;
  equipment_needed?: string[];
  scheduled_for?: string;
  completed?: boolean;
  created_at?: string;
}

const WORKOUT_CATEGORIES = ["strength", "cardio", "flexibility", "balance"];

const workoutSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["strength", "cardio", "flexibility", "balance"]),
  instructions: z.string().optional(),
  duration_minutes: z.coerce.number().int().min(1).optional(),
  equipment_needed: z.string().optional(),
  scheduled_for: z.coerce.date().optional(),
});

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("vitala_session")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.id ?? null;
}

async function getWorkouts(userId: string) {
  const { rows } = await query(
    `SELECT id, title, category, instructions, duration_minutes, equipment_needed, scheduled_for, completed, created_at FROM workouts WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows as Workout[];
}

async function addWorkout(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const instructions = formData.get("instructions") as string;
  const durationMin = formData.get("duration_minutes") as string;
  const equipment = formData.get("equipment_needed") as string;
  const scheduled = formData.get("scheduled_for") as string;

  await query(
    `INSERT INTO workouts (user_id, title, category, instructions, duration_minutes, equipment_needed, scheduled_for, completed)
     VALUES ($1, $2, $3, $4, $5, $6, $7, false)`,
    [userId, title, category, instructions, durationMin ? Number(durationMin) : null, equipment ? equipment.split(",") : null, scheduled ? new Date(scheduled).toISOString() : new Date().toISOString()]
  );

  redirect("/workouts");
}

async function toggleWorkout(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const id = formData.get("workoutId") as string;
  const completed = formData.get("completed") === "true";

  await query(
    `UPDATE workouts SET completed = $1, completed_at = CASE WHEN $2 THEN NOW() ELSE NULL END WHERE id = $3 AND user_id = $4`,
    [completed, completed, id, userId]
  );

  redirect("/workouts");
}

async function deleteWorkout(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const id = formData.get("workoutId") as string;

  await query(`DELETE FROM workouts WHERE id = $1 AND user_id = $2`, [id, userId]);

  redirect("/workouts");
}

export default async function WorkoutsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const workouts = await getWorkouts(userId);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Workouts</h1>

      {/* Quick add form */}
      <div className="mb-6">
        <form action={addWorkout} className="space-y-2">
          <input
            type="hidden"
            name="category"
            value="cardio"
          />
          <input
            type="hidden"
            name="scheduled_for"
            defaultValue={new Date().toISOString()}
          />
          <div className="space-y-2">
            <input
              type="text"
              name="title"
              placeholder="e.g. Morning walk"
              required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button type="submit" className="w-full">
              Add Quick Workout
            </Button>
          </div>
        </form>
      </div>

      {/* Workout list */}
      <div className="space-y-4">
        {workouts.map((w) => (
          <Card key={w.id} className="border">
            <CardHeader>
              <CardTitle>{w.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-3">
                {w.instructions ?? "No instructions"}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {w.duration_minutes && (
                  <div>Duration: {w.duration_minutes} min</div>
                )}
                {w.scheduled_for && (
                  <div>Scheduled: {new Date(w.scheduled_for).toLocaleDateString()}</div>
                )}
              </div>

              {w.completed ? (
                <p className="text-sm text-green-500">Completed</p>
              ) : (
                <div className="flex gap-2">
                  <form action={toggleWorkout} className="inline">
                    <input type="hidden" name="workoutId" value={w.id} />
                    <input type="hidden" name="completed" value="true" />
                    <Button type="submit">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </Button>
                  </form>
                  <form action={toggleWorkout} className="inline">
                    <input type="hidden" name="workoutId" value={w.id} />
                    <input type="hidden" name="completed" value="false" />
                    <Button variant="outline" type="submit">
                      <Trash2 className="h-4 w-4" />
                      Undo
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add workout form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add a workout</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addWorkout} className="space-y-4">
            <input type="hidden" name="userId" value={userId} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Workout title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Morning walk"
                required
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                name="category"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {WORKOUT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Instructions (one per line)</label>
              <textarea
                name="instructions"
                placeholder="e.g. Warm up 5 min\nWalk briskly 20 min\nCool down 5 min"
                rows={3}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (min)</label>
                <input
                  type="number"
                  name="duration_minutes"
                  defaultValue="30"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Equipment</label>
                <input
                  name="equipment_needed"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g. none, dumbbells"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="scheduled_for"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Schedule workout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
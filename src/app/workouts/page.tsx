"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Clock,
  Activity,
  CheckCircle2,
  Trash2,
  Calendar,
  Flame,
  Edit2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWorkout, setNewWorkout] = useState({
    title: "",
    category: "strength",
    instructions: "",
    duration_minutes: 30,
    equipment_needed: "",
    scheduled_for: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const { data } = await supabase
      .from("workouts")
      .select("*")
      .order("scheduled_for", { ascending: true })
      .order("created_at", { ascending: false });

    setWorkouts(data ?? []);
    setLoading(false);
  };

  const addWorkout = async (e: FormDataEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("workouts").insert({
      title: newWorkout.title,
      category: newWorkout.category,
      instructions: newWorkout.instructions.split("\n").filter(Boolean),
      duration_minutes: Number(newWorkout.duration_minutes) || 30,
      equipment_needed: newWorkout.equipment_needed
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      scheduled_for: newWorkout.scheduled_for,
      completed: false,
    });

    if (!error) {
      setNewWorkout({
        title: "",
        category: "strength",
        instructions: "",
        duration_minutes: 30,
        equipment_needed: "",
        scheduled_for: new Date().toISOString().split("T")[0],
      });
      loadWorkouts();
    }
  };

  const toggleWorkout = async (id: string, completed: boolean) => {
    await supabase
      .from("workouts")
      .update({ completed: !completed, completed_at: new Date().toISOString() })
      .eq("id", id);
    loadWorkouts();
  };

  const deleteWorkout = async (id: string) => {
    if (!confirm("Delete this workout?")) return;
    await supabase.from("workouts").delete().eq("id", id);
    loadWorkouts();
  };

  const CATEGORIES = [
    { id: "strength", label: "Strength", icon: Flame },
    { id: "cardio", label: "Cardio", icon: Activity },
    { id: "flexibility", label: "Flexibility", icon: Edit2 },
    { id: "balance", label: "Balance", icon: Calendar },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Workouts</h1>
          <div className="mt-8 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todaysWorkouts = workouts.filter((w) => w.scheduled_for === today);
  const upcomingWorkouts = workouts.filter((w) => w.scheduled_for > today);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Workouts</h1>
            <p className="text-muted-foreground mt-2">
              Schedule and track your movement.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New workout
          </Button>
        </div>

        {/* Today's workouts */}
        <Card>
          <CardHeader>
            <CardTitle>Today ({today})</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysWorkouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No workouts scheduled for today.
              </div>
            ) : (
              <div className="space-y-3">
                {todaysWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background group"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{workout.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {workout.category} • {workout.duration_minutes} min
                      </div>
                      {workout.equipment_needed && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Equipment: {Array.isArray(workout.equipment_needed)
                            ? workout.equipment_needed.join(", ")
                            : workout.equipment_needed}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleWorkout(workout.id, workout.completed)}
                        className="text-sm hover:text-primary"
                      >
                        {workout.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteWorkout(workout.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add workout form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add a workout</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addWorkout} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Workout title</label>
                    <input
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={newWorkout.title}
                      onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
                      placeholder="e.g. Morning walk"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={newWorkout.category}
                      onChange={(e) => setNewWorkout({ ...newWorkout, category: e.target.value as any })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Instructions (one per line)</label>
                    <textarea
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={newWorkout.instructions}
                      onChange={(e) => setNewWorkout({ ...newWorkout, instructions: e.target.value })}
                      placeholder="e.g. Warm up 5 min\nWalk briskly 20 min\nCool down 5 min"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duration (min)</label>
                      <input
                        type="number"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newWorkout.duration_minutes}
                        onChange={(e) => setNewWorkout({ ...newWorkout, duration_minutes: Number(e.target.value) || 30 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Equipment</label>
                      <input
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newWorkout.equipment_needed}
                        onChange={(e) => setNewWorkout({ ...newWorkout, equipment_needed: e.target.value })}
                        placeholder="e.g. none, dumbbells"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <input
                        type="date"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newWorkout.scheduled_for}
                        onChange={(e) => setNewWorkout({ ...newWorkout, scheduled_for: e.target.value })}
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

          {/* Upcoming workouts */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingWorkouts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No upcoming workouts.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="p-3 rounded-lg border bg-background"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-medium">{workout.title}</div>
                          <Badge variant="outline" size="sm">
                            {new Date(workout.scheduled_for).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {workout.duration_minutes} min • {workout.category}
                        </div>
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
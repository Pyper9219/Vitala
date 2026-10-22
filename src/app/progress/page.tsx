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
  Flame,
  CheckCircle2,
  Activity,
  Moon,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProgressPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    meals_completed: 0,
    workouts_completed: 0,
    energy_level: 3,
    mood: "",
    sleep_hours: "",
    notes: "",
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const { data } = await supabase
      .from("progress_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .limit(30);

    setEntries(data ?? []);
    setLoading(false);
  };

  const addEntry = async (e: FormDataEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("progress_entries").insert({
      entry_date: newEntry.entry_date,
      meals_completed: Number(newEntry.meals_completed) || 0,
      workouts_completed: Number(newEntry.workouts_completed) || 0,
      energy_level: Number(newEntry.energy_level) || 3,
      mood: newEntry.mood,
      sleep_hours: Number(newEntry.sleep_hours) || null,
      notes: newEntry.notes,
    });

    if (!error) {
      setNewEntry({
        entry_date: new Date().toISOString().split("T")[0],
        meals_completed: 0,
        workouts_completed: 0,
        energy_level: 3,
        mood: "",
        sleep_hours: "",
        notes: "",
      });
      loadEntries();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Progress</h1>
          <div className="mt-8 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const latest = entries[0];
  const avgEnergy =
    entries.length > 0
      ? Math.round(
          (entries.reduce((acc, e) => acc + (Number(e.energy_level) || 0), 0) /
            entries.length) *
            10
        ) / 10
      : 0;
  const totalMeals = entries.reduce(
    (acc, e) => acc + (Number(e.meals_completed) || 0),
    0
  );
  const totalWorkouts = entries.reduce(
    (acc, e) => acc + (Number(e.workouts_completed) || 0),
    0
  );

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
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Log today
          </Button>
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
              <div className="text-xs text-muted-foreground">
                Across {entries.length} entries
              </div>
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
                <form onSubmit={addEntry} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <input
                      type="date"
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={newEntry.entry_date}
                      onChange={(e) => setNewEntry({ ...newEntry, entry_date: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meals completed</label>
                      <input
                        type="number"
                        min="0"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newEntry.meals_completed}
                        onChange={(e) => setNewEntry({ ...newEntry, meals_completed: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Workouts completed</label>
                      <input
                        type="number"
                        min="0"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newEntry.workouts_completed}
                        onChange={(e) => setNewEntry({ ...newEntry, workouts_completed: Number(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Energy level (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newEntry.energy_level}
                        onChange={(e) => setNewEntry({ ...newEntry, energy_level: Number(e.target.value) || 3 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sleep (hours)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newEntry.sleep_hours}
                        onChange={(e) => setNewEntry({ ...newEntry, sleep_hours: e.target.value })}
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
                          onClick={() =>
                            setNewEntry({ ...newEntry, mood: mood })
                          }
                          className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                            newEntry.mood === mood
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-input hover:bg-muted"
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
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
                            {new Date(entry.entry_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </div>
                          <Badge variant="outline" size="sm">
                            {entry.energy_level}/5
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.meals_completed} meals • {entry.workouts_completed} workouts
                        </div>
                        {entry.mood && (
                          <div className="text-xs mt-1">{entry.mood}</div>
                        )}
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
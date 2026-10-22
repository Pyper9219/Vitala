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
  Flame,
  CheckCircle2,
  ShoppingCart,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export default function MealsPage() {
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMeal, setNewMeal] = useState({
    title: "",
    meal_type: "breakfast",
    ingredients: "",
    instructions: "",
    prep_time_minutes: 15,
    estimated_cost: "",
    currency: "KES",
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const { data } = await supabase
      .from("meal_plans")
      .select("*")
      .order("created_at", { ascending: false });

    setMealPlans(data ?? []);
    if (data?.length > 0 && !activePlanId) {
      setActivePlanId(data[0].id);
      loadMeals(data[0].id);
    }
    setLoading(false);
  };

  const loadMeals = async (planId: string) => {
    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("meal_plan_id", planId)
      .order("created_at");

    setMeals(data ?? []);
  };

  const createPlan = async () => {
    const { data } = await supabase
      .from("meal_plans")
      .insert([
        {
          plan_type: "day",
          start_date: new Date().toISOString().split("T")[0],
          data: {},
          title: `Meal plan - ${new Date().toLocaleDateString()}`,
        },
      ])
      .select()
      .single();

    if (data) {
      setMealPlans([data, ...mealPlans]);
      setActivePlanId(data.id);
      loadMeals(data.id);
    }
  };

  const addMeal = async (e: FormDataEvent) => {
    e.preventDefault();
    if (!activePlanId) return;

    const { error } = await supabase.from("meals").insert({
      meal_plan_id: activePlanId,
      title: newMeal.title,
      meal_type: newMeal.meal_type,
      ingredients: newMeal.ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      instructions: newMeal.instructions.split("\n").filter(Boolean),
      prep_time_minutes: Number(newMeal.prep_time_minutes) || 15,
      estimated_cost: Number(newMeal.estimated_cost) || 0,
      currency: newMeal.currency,
      completed: false,
    });

    if (!error) {
      setNewMeal({
        title: "",
        meal_type: "breakfast",
        ingredients: "",
        instructions: "",
        prep_time_minutes: 15,
        estimated_cost: "",
        currency: "KES",
      });
      loadMeals(activePlanId);
    }
  };

  const toggleMeal = async (id: string, completed: boolean) => {
    await supabase
      .from("meals")
      .update({ completed: !completed, completed_at: new Date().toISOString() })
      .eq("id", id);
    loadMeals(activePlanId!);
  };

  const deleteMeal = async (id: string) => {
    if (!confirm("Delete this meal?")) return;
    await supabase.from("meals").delete().eq("id", id);
    loadMeals(activePlanId!);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Meal Planner</h1>
          <div className="mt-8 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4 mt-2" />
          </div>
        </div>
      </div>
    );
  }

  const activePlan = mealPlans.find((p) => p.id === activePlanId);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Meal Planner</h1>
            <p className="text-muted-foreground mt-2">
              Plan your meals and track what you eat.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={createPlan}>
              <Plus className="mr-2 h-4 w-4" /> New plan
            </Button>
          </div>
        </div>

        {/* Plan selector */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-hide">
          {mealPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => {
                setActivePlanId(plan.id);
                loadMeals(plan.id);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activePlanId === plan.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:bg-muted"
              }`}
            >
              {plan.title || plan.start_date}
            </button>
          ))}
        </div>

        {activePlanId ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Meal list */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle>
                    {MEAL_TYPES.map((t) => (
                      <Badge
                        key={t}
                        variant={
                          meals.some((m) => m.meal_type === t) ? "default" : "outline"
                        }
                        className="mr-2"
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Badge>
                    ))}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setNewMeal({...newMeal, meal_type: "breakfast"})}>
                    Add meal
                  </Button>
                </CardHeader>
                <CardContent>
                  {meals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No meals in this plan yet. Add your first meal below.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-background group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{meal.title}</div>
                              <Badge variant="outline" size="sm">
                                {meal.meal_type}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {meal.prep_time_minutes} min prep •
                              {meal.estimated_cost} {meal.currency}
                            </div>
                            {meal.ingredients && (
                              <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                {Array.isArray(meal.ingredients)
                                  ? meal.ingredients.join(", ")
                                  : meal.ingredients}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleMeal(meal.id, meal.completed)}
                              className="text-sm hover:text-primary"
                            >
                              {meal.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteMeal(meal.id); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Add meal form */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Add a meal</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={addMeal} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meal title</label>
                      <input
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newMeal.title}
                        onChange={(e) => setNewMeal({ ...newMeal, title: e.target.value })}
                        placeholder="e.g. Oatmeal with fruit"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meal type</label>
                      <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newMeal.meal_type}
                        onChange={(e) => setNewMeal({ ...newMeal, meal_type: e.target.value as any })}
                      >
                        {MEAL_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ingredients (comma separated)</label>
                      <input
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newMeal.ingredients}
                        onChange={(e) => setNewMeal({ ...newMeal, ingredients: e.target.value })}
                        placeholder="e.g. oats, milk, banana, honey"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Instructions (one per line)</label>
                      <textarea
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newMeal.instructions}
                        onChange={(e) => setNewMeal({ ...newMeal, instructions: e.target.value })}
                        placeholder="e.g. Boil water\nAdd oats\nSimmer 5 min"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Prep time (min)</label>
                        <input
                          type="number"
                          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={newMeal.prep_time_minutes}
                          onChange={(e) => setNewMeal({ ...newMeal, prep_time_minutes: Number(e.target.value) || 15 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Est. cost</label>
                        <input
                          type="number"
                          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={newMeal.estimated_cost}
                          onChange={(e) => setNewMeal({ ...newMeal, estimated_cost: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Add meal
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No meal plans yet. Create your first plan to get started.</p>
            <Button onClick={createPlan} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Create plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
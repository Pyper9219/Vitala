"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import Link from "next/link";
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
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("vitala_session")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return payload.id ?? null;
}

interface MealPlan {
  id: string;
  user_id: string;
  plan_type: string;
  start_date: string;
  title: string;
  data: any;
  is_favorite: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Meal {
  id: string;
  meal_plan_id: string;
  meal_type: string;
  title: string;
  description: string | null;
  ingredients: any;
  instructions: any;
  prep_time_minutes: number;
  servings: number | null;
  estimated_cost: number;
  currency: string;
  nutrition_estimate: any;
  completed: boolean;
  completed_at: Date | null;
  created_at: Date;
}

async function getMealPlans(userId: string): Promise<MealPlan[]> {
  const res = await query(
    "SELECT * FROM meal_plans WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return res.rows as MealPlan[];
}

async function getMeals(planId: string): Promise<Meal[]> {
  const res = await query(
    `SELECT m.* FROM meals m
     JOIN meal_plans mp ON m.meal_plan_id = mp.id
     WHERE mp.id = $1 AND mp.user_id = (SELECT user_id FROM users WHERE id = (SELECT user_id FROM meal_plans WHERE id = $1 LIMIT 1))
     ORDER BY m.created_at`,
    [planId]
  );
  return res.rows as Meal[];
}

export async function createPlan(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }
  const today = new Date().toISOString().split("T")[0];
  await query(
    `INSERT INTO meal_plans (user_id, plan_type, start_date, title, data, is_favorite)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, "day", today, `Meal plan - ${today}`, "{}", false]
  );
}

export async function addMeal(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }
  const mealPlanId = formData.get("meal_plan_id") as string;
  const title = (formData.get("title") as string) || "";
  const meal_type = (formData.get("meal_type") as string) || "breakfast";
  const ingredientsRaw = (formData.get("ingredients") as string) || "";
  const instructionsRaw = (formData.get("instructions") as string) || "";
  const prep_time_minutes = Number(formData.get("prep_time_minutes")) || 15;
  const estimated_cost = Number(formData.get("estimated_cost")) || 0;
  const currency = (formData.get("currency") as string) || "KES";

  const ingredients = ingredientsRaw.split(",").map((i) => i.trim()).filter(Boolean);
  const instructions = instructionsRaw.split("\n").filter(Boolean);

  // Verify plan ownership before inserting
  const plan = await query(
    "SELECT user_id FROM meal_plans WHERE id = $1",
    [mealPlanId]
  );
  if (plan.rowCount === 0 || plan.rows[0].user_id !== userId) {
    return;
  }

  await query(
    `INSERT INTO meals (meal_plan_id, meal_type, title, description, ingredients, instructions, prep_time_minutes, estimated_cost, currency, completed)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)`,
    [
      mealPlanId,
      meal_type,
      title,
      null,
      JSON.stringify(ingredients),
      JSON.stringify(instructions),
      prep_time_minutes,
      estimated_cost,
      currency,
    ]
  );
}

export async function toggleMeal(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }
  const id = formData.get("id") as string;
  const completed = formData.get("completed") === "true";
  await query(
    `UPDATE meals SET completed = $1, completed_at = CASE WHEN $1 THEN NOW() ELSE NULL END WHERE id = $2`,
    [completed, id]
  );
}

export async function deleteMeal(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }
  const id = formData.get("id") as string;
  await query("DELETE FROM meals WHERE id = $1", [id]);
}

export default async function MealsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const mealPlans = await getMealPlans(userId);
  let activePlanId = mealPlans[0]?.id ?? null;
  let meals: Meal[] = [];
  if (activePlanId) {
    meals = await getMeals(activePlanId);
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
            <form action={createPlan}>
              <Button type="submit" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> New plan
              </Button>
            </form>
          </div>
        </div>

        {mealPlans.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No meal plans yet. Create your first plan to get started.</p>
            <form action={createPlan}>
              <Button type="submit" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Create plan
              </Button>
            </form>
          </div>
        ) : (
          <>
            {/* Plan selector */}
            <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-hide">
              {mealPlans.map((plan) => (
                <form key={plan.id} action={createPlan} style={{ display: "inline" }}>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      activePlanId === plan.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:bg-muted"
                    }`}
                  >
                    {plan.title || plan.start_date}
                  </button>
                </form>
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
                      <form action={addMeal}>
                        <input type="hidden" name="meal_plan_id" value={activePlanId} />
                        <Button type="submit" variant="outline" size="sm">
                          Add meal
                        </Button>
                      </form>
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
                                  <Badge variant="outline">{meal.meal_type}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {meal.prep_time_minutes} min prep •
                                  {meal.estimated_cost} {meal.currency}
                                </div>
                                {meal.ingredients && (
                                  <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                    {Array.isArray(meal.ingredients)
                                      ? meal.ingredients.join(", ")
                                      : typeof meal.ingredients === "string"
                                      ? JSON.parse(meal.ingredients).join(", ")
                                      : meal.ingredients}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <form action={toggleMeal} style={{ display: "contents" }}>
                                  <input type="hidden" name="id" value={meal.id} />
                                  <input type="hidden" name="completed" value={String(meal.completed)} />
                                  <Button type="submit" variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {meal.completed ? (
                                      <CheckCircle2 className="h-4 w-4 text-primary" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </Button>
                                </form>
                                <form action={deleteMeal} style={{ display: "inline" }}>
                                  <input type="hidden" name="id" value={meal.id} />
                                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </form>
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
                      <form action={addMeal} className="space-y-4">
                        <input type="hidden" name="meal_plan_id" value={activePlanId} />
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Meal title</label>
                          <input
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            name="title"
                            placeholder="e.g. Oatmeal with fruit"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Meal type</label>
                          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" name="meal_type">
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
                            name="ingredients"
                            placeholder="e.g. oats, milk, banana, honey"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Instructions (one per line)</label>
                          <textarea
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            name="instructions"
                            placeholder="e.g. Boil water\nAdd oats\nSimmer 5 min"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Prep time (min)</label>
                            <input
                              type="number"
                              name="prep_time_minutes"
                              className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              defaultValue="15"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Est. cost</label>
                            <input
                              type="number"
                              name="estimated_cost"
                              className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              defaultValue="0"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Currency</label>
                          <input
                            type="text"
                            name="currency"
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            defaultValue="KES"
                          />
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
                <form action={createPlan}>
                  <Button type="submit" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Create plan
                  </Button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

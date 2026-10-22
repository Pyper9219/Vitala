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
  CheckCircle2,
  Clock,
  Plus,
  ShoppingCart,
  TrendingUp,
  Activity,
  Calendar,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [meals, setMeals] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [shoppingItems, setShoppingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [mRes, wRes, sRes] = await Promise.all([
        supabase
          .from("meals")
          .select("*, meal_plan_id")
          .eq("completed", false)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("workouts")
          .select("*")
          .eq("completed", false)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("shopping_items")
          .select("*")
          .eq("purchased", false)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setMeals(mRes.data ?? []);
      setWorkouts(wRes.data ?? []);
      setShoppingItems(sRes.data ?? []);
      setLoading(false);
    };

    loadData();
  }, []);

  const mealsCompleted = meals.filter((m) => m.completed).length;
  const workoutsCompleted = workouts.filter((w) => w.completed).length;
  const shoppingPurchased = shoppingItems.filter((s) => s.purchased).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Your wellness overview for today.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="/meals">New meal plan</Link>
                </Button>
                <Button asChild>
                  <Link href="/workouts">New workout</Link>
                </Button>
              </div>
            </div>

            <SkeletonGrid className="grid md:grid-cols-3 gap-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Your wellness overview for today.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/meals">New meal plan</Link>
              </Button>
              <Button asChild>
                <Link href="/workouts">New workout</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Meals today</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{meals.length}</div>
                  <div className="text-xs text-muted-foreground">
                    {mealsCompleted} completed
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Workouts today</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{workouts.length}</div>
                  <div className="text-xs text-muted-foreground">
                    {workoutsCompleted} completed
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shopping items</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{shoppingItems.length}</div>
                  <div className="text-xs text-muted-foreground">
                    {shoppingPurchased} purchased
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Consistency</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {Math.round(
                      ((mealsCompleted + workoutsCompleted) /
                        Math.max(meals.length + workouts.length, 1)) *
                        100
                    )}%
                  </div>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's meals */}
          <section className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle>Today's meals</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/meals">View all</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {meals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No meals planned for today.
                      <br />
                      <Link href="/meals" className="text-primary hover:underline">
                        Create a meal plan
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-background"
                        >
                          <div>
                            <div className="font-medium">{meal.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {meal.meal_type} • {meal.prep_time_minutes} min prep
                            </div>
                          </div>
                          <Badge variant="outline">
                            {meal.completed ? "Done" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Today's workout */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle>Today's movement</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/workouts">View all</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {workouts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No workouts scheduled.
                      <br />
                      <Link href="/workouts" className="text-primary hover:underline">
                        Add a workout
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border flex items-center gap-4">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{workouts[0].title}</div>
                        <div className="text-xs text-muted-foreground">
                          {workouts[0].duration_minutes} min
                        </div>
                      </div>
                      <Badge variant="outline">
                        {workouts[0].completed ? "Done" : "Pending"}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shopping list quick view */}
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle>Shopping list</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/shopping">View all</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {shoppingItems.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No items on your list.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shoppingItems.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-lg border bg-background"
                        >
                          <div className="text-sm">{item.name}</div>
                          <Badge variant="outline" size="sm">
                            {item.purchased ? "✓" : "○"}
                          </Badge>
                        </div>
                      ))}
                      {shoppingItems.length > 5 && (
                        <div className="text-center text-xs text-muted-foreground mt-2">
                          +{shoppingItems.length - 5} more
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Quick actions */}
          <section className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full h-auto p-2 text-left text-sm" asChild>
                    <Link href="/meals">Log meal <Plus className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outline" className="w-full h-auto p-2 text-left text-sm" asChild>
                    <Link href="/workouts">Log workout <Activity className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outline" className="w-full h-auto p-2 text-left text-sm" asChild>
                    <Link href="/shopping">Shopping list <ShoppingCart className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outline" className="w-full h-auto p-2 text-left text-sm" asChild>
                    <Link href="/progress">Progress <Flame className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid({ className }: { className?: string }) {
  return (
    <div className={className}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border bg-card p-6 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-4" />
          <div className="h-24 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  Clock,
  Plus,
  ShoppingCart,
  TrendingUp,
  Activity,
  UtensilsCrossed,
  Dumbbell,
  Flame,
  ChevronRight,
} from "lucide-react";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("vitala_session")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const users = await query("SELECT id, email, name FROM users WHERE id = $1", [payload.id]);
  return users.rows[0] ?? null;
}

export default async function Dashboard() {
  const user = await getCurrentUser();
  const userId = user?.id ?? "";
  const userName = user?.name || "there";

  const [mealsRes, workoutsRes, shoppingRes] = await Promise.all([
    query(
      "SELECT id, title, meal_type, prep_time_minutes, completed FROM meals ORDER BY created_at DESC LIMIT 5",
    ),
    query(
      "SELECT id, title, duration_minutes, completed FROM workouts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
      [userId],
    ),
    query(
      "SELECT id, name, purchased FROM shopping_items WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
      [userId],
    ),
  ]);

  const meals = mealsRes.rows;
  const workouts = workoutsRes.rows;
  const shoppingItems = shoppingRes.rows;
  const mealsDone = meals.filter((m: any) => m.completed).length;
  const workoutsDone = workouts.filter((w: any) => w.completed).length;
  const shoppingDone = shoppingItems.filter((s: any) => s.purchased).length;
  const consistency = Math.round(
    ((mealsDone + workoutsDone) / Math.max(meals.length + workouts.length, 1)) * 100,
  );

  const statCards = [
    {
      label: "Meals today",
      value: meals.length,
      sub: `${mealsDone} completed`,
      icon: UtensilsCrossed,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Workouts",
      value: workouts.length,
      sub: `${workoutsDone} completed`,
      icon: Dumbbell,
      color: "from-cyan-500 to-blue-500",
    },
    {
      label: "Shopping",
      value: shoppingItems.length,
      sub: `${shoppingDone} purchased`,
      icon: ShoppingCart,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Consistency",
      value: `${consistency}%`,
      sub: "This week",
      icon: TrendingUp,
      color: "from-violet-500 to-purple-500",
    },
  ];

  const mealColors: Record<string, string> = {
    breakfast: "bg-amber-100 text-amber-700",
    lunch: "bg-emerald-100 text-emerald-700",
    dinner: "bg-indigo-100 text-indigo-700",
    snack: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Hey, {userName} 👋</h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s your wellness overview for today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/meals"
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4" /> New meal
            </Link>
            <Link
              href="/workouts"
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4" /> New workout
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-5 card-hover">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md mb-3`}
              >
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-emerald-500" /> Today&apos;s meals
              </h2>
              <Link
                href="/meals"
                className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:underline"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-5">
              {meals.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No meals planned yet.</p>
                  <Link
                    href="/meals"
                    className="text-emerald-600 text-sm font-medium hover:underline mt-2 inline-block"
                  >
                    Create a meal plan →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {meals.map((meal: any) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 rounded-xl border bg-background/50 hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${meal.completed ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                        />
                        <div>
                          <div
                            className={`font-medium text-sm ${meal.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {meal.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${mealColors[meal.meal_type] || "bg-gray-100 text-gray-600"}`}
                            >
                              {meal.meal_type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {meal.prep_time_minutes} min
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${meal.completed ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}
                      >
                        {meal.completed ? "✓ Done" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-bold flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-cyan-500" /> Movement
                </h2>
                <Link
                  href="/workouts"
                  className="text-sm text-emerald-600 font-medium hover:underline"
                >
                  All
                </Link>
              </div>
              <div className="p-5">
                {workouts.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">No workouts scheduled.</p>
                    <Link
                      href="/workouts"
                      className="text-emerald-600 text-sm font-medium hover:underline mt-2 inline-block"
                    >
                      Add a workout →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workouts.slice(0, 3).map((w: any) => (
                      <div
                        key={w.id}
                        className="flex items-center gap-3 p-3 rounded-xl border bg-background/50"
                      >
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{w.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {w.duration_minutes} min
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${w.completed ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}
                        >
                          {w.completed ? "✓" : "•"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-amber-500" /> Shopping
                </h2>
                <Link
                  href="/shopping"
                  className="text-sm text-emerald-600 font-medium hover:underline"
                >
                  All
                </Link>
              </div>
              <div className="p-5">
                {shoppingItems.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    No items on your list.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {shoppingItems.slice(0, 5).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between py-1.5">
                        <span
                          className={`text-sm ${item.purchased ? "line-through text-muted-foreground" : ""}`}
                        >
                          {item.name}
                        </span>
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.purchased ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30"}`}
                        >
                          {item.purchased && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </span>
                      </div>
                    ))}
                    {shoppingItems.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        +{shoppingItems.length - 5} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-bold text-lg mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                href: "/meals",
                label: "Log meal",
                icon: UtensilsCrossed,
                color: "from-emerald-500 to-teal-500",
              },
              {
                href: "/workouts",
                label: "Log workout",
                icon: Activity,
                color: "from-cyan-500 to-blue-500",
              },
              {
                href: "/shopping",
                label: "Shopping list",
                icon: ShoppingCart,
                color: "from-amber-500 to-orange-500",
              },
              {
                href: "/progress",
                label: "View progress",
                icon: Flame,
                color: "from-rose-500 to-pink-500",
              },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group rounded-2xl border bg-card p-4 flex items-center gap-3 card-hover"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                >
                  <a.icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-sm">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

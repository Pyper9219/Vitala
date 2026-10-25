"use server";

import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  ShoppingCart,
  CheckCircle2,
  Trash2,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { id: "produce", label: "Produce" },
  { id: "dairy", label: "Dairy" },
  { id: "meat", label: "Meat & Fish" },
  { id: "pantry", label: "Pantry" },
  { id: "bakery", label: "Bakery" },
  { id: "household", label: "Household" },
];

const UNITS = ["pcs", "kg", "g", "litres", "ml", "cups", "tbsp", "tsp", "packets"];

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("vitala_session")?.value;
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    if (!payload) return null;
    return payload.id;
  } catch {
    return null;
  }
}

interface ShoppingItem {
  id: string;
  user_id: string;
  meal_plan_id: string | null;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimated_cost: number;
  currency: string;
  purchased: boolean;
  created_at: string;
}

async function getShoppingItems(userId: string): Promise<ShoppingItem[]> {
  const res = await query<ShoppingItem>(
    `SELECT id, user_id, meal_plan_id, name, category, quantity, unit, estimated_cost, currency, purchased, created_at
     FROM shopping_items
     WHERE user_id = $1
     ORDER BY purchased ASC, created_at DESC`,
    [userId]
  );
  return res.rows;
}

async function addShoppingItem(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "produce").trim();
  const quantity = Number(formData.get("quantity")) || 1;
  const unit = String(formData.get("unit") ?? "pcs").trim();
  const estimated_cost = Number(formData.get("estimated_cost")) || 0;

  if (!name) {
    return;
  }

  await query(
    `INSERT INTO shopping_items (user_id, name, category, quantity, unit, estimated_cost, purchased, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [userId, name, category, quantity, unit, estimated_cost, false]
  );
}

async function toggleShoppingItem(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const purchased = String(formData.get("purchased") ?? "") === "true";
  const userId = await getCurrentUserId();
  if (!userId) return;
  await query(
    `UPDATE shopping_items SET purchased = $1 WHERE id = $2 AND user_id = $3`,
    [!purchased, id, userId]
  );
}

async function deleteShoppingItem(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const userId = await getCurrentUserId();
  if (!userId) return;
  await query(`DELETE FROM shopping_items WHERE id = $1 AND user_id = $2`, [id, userId]);
}

export default async function ShoppingPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const items = await getShoppingItems(userId);

  const purchasedItems = items.filter((i) => i.purchased);
  const pendingItems = items.filter((i) => !i.purchased);
  const totalCost = items.reduce(
    (acc, item) => acc + (Number(item.estimated_cost) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Shopping List</h1>
            <p className="text-muted-foreground mt-2">
              Track what you need to buy.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add item
          </Button>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total items</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{items.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Purchased</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{purchasedItems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pending</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{pendingItems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Est. total</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">KES {totalCost}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Shopping list */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>Items to buy</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {pendingItems.length} pending
                  </Badge>
                  <Badge variant="outline">
                    {purchasedItems.length} done
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {pendingItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-primary opacity-50" />
                    <p>All items purchased!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-background group"
                      >
                        <div className="flex items-center gap-3">
                          <form action={toggleShoppingItem} className="inline">
                            <input type="hidden" name="id" value={item.id} />
                            <input
                              type="hidden"
                              name="purchased"
                              value={String(item.purchased)}
                            />
                            <button
                              className="w-5 h-5 rounded-full border border-input flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          </form>
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.quantity} {item.unit} • {item.category}
                            </div>
                            {item.estimated_cost && (
                              <div className="text-xs text-muted-foreground">
                                KES {item.estimated_cost}
                              </div>
                            )}
                          </div>
                        </div>
                        <form action={deleteShoppingItem} className="inline" onSubmit={(e) => { if (!confirm("Delete this item?")) e.preventDefault(); }}>
                          <input type="hidden" name="id" value={item.id} />
                          <Button variant="ghost" size="sm" type="submit">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Purchased items */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>Purchased</CardTitle>
              </CardHeader>
              <CardContent>
                {purchasedItems.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Nothing purchased yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {purchasedItems.map((item) => (
                      <div key={item.id} className="p-2 rounded-lg border bg-muted/50">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-sm line-through text-muted-foreground">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add item form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Add item</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={addShoppingItem} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Item name</label>
                    <input
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      name="name"
                      placeholder="e.g. Bananas"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      name="category"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Qty</label>
                      <input
                        type="number"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        name="quantity"
                        defaultValue="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unit</label>
                      <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        name="unit"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Est. cost</label>
                      <input
                        type="number"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        name="estimated_cost"
                        defaultValue="0"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Add item
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

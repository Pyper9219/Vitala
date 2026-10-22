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
  ShoppingCart,
  CheckCircle2,
  Trash2,
  Edit2,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ShoppingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "produce",
    quantity: "",
    unit: "pcs",
    estimated_cost: "",
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data } = await supabase
      .from("shopping_items")
      .select("*")
      .order("purchased", { ascending: true })
      .order("created_at", { ascending: false });

    setItems(data ?? []);
    setLoading(false);
  };

  const addItem = async (e: FormDataEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("shopping_items").insert({
      name: newItem.name,
      category: newItem.category,
      quantity: Number(newItem.quantity) || 1,
      unit: newItem.unit,
      estimated_cost: Number(newItem.estimated_cost) || 0,
      purchased: false,
    });

    if (!error) {
      setNewItem({
        name: "",
        category: "produce",
        quantity: "",
        unit: "pcs",
        estimated_cost: "",
      });
      loadItems();
    }
  };

  const toggleItem = async (id: string, purchased: boolean) => {
    await supabase
      .from("shopping_items")
      .update({ purchased: !purchased })
      .eq("id", id);
    loadItems();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("shopping_items").delete().eq("id", id);
    loadItems();
  };

  const CATEGORIES = [
    { id: "produce", label: "Produce" },
    { id: "dairy", label: "Dairy" },
    { id: "meat", label: "Meat & Fish" },
    { id: "pantry", label: "Pantry" },
    { id: "bakery", label: "Bakery" },
    { id: "household", label: "Household" },
  ];

  const UNITS = ["pcs", "kg", "g", "litres", "ml", "cups", "tbsp", "tsp", "packets"];

  const purchasedItems = items.filter((i) => i.purchased);
  const pendingItems = items.filter((i) => !i.purchased);
  const totalCost = items.reduce(
    (acc, item) => acc + (Number(item.estimated_cost) || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Shopping List</h1>
          <div className="mt-8 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

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
                          <button
                            onClick={() => toggleItem(item.id, item.purchased)}
                            className="w-5 h-5 rounded-full border border-input flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
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
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                <form onSubmit={addItem} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Item name</label>
                    <input
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g. Bananas"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
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
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unit</label>
                      <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value as any })}
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
                        value={newItem.estimated_cost}
                        onChange={(e) => setNewItem({ ...newItem, estimated_cost: e.target.value })}
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
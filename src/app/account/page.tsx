"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  LogOut,
  Settings,
  Edit,
} from "lucide-react";

export default function AccountPage() {
  const supabase = createBrowserClient();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data || { id: user.id, email: user.email });
    setFormData({ ...(data || {}), email: user.email });
  }

  async function handleSave(e: FormDataEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      await supabase.auth.updateUser({
        email: formData.email,
      });

      setEditing(false);
      await loadProfile();
    } catch (err) {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">
                    {profile.display_name || "No display name"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {profile.email || "No email"}
                  </p>
                </div>
                {editing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit profile
                  </Button>
                )}
              </div>

              {editing && (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, display_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone_number || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone_number: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Sign out</h3>
                  <p className="text-sm text-muted-foreground">
                    Log out of your Vitala account
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
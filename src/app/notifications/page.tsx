"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  ShieldCheck,
} from "lucide-react";

type Channel = "in_app" | "email" | "sms" | "whatsapp";

interface ChannelSetting {
  id: Channel;
  label: string;
  description: string;
  icon: React.ElementType;
  requiresPhone: boolean;
}

const CHANNELS: ChannelSetting[] = [
  {
    id: "in_app",
    label: "In-app notifications",
    description: "Receive alerts inside the Vitala app.",
    icon: Bell,
    requiresPhone: false,
  },
  {
    id: "email",
    label: "Email notifications",
    description: "Get reminders and updates via email.",
    icon: Mail,
    requiresPhone: false,
  },
  {
    id: "sms",
    label: "SMS reminders",
    description: "Receive text message reminders for meals and workouts.",
    icon: Phone,
    requiresPhone: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp reminders",
    description: "Get WhatsApp messages for check-ins and progress.",
    icon: MessageCircle,
    requiresPhone: true,
  },
];

export default function NotificationsPage() {
  const [enabled, setEnabled] = useState(true);
  const [phone, setPhone] = useState("");
  const [channels, setChannels] = useState<Channel[]>(["in_app"]);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [frequency, setFrequency] = useState("daily");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleChannel = (id: Channel) => {
    setChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: FormDataEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Notification preferences updated",
          body: "Your Vitala notification settings have been saved.",
          channel: "in_app",
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">Notification Settings</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard">Back to dashboard</a>
          </Button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        {/* Master toggle */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>
                Enable or disable all Vitala reminders and alerts.
              </CardDescription>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              className={`peer ${enabled ? "primary" : ""}`}
            />
          </CardHeader>
        </Card>

        {/* Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery channels</CardTitle>
            <CardDescription>
              Choose how you'd like to receive reminders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CHANNELS.map((ch) => {
                const active = channels.includes(ch.id);
                const disabled = ch.requiresPhone && !phone;
                return (
                  <div
                    key={ch.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <ch.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{ch.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {ch.description}
                      </div>
                    </div>
                    <Switch
                      checked={active}
                      onCheckedChange={() => toggleChannel(ch.id)}
                      disabled={disabled || !enabled}
                    />
                    {disabled && (
                      <span className="text-xs text-muted-foreground">
                        Phone number required
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Phone number */}
        {(
          channels.includes("sms") || channels.includes("whatsapp")
        ) && (
          <Card>
            <CardHeader>
              <CardTitle>Phone number</CardTitle>
              <CardDescription>
                Required for SMS and WhatsApp reminders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground text-sm">+254</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="712345678"
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiet hours */}
        <Card>
          <CardHeader>
            <CardTitle>Quiet hours</CardTitle>
            <CardDescription>
              No notifications will be sent during this window.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">From</label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">To</label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reminder frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Reminder frequency</CardTitle>
            <CardDescription>
              How often you'd like to receive check-in reminders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { value: "daily", label: "Daily", desc: "Every day" },
                { value: "weekdays", label: "Weekdays", desc: "Monday to Friday" },
                { value: "weekly", label: "Weekly", desc: "Once per week" },
              ].map((f) => (
                <label
                  key={f.value}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={f.value}
                    checked={frequency === f.value}
                    onChange={() => setFrequency(f.value)}
                    className="peer h-4 w-4 rounded-full border-primary"
                  />
                  <div>
                    <div className="font-medium text-sm">{f.label}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? "Saving..." : "Save preferences"}
        </Button>
        {saved && (
          <p className="text-sm text-green-600 text-center">
            Preferences saved successfully.
          </p>
        )}
      </div>
    </div>
  );
}
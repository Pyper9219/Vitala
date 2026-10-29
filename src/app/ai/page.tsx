"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageCircle,
  Sparkles,
  Send,
  StopCircle,
  Copy,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";

export default function AIPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Vitala wellness assistant. I can help you generate meal plans, workout routines, shopping lists, and answer wellness questions. What would you like to work on today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef?.scrollIntoView({ behavior: "smooth" });
  }, [messages, scrollRef]);

  const sendMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages([...messages, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages([
        ...messages,
        { role: "user", content: userMessage },
        { role: "assistant", content: data.reply || "Sorry, I couldn't generate a response." },
      ]);
    } catch (err) {
      setMessages([
        ...messages,
        { role: "user", content: userMessage },
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">Vitala AI</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard">Back to dashboard</a>
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">Wellness Assistant</h1>
        <p className="text-muted-foreground mb-8">
          Get AI-generated meal plans, workouts, and wellness advice tailored to you.
        </p>

        {/* Chat area */}
        <div className="flex h-[600px] flex-col lg:h-[700px]">
          <Card className="flex-1 flex flex-col border">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <MessageCircle className="h-5 w-5" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground text-right"
                        : "bg-card border text-card-foreground"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="ghost" size="sm" onClick={() => copyMessage(msg.content)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="w-[40px] h-[40px] rounded-full bg-muted flex items-center justify-center shrink-0">
                    <StopCircle className="h-5 w-5 text-muted-foreground animate-spin" />
                  </div>
                  <div className="bg-card border p-4 rounded-2xl animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              )}
              <div ref={setScrollRef} />
            </div>

            <Card className="border-t p-4">
              <form onSubmit={sendMessage} className="flex gap-2">
                <div className="flex-1">
                  <textarea
                    className="w-full resize-none border-none bg-transparent focus-visible:outline-none text-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me about meals, workouts, or wellness..."
                    rows={1}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading} className="whitespace-nowrap">
                  {loading ? "Sending..." : "Send"}
                </Button>
              </form>
            </Card>
          </Card>
        </div>

        {/* Quick prompts */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "7-day meal plan",
              prompt: "Create a 7-day vegetarian meal plan with a shopping list.",
            },
            {
              label: "Beginner workout",
              prompt: "Design a 3-day beginner workout routine I can do at home with no equipment.",
            },
            {
              label: "Healthy snack ideas",
              prompt: "Give me 10 quick, healthy snack ideas under 200 calories.",
            },
            {
              label: "Wellness tips",
              prompt: "Share 5 science-backed tips for better sleep and energy.",
            },
          ].map(({ label, prompt }) => (
            <button
              key={label}
              onClick={() => setInput(prompt)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card text-card-foreground hover:bg-muted transition-colors"
            >
              <Sparkles className="h-5 w-5 text-primary mb-1" />
              <span className="text-sm font-medium text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

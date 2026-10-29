"use client";

import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

const columns = [
  { title: "Product", links: [{ href: "/dashboard", label: "Dashboard" }, { href: "/meals", label: "Meal Plans" }, { href: "/workouts", label: "Workouts" }, { href: "/subscription", label: "Pricing" }] },
  { title: "Company", links: [{ href: "/help", label: "Help Center" }, { href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }, { href: "/disclaimer", label: "Health Disclaimer" }] },
];

export default function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-md"><Sparkles className="h-4 w-4 text-white" /></div>
              <span className="font-extrabold text-xl"><span className="text-emerald-600">Vital</span>a</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">Build healthier habits with personalized meal plans, workouts, and reminders.</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-semibold text-sm mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (<li key={l.href}><Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Vitala. All rights reserved.</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">Made with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> in Kenya</p>
        </div>
      </div>
    </footer>
  );
}

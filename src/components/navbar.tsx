"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/meals", label: "Meals" },
  { href: "/workouts", label: "Workouts" },
  { href: "/shopping", label: "Shopping" },
  { href: "/progress", label: "Progress" },
];

const Navbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
      <nav
        ref={ref}
        className={`sticky top-0 z-50 w-full glass border-b ${className || ""}`}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              <span className="text-emerald-600">Vital</span>
              <span className="text-foreground">a</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              Get started
            </Link>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-xl animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 border-t space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-3 py-2.5 rounded-lg text-sm font-medium border hover:bg-muted transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  },
);
Navbar.displayName = "Navbar";
export { Navbar };

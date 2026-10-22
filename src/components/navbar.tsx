"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Plus, Bell, Settings, LogOut, User } from "lucide-react";
import { Link } from "@/components/ui/link";

const Navbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight">Vitala</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/meals">Meals</Link>
            <Link href="/workouts">Workouts</Link>
            <Link href="/shopping">Shopping</Link>
            <Link href="/progress">Progress</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/account" className="text-sm font-medium hover:text-primary">
              Account
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-primary md:hidden"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="hidden md:flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>
    );
  }
);
Navbar.displayName = "Navbar";

export { Navbar };

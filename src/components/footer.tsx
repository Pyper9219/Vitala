"use client";

import Link from "next/link";
import { Mail, Shield, Check } from "lucide-react";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Health Disclaimer" },
];

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between border-t pt-8 text-sm text-muted-foreground">
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Vitala</span>
            <span className="text-xs">Personalized Wellness Platform</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

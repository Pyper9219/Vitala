
import Link from "next/link";
import { Home, Zap, Utensils, Activity, TrendingUp } from "lucide-react";

const sidebarLinks = [
  { icon: Home, href: "/dashboard", label: "Dashboard" },
  { icon: Zap, href: "/ai", label: "AI Chat" },
  { icon: Utensils, href: "/meals", label: "Meals" },
  { icon: Activity, href: "/workouts", label: "Workouts" },
  { icon: TrendingUp, href: "/progress", label: "Progress" },
];

export default function Sidebar() {
  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r p-6 fixed h-full">
      <div className="mb-10">
        {/* Logo Placeholder - In a real app, you'd use a proper logo */}
        <div className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">V</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800 mt-2">Vitala</h1>
      </div>
      <nav className="flex-grow space-y-2">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t text-sm text-muted-foreground">
        <p>Wellness Assistant</p>
        <p className="mt-1 text-xs">Version 1.0</p>
      </div>
    </div>
  );
}

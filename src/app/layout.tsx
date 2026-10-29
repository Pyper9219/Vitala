import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Vitala",
    default: "Vitala — Personalized Wellness Platform",
  },
  description:
    "Build healthier habits with personalized meal plans, workouts, shopping lists, and reminders — all organized around your lifestyle.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    siteName: "Vitala",
    title: "Vitala — Personalized Wellness Platform",
    description:
      "Build healthier habits with personalized meal plans, workouts, shopping lists, and reminders.",
    type: "website",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vitala — Personalized Wellness Platform",
    description:
      "Build healthier habits with personalized meal plans, workouts, shopping lists, and reminders.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}

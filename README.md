# Vitala — Personalized Wellness Platform

A Next.js wellness app that helps users build healthier habits with personalized
meal plans, workout schedules, progress tracking, shopping lists, and timely
reminders (in-app, SMS, WhatsApp).

## Stack

- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Database/Auth:** Supabase (PostgreSQL + Auth + Row Level Security)
- **AI:** OpenAI (gpt-4o-mini) for the wellness assistant
- **Payments:** Stripe (cards) + M-Pesa (Kenya, placeholder)
- **Notifications:** Twilio (SMS/WhatsApp) — dev mode if credentials omitted
- **UI:** Custom shadcn-style components (Radix primitives) + lucide-react

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase URL/anon key at minimum. All other
services degrade gracefully (AI shows a setup message, notifications log to
console, M-Pesa is a placeholder).

### 3. Set up the database

Run `supabase/schema.sql` in your Supabase project's SQL Editor to create
tables, enable Row Level Security, and add indexes.

Required env vars for the app to work:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side admin ops) |

### 4. Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

## Project structure

```
src/
  app/
    layout.tsx            Root layout + metadata
    page.tsx              Landing page
    globals.css           Vitala brand tokens (light/dark)
    login/                Email/password + Google OAuth sign-in
    signup/               Account creation → onboarding
    auth/callback/        OAuth callback handler
    onboarding/           4-step profile/diet/fitness/reminders setup
    dashboard/            Today's meals, workouts, quick actions
    meals/                Meal planner + CRUD
    workouts/             Workout scheduler + CRUD
    shopping/             Shopping list (pending/purchased)
    progress/             Progress tracker + entry logging
    ai/                   AI wellness assistant chat
    api/ai/               OpenAI-backed assistant endpoint
    api/notifications/    Notification send endpoint
    api/stripe/checkout/  Stripe checkout sessions
    api/stripe/webhook/   Stripe webhook handler
    api/stripe/portal/    Stripe customer portal
    api/mpesa/payment/    M-Pesa payment placeholder
    api/mpesa/callback/   M-Pesa Daraja callback placeholder
    subscription/         Plan management (Free / Premium)
    notifications/        Notification settings (channels, quiet hours)
    account/              Profile + security settings
    privacy/              Privacy policy
    terms/                Terms of service
    disclaimer/           Health disclaimer
    help/                 Help center FAQ
  components/
    ui/                   shadcn-style primitives (button, input, card, etc.)
    logo.tsx              Vitala text + SVG mark
    navbar.tsx            Top navigation
    footer.tsx            Site footer
  lib/
    supabase.ts           Supabase client + admin client
    auth.ts               Server-side Supabase client (cookies)
    notifications.ts      In-app/email/SMS/WhatsApp sender
    payments.ts           Plan helpers + Premium activation
    stripe.ts             Stripe client + plan definitions
    utils.ts              cn() helper
supabase/
  schema.sql              Full database schema + RLS policies
.env.example              Environment variable template
```

## Features

- **Auth:** Email/password sign-in/sign-up, Google OAuth, protected routes
- **Onboarding:** 4-step setup capturing diet, budget, fitness, reminders
- **Meal planner:** Create day/week/month plans, add/edit meals, toggle complete
- **Workout planner:** Schedule workouts by category, mark complete
- **Dashboard:** Daily overview with meals, workouts, shopping quick view
- **Shopping list:** Add items, mark purchased, estimated totals in KES
- **Progress tracking:** Log daily entries (meals, workouts, energy, mood, sleep)
- **AI assistant:** Chat with an OpenAI-powered wellness coach
- **Notifications:** In-app, email, SMS, WhatsApp with quiet hours & frequency
- **Payments:** Free → Premium (KES 499/month) via Stripe; M-Pesa ready
- **Account:** Profile editing, email, phone, sign out
- **Legal:** Privacy policy, Terms of service, Health disclaimer, Help center

## Notes

- Stripe checkout is required for real Premium subscriptions. Without Stripe
  keys, the Premium plan can be activated instantly in dev mode.
- M-Pesa integration is a placeholder. Point `MPESA_CALLBACK_URL` at your
  deployed `/api/mpesa/callback` and add Daraja credentials to go live.
- All user data is protected by Supabase Row Level Security — users can only
  access their own rows.

## License

MIT
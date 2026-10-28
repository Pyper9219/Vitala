# Vitala — Personalized Wellness Platform

A Next.js wellness app that helps users build healthier habits with personalized
meal plans, workout schedules, progress tracking, shopping lists, and timely
reminders (in-app, SMS, WhatsApp).

## Stack

- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Database/Auth:** Neon PostgreSQL with application-managed JWT sessions
- **AI:** OpenAI (gpt-4o-mini) for the wellness assistant
- **Payments:** Stripe (cards) + M-Pesa (Kenya, placeholder)
- **Notifications:** Twilio (SMS/WhatsApp) — dev mode if credentials omitted
- **UI:** Custom shadcn-style components (Radix primitives) + lucide-react

## Quick start

### 1. Install dependencies

```bash
npm install
```

Use Node.js 22.6 or newer to run the included TypeScript database migration.

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set `DATABASE_URL` to your Neon connection string and
`JWT_SECRET` to a long, random secret. The remaining integrations are optional
for local development.

### 3. Set up the database

Run the Neon migration once against your database:

```bash
npm run db:migrate
```

This uses `DATABASE_URL` from `.env.local`. Use a Neon pooled connection string
with `sslmode=require`. The migration creates the tables and indexes used by the
app. Run it before deploying, and again after schema changes.

Required env vars for the app to work:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign and verify application sessions |

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
    login/                Email/password sign-in
    signup/               Account creation → onboarding
    auth/callback/        Authentication callback page
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
    db.ts                 Neon PostgreSQL query helper
    auth.ts               Password authentication + JWT sessions
    notifications.ts      In-app/email/SMS/WhatsApp sender
    payments.ts           Plan helpers + Premium activation
    stripe.ts             Stripe client + plan definitions
    utils.ts              cn() helper
scripts/
  migrate-neon.ts         Neon PostgreSQL schema migration
.env.example              Environment variable template
```

## Features

- **Auth:** Email/password sign-in/sign-up, JWT sessions, protected routes
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
- Database access uses server-side SQL queries and application-managed
  authentication. Keep `DATABASE_URL` and `JWT_SECRET` private.

## Deploy on Vercel

Vercel is the recommended host for this Next.js app (no Docker needed).

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import in Vercel

- Go to [vercel.com](https://vercel.com) → **Add New Project**.
- Import the `Pyper9219/Vitala` repository.
- Framework preset: **Next.js** (detected automatically).
- Build command: `npm run build`
- Output directory: `.next` (default)

### 3. Add environment variables

In **Vercel Project Settings → Environment Variables**, add the following
(copy names from `.env.example` and use real values):

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Neon pooled PostgreSQL URL with `sslmode=require` |
| `JWT_SECRET` | Yes | Long, random secret; do not expose it to the browser |
| `NEXT_PUBLIC_APP_URL` | Yes | Your production URL, e.g. `https://vitala.vercel.app` |
| `OPENAI_API_KEY` | No | AI assistant falls back to a setup message if omitted |
| `STRIPE_SECRET_KEY` | No* | Required for real Premium subscriptions |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No* | Required for real Premium subscriptions |
| `STRIPE_WEBHOOK_SECRET` | No* | For Stripe webhook verification |
| `MPESA_*` | No | Placeholder; only if going live with M-Pesa |
| `TWILIO_*` | No | Dev mode (console log) if omitted |

\* Stripe keys are optional — Premium activates instantly in dev mode without them.

### 4. Set up the Neon database

Create a Neon PostgreSQL project and run `npm run db:migrate` locally with its
`DATABASE_URL` configured in `.env.local`. Confirm the migration succeeds
before deploying. Do not run schema migrations as part of the Vercel build.

### 5. Deploy

Push to `main` — Vercel will build and deploy automatically on every push.

## License

MIT
import { Pool } from "pg";
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
const migrations = [
  `CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT, role TEXT NOT NULL DEFAULT 'user', subscription_tier TEXT NOT NULL DEFAULT 'free', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`,
  `CREATE TABLE IF NOT EXISTS meal_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, plan_type TEXT NOT NULL DEFAULT 'week' CHECK (plan_type IN ('day','week','month')), start_date DATE, title TEXT, data JSONB NOT NULL DEFAULT '{}', is_favorite BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`,
  `CREATE TABLE IF NOT EXISTS meals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE, meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')), title TEXT NOT NULL, description TEXT, ingredients JSONB NOT NULL DEFAULT '[]', instructions TEXT[] NOT NULL DEFAULT '{}', prep_time_minutes INT, servings INT NOT NULL DEFAULT 1, estimated_cost NUMERIC, currency TEXT NOT NULL DEFAULT 'KES', nutrition_estimate JSONB, completed BOOLEAN NOT NULL DEFAULT FALSE, completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`,
  `CREATE TABLE IF NOT EXISTS workouts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, category TEXT, description TEXT, instructions JSONB NOT NULL DEFAULT '[]', duration_minutes INT, equipment_needed TEXT[] NOT NULL DEFAULT '{}', scheduled_for DATE, completed BOOLEAN NOT NULL DEFAULT FALSE, completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`,
  `CREATE TABLE IF NOT EXISTS progress_entries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, entry_date DATE NOT NULL UNIQUE, meals_completed INT NOT NULL DEFAULT 0, workouts_completed INT NOT NULL DEFAULT 0, energy_level INT CHECK (energy_level BETWEEN 1 AND 5), mood TEXT, sleep_hours NUMERIC, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`,
  `CREATE TABLE IF NOT EXISTS shopping_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE, name TEXT NOT NULL, category TEXT, quantity NUMERIC, unit TEXT, estimated_cost NUMERIC, currency TEXT NOT NULL DEFAULT 'KES', purchased BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`,
  `CREATE TABLE IF NOT EXISTS subscriptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium')), stripe_customer_id TEXT, stripe_subscription_id TEXT, status TEXT, current_period_end TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`,
  `CREATE TABLE IF NOT EXISTS notification_consent (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, phone_number TEXT, channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('whatsapp','sms','email','in_app')), opted_in BOOLEAN NOT NULL DEFAULT FALSE, verified BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`,
  `CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, body TEXT NOT NULL, channel TEXT NOT NULL DEFAULT 'in_app', read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`,
  `CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_progress_entries_user_id ON progress_entries(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON shopping_items(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`,
];
async function main() {
  const client = await pool.connect();
  try {
    for (const m of migrations) await client.query(m);
    console.log("✅ Neon migration completed successfully");
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});

-- Enable extensions
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  age int check (age >= 0 and age <= 120),
  country text,
  region text,
  language text default 'en',
  dietary_preferences text[] default '{}',
  allergies text[] default '{}',
  food_restrictions text[] default '{}',
  budget_min int,
  budget_max int,
  currency text default 'KES',
  cooking_facilities text,
  prep_time_minutes int,
  preferred_meal_times jsonb default '[]',
  fitness_experience text,
  preferred_activities text[] default '{}',
  equipment text[] default '{}',
  accessibility_requirements text[] default '{}',
  wellness_goals text[] default '{}',
  reminder_channels text[] default '{}',
  reminder_frequency text,
  quiet_hours_start time,
  quiet_hours_end time,
  timezone text default 'UTC',
  notifications_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Meal plans
create table public.meal_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  plan_type text check (plan_type in ('day','week','month')) default 'week',
  start_date date,
  title text,
  data jsonb,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Meals
create table public.meals (
  id uuid default uuid_generate_v4() primary key,
  meal_plan_id uuid references public.meal_plans(id) on delete cascade,
  meal_type text check (meal_type in ('breakfast','lunch','dinner','snack')),
  title text,
  description text,
  ingredients jsonb,
  instructions text[],
  prep_time_minutes int,
  servings int default 1,
  estimated_cost numeric,
  currency text default 'KES',
  nutrition_estimate jsonb,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Workouts
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  category text,
  description text,
  instructions jsonb,
  duration_minutes int,
  equipment_needed text[] default '{}',
  scheduled_for date,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Progress entries
create table public.progress_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  entry_date date unique,
  meals_completed int default 0,
  workouts_completed int default 0,
  energy_level int check (energy_level between 1 and 5),
  mood text,
  sleep_hours numeric,
  notes text,
  created_at timestamptz default now()
);

-- Shopping list items
create table public.shopping_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  meal_plan_id uuid references public.meal_plans(id) on delete cascade,
  name text,
  category text,
  quantity numeric,
  unit text,
  estimated_cost numeric,
  currency text default 'KES',
  purchased boolean default false,
  created_at timestamptz default now()
);

-- Subscriptions
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  plan text check (plan in ('free','premium')) default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notification consent
create table public.notification_consent (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  phone_number text,
  channel text check (channel in ('whatsapp','sms','email','in_app')) default 'in_app',
  opted_in boolean default false,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meals enable row level security;
alter table public.workouts enable row level security;
alter table public.progress_entries enable row level security;
alter table public.shopping_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notification_consent enable row level security;

-- Profiles policies
create policy "Users can access own profile" on public.profiles
  for all using (auth.uid() = id);

-- Meal plans policies
create policy "Users can access own meal plans" on public.meal_plans
  for all using (auth.uid() = user_id);

-- Meals policies
create policy "Users can access own meals" on public.meals
  for all using (auth.uid() = (
    select user_id from public.meal_plans where id = meal_plan_id
  ));

-- Workouts policies
create policy "Users can access own workouts" on public.workouts
  for all using (auth.uid() = user_id);

-- Progress entries policies
create policy "Users can access own progress" on public.progress_entries
  for all using (auth.uid() = user_id);

-- Shopping items policies
create policy "Users can access own shopping items" on public.shopping_items
  for all using (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can access own subscription" on public.subscriptions
  for all using (auth.uid() = user_id);

-- Notification consent policies
create policy "Users can access own notification consent" on public.notification_consent
  for all using (auth.uid() = user_id);

-- Indexes for common queries
create index idx_meal_plans_user_id on public.meal_plans(user_id);
create index idx_meal_plans_start_date on public.meal_plans(start_date);
create index idx_meals_meal_plan_id on public.meals(meal_plan_id);
create index idx_workouts_user_id on public.workouts(user_id);
create index idx_workouts_scheduled_for on public.workouts(scheduled_for);
create index idx_progress_entries_user_id on public.progress_entries(user_id);
create index idx_progress_entries_date on public.progress_entries(entry_date);
create index idx_shopping_items_user_id on public.shopping_items(user_id);
create index idx_shopping_items_purchased on public.shopping_items(purchased);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_notification_consent_user_id on public.notification_consent(user_id);

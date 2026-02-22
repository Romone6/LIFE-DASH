create table if not exists capital_income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  amount_monthly numeric not null,
  stability_score numeric not null default 1,
  volatility_flag boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists capital_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category text not null,
  amount_monthly numeric not null,
  fixed_flag boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists capital_buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric not null,
  priority_weight numeric not null default 1,
  created_at timestamptz default now()
);

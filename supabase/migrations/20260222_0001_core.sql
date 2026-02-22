create extension if not exists "pgcrypto";

create table if not exists profiles (
  user_id uuid primary key,
  sleep_window jsonb,
  preferences jsonb,
  non_negotiables jsonb,
  google_refresh_token text,
  google_calendar_id text,
  twin_silhouette_pref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  priority_weight numeric not null default 1,
  deadline_date date,
  success_metric text,
  created_at timestamptz default now()
);

create table if not exists commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  recurrence_rule text,
  hard_flag boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date_local date not null,
  timezone text not null,
  mode text not null,
  schema_version text not null,
  plan_json jsonb not null,
  audit_status text,
  is_active boolean default false,
  activated_at timestamptz,
  activated_by text,
  created_at timestamptz default now()
);

create unique index if not exists plans_user_date_mode_idx on plans (user_id, date_local, mode);

create table if not exists plan_events (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null,
  user_id uuid not null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz default now()
);

create table if not exists ai_runs (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid,
  user_id uuid,
  model_id text,
  prompt_version text,
  input_hash text,
  output_hash text,
  cost_estimate numeric,
  status text,
  created_at timestamptz default now()
);

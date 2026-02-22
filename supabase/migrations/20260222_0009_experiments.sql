create table if not exists adherence_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date_local date not null,
  metrics jsonb not null,
  created_at timestamptz default now()
);

create table if not exists outcome_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date_local date not null,
  metrics jsonb not null,
  created_at timestamptz default now()
);

create table if not exists baseline_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  window_days int not null,
  metrics jsonb not null,
  created_at timestamptz default now()
);

create table if not exists experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  domain text not null,
  hypothesis text not null,
  parameter_modified text not null,
  control_window_days int not null,
  experiment_window_days int not null,
  evaluation_metric text not null,
  confidence_threshold numeric not null,
  status text not null,
  started_at timestamptz,
  ended_at timestamptz,
  results_summary text,
  created_at timestamptz default now()
);

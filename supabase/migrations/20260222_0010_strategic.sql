create table if not exists strategic_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  category text not null,
  time_horizon_years int not null,
  success_metric text,
  target_value numeric,
  current_value numeric,
  risk_level text,
  confidence_score numeric,
  created_at timestamptz default now()
);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  strategic_goal_id uuid not null,
  level text not null,
  title text not null,
  target_date date,
  created_at timestamptz default now()
);

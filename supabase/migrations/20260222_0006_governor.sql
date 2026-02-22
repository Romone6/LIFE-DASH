create table if not exists governor_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  burnout_score int,
  injury_score int,
  cognitive_score int,
  zone text,
  intervention_active boolean default false,
  last_updated timestamptz default now()
);

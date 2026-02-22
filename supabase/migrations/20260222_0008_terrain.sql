create table if not exists terrain_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  state jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists terrain_state_user_idx on terrain_state (user_id);

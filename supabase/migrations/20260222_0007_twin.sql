create table if not exists twin_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  state jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists twin_state_user_idx on twin_state (user_id);

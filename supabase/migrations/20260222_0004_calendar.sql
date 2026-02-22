create table if not exists calendar_syncs (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null,
  calendar_id text,
  mapping jsonb,
  sync_status text,
  last_sync_at timestamptz,
  errors jsonb,
  created_at timestamptz default now()
);

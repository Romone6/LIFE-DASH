create table if not exists signal_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date_local date not null,
  timezone text not null,
  snapshot jsonb not null,
  created_at timestamptz default now()
);

create unique index if not exists signal_snapshots_user_date_idx on signal_snapshots (user_id, date_local);

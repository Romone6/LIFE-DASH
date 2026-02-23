create table if not exists twin_photo_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'PENDING',
  notes text,
  created_at timestamptz default now()
);

create table if not exists twin_photos (
  id uuid primary key default gen_random_uuid(),
  photo_set_id uuid not null references twin_photo_sets(id) on delete cascade,
  storage_path text not null,
  angle_label text not null,
  width int,
  height int,
  checksum text,
  uploaded_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists twin_jobs (
  id uuid primary key default gen_random_uuid(),
  photo_set_id uuid not null references twin_photo_sets(id) on delete cascade,
  status text not null default 'PENDING',
  started_at timestamptz,
  ended_at timestamptz,
  error_message text,
  worker_version text,
  created_at timestamptz default now()
);

create table if not exists twin_models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  photo_set_id uuid references twin_photo_sets(id) on delete set null,
  mesh_high_path text,
  mesh_low_path text,
  draco_path text,
  fit_coeffs jsonb,
  measurements_json jsonb,
  created_at timestamptz default now(),
  active_flag boolean default false
);

create index if not exists twin_photo_sets_user_idx on twin_photo_sets (user_id);
create index if not exists twin_photos_set_idx on twin_photos (photo_set_id);
create index if not exists twin_jobs_set_idx on twin_jobs (photo_set_id);
create index if not exists twin_models_user_idx on twin_models (user_id);

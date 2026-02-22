create table if not exists audit_reports (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null,
  status text not null,
  severity text not null,
  errors jsonb,
  warnings jsonb,
  risk_register jsonb,
  suggested_fixes jsonb,
  model_id text,
  created_at timestamptz default now()
);

create table if not exists evidence_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  domain text not null,
  claim text not null,
  population_applicability text not null,
  study_type text not null,
  effect_direction text,
  certainty_level text not null,
  risk_notes text,
  source_citation text,
  date_added timestamptz default now(),
  last_reviewed timestamptz default now()
);

create index if not exists evidence_cards_user_idx on evidence_cards (user_id);

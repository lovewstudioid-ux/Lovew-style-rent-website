-- Comcards: multiple named measurement cards per user (self + friends).
-- Run in Supabase SQL Editor (idempotent — safe to re-run).

create table if not exists public.comcards (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  height_cm      text,
  weight_kg      text,
  bust           text,
  waist          text,
  hips           text,
  high_hip       text,
  top_size       text,
  pants_size     text,
  shoe_size      text,
  feet_length_cm text,
  body_type      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists comcards_user_idx on public.comcards(user_id, created_at desc);

alter table public.comcards enable row level security;
drop policy if exists "comcards_own" on public.comcards;
create policy "comcards_own" on public.comcards for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

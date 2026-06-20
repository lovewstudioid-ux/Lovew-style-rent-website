-- Event seating chart: host assigns guests to tables; guests open a public link
-- (or scan a QR), type their name, and see their table.
-- Run once in Supabase → SQL Editor.

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  slug        text unique not null,
  title       text not null,
  event_date  date,
  note        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.event_guests (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  name        text not null,
  table_label text not null,
  seat        text,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists event_guests_event_idx on public.event_guests (event_id);
create index if not exists event_guests_name_idx on public.event_guests (event_id, lower(name));

-- RLS: events + guests are publicly readable (the finder); owner-writable only.
alter table public.events enable row level security;
drop policy if exists "events_select_public" on public.events;
create policy "events_select_public" on public.events for select using (true);
drop policy if exists "events_write_own" on public.events;
create policy "events_write_own" on public.events for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.event_guests enable row level security;
drop policy if exists "event_guests_select_public" on public.event_guests;
create policy "event_guests_select_public" on public.event_guests for select using (true);
drop policy if exists "event_guests_write_own" on public.event_guests;
create policy "event_guests_write_own" on public.event_guests for all
  using (exists (select 1 from public.events e where e.id = event_id and e.user_id = auth.uid()))
  with check (exists (select 1 from public.events e where e.id = event_id and e.user_id = auth.uid()));

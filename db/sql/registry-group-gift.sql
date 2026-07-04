-- Registry: group gifts ("give together"). Run in Supabase SQL Editor.
-- Idempotent — safe to re-run.

-- Item can be a group gift; registry holds payment instructions for guests.
alter table public.registry_items
  add column if not exists is_group boolean not null default false;

alter table public.registries
  add column if not exists payment_note text;

-- Each pledge/payment toward a group gift.
create table if not exists public.registry_contributions (
  id               uuid primary key default gen_random_uuid(),
  item_id          uuid not null references public.registry_items(id) on delete cascade,
  contributor_name text not null,
  amount           numeric not null default 0,
  paid             boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists registry_contributions_item_idx
  on public.registry_contributions(item_id);

alter table public.registry_contributions enable row level security;

-- Guests can see contributors and add their own (public registry).
drop policy if exists "contrib_select_public" on public.registry_contributions;
create policy "contrib_select_public" on public.registry_contributions for select using (true);
drop policy if exists "contrib_insert_public" on public.registry_contributions;
create policy "contrib_insert_public" on public.registry_contributions for insert with check (true);

-- The owner can edit/remove contributions (e.g. confirm paid).
drop policy if exists "contrib_write_own" on public.registry_contributions;
create policy "contrib_write_own" on public.registry_contributions for all
  using (exists (
    select 1 from public.registry_items i
    join public.registries r on r.id = i.registry_id
    where i.id = item_id and r.user_id = auth.uid()))
  with check (exists (
    select 1 from public.registry_items i
    join public.registries r on r.id = i.registry_id
    where i.id = item_id and r.user_id = auth.uid()));

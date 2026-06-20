-- Gift registry: owners create a registry of wished items; guests view a public
-- share page and "reserve" gifts so there are no duplicates.
-- Run once in Supabase → SQL Editor.

create table if not exists public.registries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  slug        text unique not null,
  title       text not null,
  event_date  date,
  note        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.registry_items (
  id                uuid primary key default gen_random_uuid(),
  registry_id       uuid not null references public.registries(id) on delete cascade,
  created_at        timestamptz not null default now(),
  name              text not null,
  category          text not null default 'Other',
  image_url         text,
  image_path        text,
  link_url          text,
  price             text,
  note              text,
  reserved_by_name  text,
  reserved_by_email text,
  reserved_at       timestamptz
);

create index if not exists registry_items_registry_idx on public.registry_items (registry_id, created_at desc);

-- RLS: registries are publicly readable (share page) but owner-writable only.
alter table public.registries enable row level security;
drop policy if exists "registries_select_public" on public.registries;
create policy "registries_select_public" on public.registries for select using (true);
drop policy if exists "registries_write_own" on public.registries;
create policy "registries_write_own" on public.registries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Items: public read; owner write. Guest reservation is done server-side with the
-- service-role client (bypasses RLS, validated in code), so no guest-write policy.
alter table public.registry_items enable row level security;
drop policy if exists "registry_items_select_public" on public.registry_items;
create policy "registry_items_select_public" on public.registry_items for select using (true);
drop policy if exists "registry_items_write_own" on public.registry_items;
create policy "registry_items_write_own" on public.registry_items for all
  using (exists (select 1 from public.registries r where r.id = registry_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.registries r where r.id = registry_id and r.user_id = auth.uid()));

-- Public-read bucket for registry item images.
insert into storage.buckets (id, name, public)
values ('registry', 'registry', true)
on conflict (id) do nothing;

drop policy if exists "registry_obj_insert_own" on storage.objects;
create policy "registry_obj_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'registry' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "registry_obj_delete_own" on storage.objects;
create policy "registry_obj_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'registry' and (storage.foldername(name))[1] = auth.uid()::text);

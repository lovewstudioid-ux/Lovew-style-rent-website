-- Registry v2: owner-defined categories, more item fields, address requests.
-- Run in Supabase SQL Editor (idempotent — safe to re-run).

-- 1. Owner-defined categories -----------------------------------------------
create table if not exists public.registry_categories (
  id          uuid primary key default gen_random_uuid(),
  registry_id uuid not null references public.registries(id) on delete cascade,
  name        text not null,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists registry_categories_registry_idx
  on public.registry_categories(registry_id);

alter table public.registry_categories enable row level security;
drop policy if exists "registry_categories_select_public" on public.registry_categories;
create policy "registry_categories_select_public"
  on public.registry_categories for select using (true);
drop policy if exists "registry_categories_write_own" on public.registry_categories;
create policy "registry_categories_write_own" on public.registry_categories for all
  using (exists (select 1 from public.registries r
                 where r.id = registry_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.registries r
                      where r.id = registry_id and r.user_id = auth.uid()));

-- 2. New item fields --------------------------------------------------------
alter table public.registry_items
  add column if not exists qty         integer not null default 1,
  add column if not exists currency    text,
  add column if not exists size        text,
  add column if not exists color       text,
  add column if not exists category_id uuid references public.registry_categories(id) on delete set null;

-- 3. Address requests (guests ask the owner for a hidden address) ------------
create table if not exists public.registry_address_requests (
  id          uuid primary key default gen_random_uuid(),
  registry_id uuid not null references public.registries(id) on delete cascade,
  guest_name  text not null,
  guest_email text,
  message     text,
  created_at  timestamptz not null default now()
);
create index if not exists registry_address_requests_registry_idx
  on public.registry_address_requests(registry_id);

alter table public.registry_address_requests enable row level security;
-- Anyone (a guest) may submit a request; only the owner may read them.
drop policy if exists "addr_req_insert_public" on public.registry_address_requests;
create policy "addr_req_insert_public"
  on public.registry_address_requests for insert with check (true);
drop policy if exists "addr_req_select_own" on public.registry_address_requests;
create policy "addr_req_select_own" on public.registry_address_requests for select
  using (exists (select 1 from public.registries r
                 where r.id = registry_id and r.user_id = auth.uid()));

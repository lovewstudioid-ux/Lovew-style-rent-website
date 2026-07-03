-- Registry: "Most wanted" priority flag on items.
-- Run in Supabase SQL Editor (idempotent — safe to re-run).

alter table public.registry_items
  add column if not exists is_priority boolean not null default false;
